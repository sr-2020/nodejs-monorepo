/**
 * Универсальные события для хакерства и т.д.
 */

import type = require('type-detect');
import helpers = require('../helpers/model-helper');
import consts = require('../helpers/constants');
import Chance = require('chance');
import { DeusExModelApiInterface } from '../helpers/model';
import { Event } from '@sr2020/interface/models/alice-model-engine';
let chance = new Chance();

/**
 * Обработчик события "put-condition"
 * Добавляет текстовое состояние в модель
 * параметр duration задается в секундах, и он опционален.
 * Если не задано, то состояния добавляются на 2 часа
 */
interface PutConditionData {
  text: string;
  details: string;
  class: 'physiology' | 'mind';
  duration?: number;
}

function putConditionEvent(api: DeusExModelApiInterface, data: PutConditionData, _: Event) {
  if (data.text) {
    let cond = api.addCondition({
      id: `putCondition-${chance.natural({ min: 0, max: 999999 })}`,
      text: data.text,
      details: data.details ? data.details : data.text,
      class: data.class ? data.class : 'physiology',
    });

    if (cond) {
      api.info(`putConditionEvent: add condition "${cond.text.substring(0, 20)}..."`);

      const duration_ms = data.duration ? Number(data.duration) * 1000 : 7200000;

      helpers.addDelayedEvent(api, duration_ms, 'remove-condition', { id: cond.id }, `remCond-${cond.id}`);
    }
  }
}

/**
 * Обработчик события "remove-condition"
 *
 * Удаляет состояние персонажа
 */
interface RemoveConditionData {
  id?: string;
}

function removeConditionEvent(api: DeusExModelApiInterface, data: RemoveConditionData, _: Event) {
  if (data.id) {
    let i = api.model.conditions.findIndex((c) => c.id == data.id);

    if (i != -1) {
      let text = api.model.conditions[i].text;
      api.model.conditions.splice(i, 1);

      api.info(`removeConditionEvent: removed condition "${text.substring(0, 20)}..."`);
    }
  }
}

/**
 * Обработчик события "send-message"
 * Отправляет текстовое сообщение в модель (в список messages)
 */
interface SendMessageData {
  title?: string;
  text?: string;
}

function sendMessageEvent(api: DeusExModelApiInterface, data: SendMessageData, _: Event) {
  if (data.title && api.model.messages) {
    let message = {
      mID: helpers.uuidv4(),
      title: data.title,
      text: data.text ? data.text : data.title,
    };

    api.model.messages.push(message);
    api.info(`sendMessageEvent: send message "${message.text.substring(0, 20)}..."`);
  }
}

/**
 * Обработчик события "change-mind-cube"
 * Событие позволяет поменять кубик (или несколько кубиков) сознания на новое значение
 * В operations передается строка операций по изменению кубиков в следующем формате:
 *        A1+20,B2=33,B4-10
 *
 * Т.е. набор опраций по изменнию (+-=) через запятую (формат как в списке имплантов)
 *
 * В явном виде игроку информация об изменении не сообщается
 */
interface ChangeMindCubeData {
  operations: string;
}

function changeMindCubeEvent(api: DeusExModelApiInterface, data: ChangeMindCubeData, _: Event) {
  api.error('=============================');

  if (data.operations) {
    let norm = data.operations.toUpperCase().replace(/\s/gi, '');
    helpers.modifyMindCubes(api, api.model.mind, norm);
  }
}

/**
 * Обработчик события "add-change-record"
 * Событие позволяет добавить состояние в список состояний
 */
interface AddChangeRecordData {
  text?: string;
  timestamp?: number;
}

function addChangeRecord(api: DeusExModelApiInterface, data: AddChangeRecordData, _: Event) {
  if (data.text && data.timestamp) {
    helpers.addChangeRecord(api, data.text, data.timestamp);
  }
}

/**
 * Обработчик события "change-model-variable"
 * Универсальное событие для изменения любой простой (т.е. не внутри каких-то вложенных структур)
 * переменной в модели. Переменные, тип которых Object/Array менять запрещается.
 * Переменные: login,_id, timestamp, mail, profileType менять запрещается
 *
 * Изменение проходит "тихо" для игрока - ни в каких списках изменений оно не отображается
 * (поэтому так лучше не менять что-то игровое и важное о чем надо знать)
 */
interface ChangeModelVariableData {
  name?: string;
  value?: any;
}

