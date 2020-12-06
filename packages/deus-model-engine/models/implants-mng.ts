import * as moment from 'moment';
import { DeusExModel } from '../deus-ex-model';
import { EventModelApi } from '@alice/interface/models/alice-model-engine';
import { ImplantModifier } from '../helpers/catalog_types';
import consts = require('../helpers/constants');
import helpers = require('../helpers/model-helper');
import medhelpers = require('../helpers/medic-helper');

/**
 * Обработчик события
 * Добавляет имплант в модель
 * { id: implant-id }
 */
function addImplantEvent(api: EventModelApi<DeusExModel>, data: { id: string }) {
  if (data.id) {
    if (!api.model.isAlive) {
      api.error("Can't install implant to deadman. Why are you doing this...");
      helpers.addChangeRecord(api, `Операция невозможна для мертвого.`, api.model.timestamp);
      return;
    }
    const loadedImplant = helpers.loadImplant(api, data.id);

    if (!loadedImplant) {
      api.error(`addImplantEvent: implant not found: ${data.id}`);
      return;
    }
    //Убрать предикаты из модели
    delete loadedImplant.predicates;
    const implant: ImplantModifier = {
      ...loadedImplant,
      mID: '',
      enabled: true,
    };

    //Импланты (прошивки) для андроидов
    if (api.model.profileType == 'robot') {
      if (implant.class == 'firmware') {
        api.info(`addImplantEvent: Install implant (robot fw): ${implant.displayName}`);
        implant.mID = api.addModifier(implant).mID;

        //Добавление сообщения об этом в список изменений в модели
        helpers.addChangeRecord(api, `Установлено системное ПО: ${implant.displayName}`, api.model.timestamp);

        return;
      }

      api.error(`addImplantEvent: Can't install implant ${implant.displayName} to robot`);
      return;
    }

    if (api.model.profileType == 'human') {
      api.info(`addImplantEvent: Install implant: ${implant.displayName}`);

      //Получить все существующие импланты на эту систему
      const existingImplants = helpers.getImplantsBySystem(api, implant.system!);

      //Информация про систему
      const systemInfo = consts.medicSystems.find((s) => s.name == implant.system);
      if (!systemInfo) {
        api.error('Implants affects non-existant system');
        return;
      }

      //Проверить на дубль - два одинаковых импланта поставить нельзя (старый будет удален)
      //И проверить количество слотов на одной системе
      const oldDoubleImplant = existingImplants.find((m) => m.id == implant.id);

      let implantForRemove: any = null;
      if (oldDoubleImplant) {
        implantForRemove = oldDoubleImplant;
        api.info(`addImplantEvent: remove doubleimplant: ${oldDoubleImplant.displayName}`);
      } else if (systemInfo.slots == existingImplants.length) {
        //Если слоты кончилиcь - удалить первый
        implantForRemove = existingImplants[0];
        api.info(`addImplantEvent: not enough slots, remove: ${existingImplants[0].displayName}`);
      }

      //Если нашли что-то на удаление - удалить это
      if (implantForRemove) {
        if (!implantForRemove.unremovable) {
          helpers.removeImplant(api, implantForRemove, api.model.timestamp);
        } else {
          api.error(
            `addImplantEvent: implant: ${implantForRemove.id} is unremovable. Can't remove old and install new implant. Stop processing!`,
          );
          return;
        }
      }

      //Установка импланта
      implant.mID = api.addModifier(implant).mID;
      api.info(`addImplantEvent: installed implant: ${implant.displayName}!`);

      //Установка системы на которой стоит имплант в "мертвую"
      if (implant.system != 'nervous') {
        medhelpers.setMedSystem(api, implant.system, 0);
        api.info(`addImplantEvent: set system ${implant.system} to 0 (dead)!`);
      }

      //Если у персонажа были болезни для этой системы их надо найти и удалить
      const illnesses = api.getModifiersByClass('illness').filter((ill) => ill.system == implant.system);
      illnesses.forEach((ill) => {
        api.removeModifier(ill.mID);
        api.removeTimer(`${ill._id}-${ill.mID}`);
        api.info(`addImplantEvent: remove illness ${ill.id}!`);
      });

      //Добавление сообщения об этом в список изменений в модели
      helpers.addChangeRecord(api, `Установлен имплант: ${implant.displayName}`, api.model.timestamp);

      //Выполнение мгновенного эффекта установки (изменение кубиков сознания пока)
      instantInstallEffect(api, implant);
    } else {
      api.error(`addImplantEvent: it's not human or robot - can't install implant : ${implant.displayName}`);
    }
  }
}

