import { MindData } from '../models/medicViewModel';
import { DeusExModel } from '@sr2020/interface/models/deus-ex-model';
import { Implant, Illness } from './catalog_types';
import { Effect, Modifier, Condition, EventModelApi, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { cloneDeep } from 'lodash';
import cuid = require('cuid');

/**
 * Хелперы для разных моделей
 */
const consts = require('./constants');
const type = require('type-detect');
const Chance = require('chance');
const chance = new Chance();

function loadImplant(api: EventModelApi<DeusExModel>, id: string) {
  const implant = api.getCatalogObject<Implant>('implants', id.toLowerCase());

  if (!implant) {
    api.error(`loadImplant: implant id=${id} not found!`);
    return null;
  }

  const effects: any[] = [];

  implant.effects.forEach((eID: string) => {
    const effect = api.getCatalogObject<Effect>('effects', eID.toLowerCase());
    if (effect) {
      effect.enabled = true;
      effects.push(effect);
    } else {
      api.error(`loadImplant: effect id=${eID} not found!`);
    }
  });

  implant.effects = effects;
  implant.enabled = true;

  return implant;
}

/**
 * Загружает болезнь и ее эффект из каталога
 */
function loadIllness(api: EventModelApi<DeusExModel>, id: string) {
  const illness = api.getCatalogObject<Illness>('illnesses', id.toLowerCase());

  if (!illness) {
    api.error(`loadIllness: illness id=${id} not found!`);
    return null;
  }

  const effectName = consts.ILLNESS_EFFECT_NAME;
  const effect = api.getCatalogObject<Effect>('effects', effectName);

  if (!effect) {
    api.error(`loadIllness: effect id = ${effectName} not found`);
    return null;
  }
  effect.enabled = true;

  illness.effects = [effect];
  illness.enabled = true;

  return illness;
}

function addChangeRecord(api: EventModelApi<DeusExModel>, text: string, timestamp: number) {
  if (text) {
    if (api.model.changes.length >= consts.MAX_CHANGES_LINES) api.model.changes.shift();

    api.model.changes.push({
      mID: uuidv4(),
      text: text,
      timestamp,
    });
  }
}

//Проверка предиката и возвращение данных для работы эффекта
//Вовращается объект Params (если он есть)
function checkPredicate(api: EffectModelApi<DeusExModel>, mID: string, effectName: string, multi = false) {
  const implant = api.getModifierById(mID);

  //api.info("checkPredicate: " + JSON.stringify(implant));

  if (implant) {
    let predicates = implant.predicates;

    //Если предикатов нет внутри импланта, попробовать загрузить имплант из БД
    if (!predicates) {
      //api.info("checkPredicate: try to load predicates from catalog");

      const catalogImplant = api.getCatalogObject<Implant>('implants', implant.id);
      if (catalogImplant) {
        predicates = catalogImplant.predicates;
      }
    }

    if (predicates) {
      predicates = predicates
        .filter((p) => p.effect == effectName)
        .filter((p) => isGenomeMatch(api, p.variable, p.value) || isMindCubeMatch(api, p.variable, p.value));

      // api.info(`charID: ${api.model._id}: checkPredicate for ${mID}, effect: ${effectName} => ${JSON.stringify(p)}`);

      if (predicates && predicates.length) {
        if (!multi) {
          return predicates[0].params;
        } else {
          return predicates.map((element) => element.params);
        }
      }
    }
  }

  return null;
}

function isMindCubeMatch(api: EffectModelApi<DeusExModel>, variable: string, condition: string) {
  const parts = variable.match(/^([A-G])(\d)/i);
  //console.log(`isMindCubeMatch: ${variable}`);
  if (parts) {
    const cube = parts[1];
    const index = Number(parts[2]);

    //console.log(`isMindCubeMatch: ${cube}${index} ? ${condition} => ${api.model.mind[cube][index]}`);

    if (api.model.mind && api.model.mind[cube]) {
      if (checkValue(api.model.mind[cube][index], condition)) {
        return true;
      }
    }
  }

  return false;
}

//Condition это условие для проверки value.
//имеет форматы: <X, >Y, A-B, X
function checkValue(value: string, condition: string) {
  let l = -1;
  let h = -1;
  const v = Number.parseInt(value);

  l = Number.parseInt(condition);
  if (!Number.isNaN(l)) {
    h = l;
  }

  let parts: RegExpMatchArray | null = null;
  if ((parts = condition.match(/^(\d+)\-(\d+)$/i))) {
    l = Number.parseInt(parts[1]);
    h = Number.parseInt(parts[2]);
  }

  if ((parts = condition.match(/^([<>])(\d+)$/i))) {
    if (parts[1] == '>') {
      l = Number.parseInt(parts[2]) + 1;
      h = Number.MAX_VALUE;
    } else {
      h = Number.parseInt(parts[2]) - 1;
      l = 0;
    }
  }

  //console.log(`checkValue: ${l} ..  ${v} .. ${h}`)

  if (v >= l && v <= h) {
    return true;
  } else {
    return false;
  }
}

function isGenomeMatch(api: EffectModelApi<DeusExModel>, variable: string, value: string) {
  const parts = variable.match(/^Z(\d\d?)/i);

  if (parts) {
    const index = Number.parseInt(parts[1]) - 1;
    if (api.model.genome && index < api.model.genome.length) {
      if (api.model.genome[index] == Number.parseInt(value)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Модифицирует кубики сознания в переданном объекте Mind,
 * в соответствии с "инструкцией"
 * Формат инструкции из таблицы имплантов:
 * A1+X,B2-Y,C2=Z
 *
 * Предполагается что текст инструкции уже нормализован
 * (верхний регистр, без пробелов, через запятую)
 *
 * scaleFactor = 100 (default) to apply normal change
 */
function modifyMindCubes(api: EffectModelApi<DeusExModel>, mind: MindData, changeText: string, scaleFactor: number = 100) {
  api.debug('=======================================================');
  changeText.split(',').forEach((exp) => {
    api.debug(`MMC:  Part: ${exp}`);

    const exParts = exp.match(/([A-G])(\d)([\+\-\=])(\d+)/i);
    if (exParts) {
      const cube = exParts[1];
      const index = Number(exParts[2]);
      const op = exParts[3];
      const mod = Math.trunc((Number(exParts[4]) * scaleFactor) / 100);

      //console.log(`MMC parsed: ${cube}${index} ${op} ${mod}`);
      const beforeOp = mind[cube][index];

      if (mind[cube] && index < mind[cube].length) {
        switch (op) {
          case '+':
            mind[cube][index] += mod;
            break;
          case '-':
            mind[cube][index] -= mod;
            break;
          default:
            mind[cube][index] = mod;
        }
      }

      if (mind[cube][index] < 0) {
        mind[cube][index] = 0;
      }

      if (mind[cube][index] > 100) {
        mind[cube][index] = 100;
      }

      api.info(`modifyMindCubes: ${cube}${index} ${beforeOp} => ${mind[cube][index]}`);
    }
  });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 *  Устанавливает значение состояния системы в модели по ее имени (англоязычному)
 */
function addCharacterCondition(api: EffectModelApi<DeusExModel>, condId: string) {
  if (condId) {
    const condition = api.getCatalogObject<Condition>('conditions', condId);

    if (condition) {
      api.debug(JSON.stringify(condition));
      return addCondition(api, condition);
    } else {
      api.info("Couldn't find condition " + condId);
    }
  }

  return null;
}

/**
 * Проверка - можно ли устанавливать имплант в модель
 * На ОДН и НС па слота, на остальные - по дному
 * Так же нельзя установить один имплант два раза
 */

//  function isImpantCanBeInstalled(api: EventModelApi<DeusExModel>, implant){
//     if(implant && implant.system){
//         let systemInfo = consts.medicSystems.find( s => s.name == implant.system);

//         if(systemInfo){
//             let existingImplants = helpers.getImplantsBySystem( implant.system );

//             if(!existingImplants.find( m => m.id == implant.id) &&
//                 systemInfo.slots >= existingImplants.length){
//                     return true;
//             }
//         }
//     }

//     return false;
// }

/**
 *  Установка отложенного исполнения какого-то эффекта (одноразовый таймер)
 *  Задержка (duration) задается в миллисекундах
 */
function addDelayedEvent(api: EventModelApi<DeusExModel>, duration: number, eventType: string, data: any, prefix = 'delayed') {
  if (api && duration && eventType && data) {
    const timerName = `${prefix}-${chance.natural({ min: 0, max: 999999 })}`;

    api.setTimer(timerName, Number(duration), eventType, data);

    api.info(`Set timer ${timerName} for event ${eventType} after ${duration} ms`);
  } else {
    api.error('Not enough params');
  }
}

/**
 * Удалить элемент по mID из списка
 *
 * Проходит по массиву, если в элементе есть поле mID и оно равно переданному,
 * элемент удаляется (ищется только первый подходящий жлемент)
 *
 * Функция возращает удаленный элемент или null
 */
function removeElementByMID(list: Modifier[], mID: string): Modifier | null {
  if (list) {
    const i = list.findIndex((e) => (e.mID ? e.mID == mID : false));
    if (i != -1) {
      const e = list[i];

      list.slice(i, 1);

      return e;
    }
  }

  return null;
}

const restrictedVars = [
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

/**
 * Изменить простые свойства модели по инструкциям в переданной строке вида
 *  propertyName1+X,propertyName2-Y,propertyName3=Z
 *
 * Можно менять только простые переменные (string/number), не входящие в структуры
 * Нельзя менять ключевые поля, меняемые через специальные события и методы
 */
function modifyModelProperties(api: EffectModelApi<DeusExModel>, operations: string) {
  if (operations) {
    operations
      .replace(/\s/gi, '')
      .split(',')
      .forEach((op) => {
        const parts = op.match(/^([\w\d]+)([\+\-\=])(\d+)$|^([\w\d]+)\=\"(.*)\"$/i);

        if (parts) {
          let result = false;

          if (parts[1]) {
            result = modifyModelDigitProperty(api, parts[1], parts[2], parts[3]);
          } else {
            result = modifyModelStringProperty(api, parts[4], parts[5]);
          }

          if (result) {
            const varName = parts[1] || parts[4];
            api.info(`modifyModelProperties:  ${varName} ==> ${api.model[varName]}`);
          } else {
            api.error(`modifyModelProperties: can't execute operation \"${op}\"`);
          }
        }
      });
  }
}

function modifyModelStringProperty(api: EffectModelApi<DeusExModel>, varName, value) {
  if (restrictedVars.find((v) => varName == v)) {
    return false;
  }

  if (!api.model.hasOwnProperty(varName)) {
    return false;
  }

  const t = type(api.model[varName]);

  if (t != 'string' && t != 'null' && t != 'undefined') {
    return false;
  }

  api.model[varName] = value;

  return true;
}

function modifyModelDigitProperty(api: EffectModelApi<DeusExModel>, varName: string, op: string, value: string) {
  if (restrictedVars.find((v) => varName == v)) {
    return false;
  }

  if (!api.model.hasOwnProperty(varName)) {
    return false;
  }

  const t = type(api.model[varName]);

  if (t != 'number') {
    return false;
  }

  switch (op) {
    case '+':
      api.model[varName] += Number(value);
      break;
    case '-':
      api.model[varName] -= Number(value);
      break;
    case '=':
      api.model[varName] = Number(value);
      break;
    default:
      return false;
  }

  return true;
}

function setTimerToKillModifier(api: EventModelApi<DeusExModel>, modifier: Modifier, timestamp: number) {
  api.setTimer(consts.NARCO_TIME_PREFIX + modifier.mID, timestamp - 1, 'stop-narco-modifier', { mID: modifier.mID });
}

const implantClasses = ['cyber-implant', 'bio-implant', 'illegal-cyber-implant', 'illegal-bio-implant', 'virtual'];

/**
 * Проверяет класс модификатора и возращается true если это имплант
 */
function isImplant(modifier: Modifier) {
  if (modifier.class && implantClasses.find((c) => c == modifier.class)) {
    return true;
  }

  return false;
}

/**
 * Проверяет класс модификатора и возращается true если это болезнь
 */
function isIllness(modifier: Modifier) {
  if (modifier.class && modifier.class == 'illness') {
    return true;
  }

  return false;
}

function getImplantsBySystem(api: EffectModelApi<DeusExModel>, systemName: string) {
  return api.getModifiersBySystem(systemName).filter((m) => isImplant(m));
}

function getAllImplants(api: EventModelApi<DeusExModel>) {
  return api.model.modifiers.filter((m) => isImplant(m));
}

function getAllIlnesses(api: EventModelApi<DeusExModel>) {
  return api.model.modifiers.filter((m) => isIllness(m));
}

function getChanceFromModel(model: DeusExModel) {
  return model.randomSeed ? new Chance(model.randomSeed) : new Chance();
}

function removeImplant(api: EventModelApi<DeusExModel>, implantForRemove: Modifier, timestamp: number) {
  api.removeModifier(implantForRemove.mID);
  addChangeRecord(api, `Удален имплант: ${implantForRemove.displayName} при установке нового`, timestamp);
}

function createEffectModifier(
  api: EventModelApi<DeusExModel>,
  effectName: string,
  modifierId: string,
  displayName: string,
  modifierClass: string,
): Modifier | undefined {
  const effect = api.getCatalogObject<Effect>('effects', effectName);

  if (!effect) {
    api.error("Can't load effect " + effectName);
    return;
  }

  effect.enabled = true;

  const modifier = {
    mID: '',
    id: modifierId,
    name: modifierId,
    displayName: displayName,
    class: modifierClass,
    effects: [effect],
    enabled: true,
  };

  return modifier;
}

function addCondition(api: EffectModelApi<DeusExModel>, condition: Condition): Condition {
  let c = api.model.conditions.find((cond) => cond.id == condition.id);
  if (c) return c;
  c = cloneDeep(condition);
  if (c) {
    if (!c.id) {
      c.id = cuid();
    }
    api.model.conditions.push(c);
  }
  return c;
}

export = {
  loadImplant,
  addChangeRecord,
  uuidv4,
  checkValue,
  isMindCubeMatch,
  isGenomeMatch,
  checkPredicate,
  modifyMindCubes,
  addCondition,
  addCharacterCondition,
  addDelayedEvent,
  removeElementByMID,
  modifyModelProperties,
  setTimerToKillModifier,
  loadIllness,
  getImplantsBySystem,
  getChanceFromModel,
  removeImplant,
  isImplant,
  getAllImplants,
  getAllIlnesses,
  createEffectModifier,
  isIllness,
};