function changeModelVariableEvent(api: DeusExModelApiInterface, data: ChangeModelVariableData, _: Event) {
  if (data.name && data.value) {
    let restricted = [
      '_id',
      'id',
      'hp',
      'maxHp',
      'login',
      'mail',
      'profileType',
      'timestamp',
      'mind',
      'genome',
      'systems',
      'conditions',
      'modifiers',
      'changes',
      'messages',
      'timers',
    ];
    if (restricted.find((e) => e == data.name)) {
      return;
    }

    if (api.model[data.name]) {
      let t = type(api.model[data.name]);

      if (t == 'number' || t == 'string' || t == 'null' || t == 'undefined') {
        let oldValue = api.model[data.name];

        api.model[data.name] = data.value;

        api.info(`changeModelVariable:  ${data.name}:  ${oldValue} ==> ${api.model[data.name]}`);
      }
    }
  }
}

/**
 * Обработчик события "change-android-owner"
 * Позволяет изменить владельца андроида
 *
 * Игрок видит в списке изменний информацию об данном изменении
 */
interface ChangeAndroidOwnerData {
  owner?: string;
}

function changeAndroidOwnerEvent(api: DeusExModelApiInterface, data: ChangeAndroidOwnerData, event: Event) {
  if (data.owner && api.model.profileType == 'robot') {
    api.info(`changeAndroidOwner:  ${api.model.owner} ===> ${data.owner}`);

    api.model.owner = data.owner;
    helpers.addChangeRecord(api, `Изменен владелец андроида. Новый владелец: ${api.model.owner}`, event.timestamp);
  }
}

/**
 * Обработчик события "change-memory"
 * Событие позволяет добавить или удалить элементы памяти персонажа
 *
 * Игрок увидет информацию о новых воспоминаниях в списке изменений
 * Передаваемые данные:
 * {
 *      remove: [mID, mID, mID]
 *      add: [
 *          {
 *              title: string,
 *              text?: string,
 *              url?: string
 *          },
 *          {
 *              title: string,
 *              text?: string,
 *              url?: string
 *          }
 *      ]
 * }
 */
function changeMemoryEvent(api: DeusExModelApiInterface, data, event: Event) {
  if (data.remove) {
    data.remove.forEach((mID) => {
      api.info(`changeMemory: remove element with ${mID}`);
      api.model.memory = api.model.memory.filter((mem) => (mem.mID ? mem.mID != mID : true));
    });
  }

  if (data.update) {
    data.update.forEach((mem) => {
      if (mem.title && mem.mID) {
        let elem = api.model.memory.find((e) => e.mID == mem.mID);
        if (elem) {
          elem.title = mem.title;
          if (mem.text) {
            elem.text = mem.text;
          }
          if (mem.url) {
            elem.url = mem.url;
          }
        }
      }
    });
  }

  if (data.add) {
    data.add.forEach((mem) => {
      if (mem.title) {
        mem.mID = helpers.uuidv4();
        api.model.memory.push(mem);
      }
    });

    if (data.add.length) {
      helpers.addChangeRecord(api, `Вы вспомнили о важных эпизодах в вашей жизни!`, event.timestamp);
    }
  }
}

/**
 * Обработчик события "change-insurance"
 * Позволяет изменить страховку
 *
 * Игрок видит в списке изменний информацию об данном событии
 */
interface ChangeInsuranceData {
  Insurance: string;
  Level: number;
}

function changeInsuranceEvent(api: DeusExModelApiInterface, data: ChangeInsuranceData, event: Event) {
  if (data.Insurance && data.Level) {
    api.info(`changeInsurance: new insurance ${data.Insurance}, level: ${data.Level}`);

    api.model.insurance = data.Insurance;

    if (api.model.insurance.toLowerCase() != 'none') {
      api.model.insuranceLevel = data.Level;
      api.model.insuranceDiplayName = `${consts.InsuranceDisplay[api.model.insurance]}, L: ${api.model.insuranceLevel}`;
    } else {
      api.model.insuranceLevel = 0;
      api.model.insuranceDiplayName = 'Нет';
    }

    helpers.addChangeRecord(api, `Заменена страховка. Новая страховка: ${api.model.insuranceDiplayName}`, event.timestamp);
  }
}

module.exports = () => {
  return {
    putConditionEvent,
    removeConditionEvent,
    sendMessageEvent,
    changeModelVariableEvent,
    changeAndroidOwnerEvent,
    changeMemoryEvent,
    changeMindCubeEvent,
    changeInsuranceEvent,
    addChangeRecord,
  };
};