/**
 * Обработчик события
 * Удвляет имплант из модели
 * { mID: implant-model-id }
 */
function removeImplantEvent(api: EventModelApi<DeusExModel>, data) {
  if (data.mID) {
    const implant = api.getModifierById(data.mID);

    if (implant && helpers.isImplant(implant) && !implant.unremovable) {
      helpers.addChangeRecord(api, `Удален имплант: ${implant.displayName}`, api.model.timestamp);
      api.removeModifier(data.mID);
    } else {
      api.error(`removeImplantEvent: can't remove implant/modifier: ${data.mID}`);
    }
  }
}

/**
 *  1. Добавить импланты: s_immortal01
 *  2. Добавить события: serenity-immortality-ready, serenity-immortality-go
 *  3. Доработать функцию instantInstallEffect для добавления вызова installSImmortalStage1 при установке
 *  4. Добавить состояние "serenity-immortality-ready" (готовность к модернизации)
 *  5. Добавить эффект serenityImmortalityS01Effect
 */

/**
 * Обработчик мгновенного эффекта установки импланта s_immortal01
 * (бессмертие от Серенити Stage #1)
 *
 * При установке имплант появляется на нервной системе и не делает ничего
 * Через час выводится сообщение
 */
function installSImmortalStage1(api: EventModelApi<DeusExModel>, implant) {
  if (implant && implant.id == consts.S_IMMORTAL_NAME_01) {
    api.info(`installSImmortalStage1: set timer ${consts.S_IMMORTAL_TIMER_NAME} for 60 min`);

    if (!api.getTimer(consts.S_IMMORTAL_TIMER_NAME)) {
      api.setTimer(consts.S_IMMORTAL_TIMER_NAME, '', moment.duration(600, 'seconds'), 'serenity-immortality-ready', { mID: implant.mID });
    }
  }
}

/**
 * Обработчик мгновенного эффекта при установке импланта
 * Пока умеет обрабатывать только install_changeMindCube
 */
function instantInstallEffect(api: EventModelApi<DeusExModel>, implant) {
  const params = helpers.checkPredicate(api, implant.mID, 'inst_changeMindCube');
  if (params && api.model.mind && params.change) {
    helpers.modifyMindCubes(api, api.model.mind, params.change);
  }

  //Бессмертие от серенити
  if (implant.id == consts.S_IMMORTAL_NAME_01) {
    installSImmortalStage1(api, implant);
  }
}

/**
 * Обработчик события "отключить имплант"
 * { mID: implant-model-id, duration: xxxx }
 * параметр duration задается в секундах, и он опционален.
 * Если задан - имплант отключается на это время
 */
function disableImplantEvent(api: EventModelApi<DeusExModel>, data) {
  if (data.mID) {
    const implant = api.getModifierById(data.mID);
    if (implant) {
      implant.enabled = false;
      helpers.addChangeRecord(api, `Выключен имплант: ${implant.displayName}`, api.model.timestamp);
      api.info(`Disabled implant:  mID=${implant.mID} ${implant.displayName}`);

      if (data.duration && Number.isInteger(data.duration)) {
        const duration_ms = Number(data.duration) * 1000;
        helpers.addDelayedEvent(api, duration_ms, 'enable-implant', { mID: implant.mID }, `enable-${implant.mID}`);
      }
    }
  }
}

/**
 * Обработчик события "включить имплант"
 * { mID: implant-model-id }
 */
function enableImplantEvent(api: EventModelApi<DeusExModel>, data) {
  if (data.mID) {
    const implant = api.getModifierById(data.mID);
    if (implant) {
      implant.enabled = true;
      helpers.addChangeRecord(api, `Включен имплант: ${implant.displayName}`, api.model.timestamp);
      api.info(`Enabled implant:  mID=${implant.mID} ${implant.displayName}`);
    }
  }
}

module.exports = () => {
  return {
    addImplantEvent,
    removeImplantEvent,
    disableImplantEvent,
    enableImplantEvent,
  };
};
