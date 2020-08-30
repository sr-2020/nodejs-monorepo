import { DeusExModel } from '@sr2020/interface/models/deus-ex-model';
import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { DamageModifier } from './catalog_types';

/**
 * Хелперы для медицинских моделей
 */

const helpers = require('./model-helper');
const consts = require('./constants');

function addDamage(api: EventModelApi<DeusExModel>, hpLost, timestamp) {
  if (hpLost && api.model.hp && api.model.profileType != 'program' && api.model.profileType != 'exhuman-program') {
    const m = api.getModifierById(consts.DAMAGE_MODIFIER_MID) as DamageModifier | undefined;

    if (m) {
      m.damage += hpLost;
      api.info(`HP Lost: ${hpLost}, summary damage: ${m.damage}`);

      helpers.addChangeRecord(api, `Вы потеряли ${hpLost} HP`, timestamp);
    }
  }
}

/**
 * Эта функция должна проверять не ушли ли рабочие хиты в минус
 * Т.е. если на данный момент maxHP < damage, то надо скорректировать damage так,
 * что бы лечение начиналось с 0 хитов
 */
function restoreDamage(api: EventModelApi<DeusExModel>, hpHeal, timestamp) {
  api.info(`removeDamage: ${hpHeal}`);

  if (hpHeal && api.model.hp) {
    const m = api.getModifierById(consts.DAMAGE_MODIFIER_MID) as DamageModifier | undefined;

    if (m) {
      const maxHP = calcMaxHP(api);

      if (m.damage > maxHP) {
        m.damage = maxHP;
      }

      const dmgBefore = m.damage;

      m.damage -= hpHeal;
      if (m.damage < 0) {
        m.damage = 0;
      }

      api.info(`HP heal: ${hpHeal}, summary damage: ${m.damage}`);
      helpers.addChangeRecord(api, `Вы восстановили ${dmgBefore - m.damage} HP`, timestamp);
    }
  }
}

/**
 *  Посчитать текущее MaxHP для всех имплантов вида "+2 хита" и базовых хитов персонажа
 */
function calcMaxHP(api) {
  const maxHP = api.model.modifiers
    .filter((m) => m.enabled)
    .map((m) => helpers.checkPredicate(api, m.mID, 'change-max-hp'))
    .map((p) => (p ? p.maxHp : 0))
    .reduce((acc, val) => acc + val, api.model.maxHp);

  return maxHP <= 6 ? maxHP : 6;
}

/**
 * Поставить состояние системы по названию
 */
function setMedSystem(api: EventModelApi<DeusExModel>, system, value) {
  const i = consts.medicSystems.findIndex((m) => m.name == system);

  if (i != -1 && api.model.systems) {
    api.model.systems[i] = value;
  }
}

/**
 * Проверить: есть ли в организме неработающие системы, на которых нет включенных имплантов
 * (т.е. в тяжелом ли ранении персонаж)
 * Возвращает массив с номерами таких систем (пустой, если таких систем нет)
 * Если у персонажа нет систем - возвращает пустой массив
 */
function getDeadSystems(api) {
  const ret: number[] = [];

  if (api.model.systems) {
    api.model.systems.forEach((sys, i) => {
      const implants = helpers.getImplantsBySystem(api, consts.medicSystems[i].name).filter((m) => m.enabled);

      if (!sys && !implants.length) {
        ret.push(i);
      }
    });
  }

  return ret;
}

/**
 * Вернуть строку описывающую состояние систем
 */
function getSystemsStateString(api) {
  if (api.model.systems) {
    const systemsStr = api.model.systems
      .map((s, i) => {
        const imps = helpers.getImplantsBySystem(api, consts.medicSystems[i].name).filter((m) => m.enabled);
        const impDat = imps.length ? ` (+${imps.length})` : '';

        return `${consts.medicSystems[i].name.substring(0, 3)}: ${s}${impDat}`;
      })
      .join(',');

    return '[ ' + systemsStr + ' ]';
  }

  return '';
}

function getSystemID(name) {
  return consts.medicSystems.findIndex((s) => s.name == name);
}

function isSystemAlive(api: EventModelApi<DeusExModel>, name) {
  const i = consts.medicSystems.findIndex((s) => s.name == name);
  if (i != -1 && api.model.systems) {
    return api.model.systems[i] == 1;
  }
}

/**
 * Удалить болезь
 */
function removeIllness(api: EventModelApi<DeusExModel>, mID) {
  if (mID) {
    const index = api.model.modifiers.findIndex((m) => m.mID == mID);

    if (index != -1) {
      const ill = api.model.modifiers[index];

      api.info(`removeIllness: remove ${ill.id} and timer ${ill.id}-${ill.mID}`);

      api.removeTimer(`${ill.id}-${ill.mID}`);
      api.model.modifiers.splice(index, 1);
    } else {
      api.error(`removeIllness: illness ${mID} not found!`);
    }
  }
}

export = {
  addDamage,
  restoreDamage,
  calcMaxHP,
  setMedSystem,
  getDeadSystems,
  getSystemsStateString,
  getSystemID,
  isSystemAlive,
  removeIllness,
};
