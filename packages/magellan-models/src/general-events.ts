/**
 * Универсальные события для хакерства и т.д.
 */

import { ModelApiInterface, Event, Condition } from 'alice-model-engine-api';
import Chance = require('chance');
import type = require('type-detect');
import helpers = require('../helpers/model-helper');
import { OrganismModel, MagellanModelApiInterface } from 'magellan-models/helpers/basic-types';
const chance = new Chance();

/**
 * Обработчик события "put-condition"
 * Добавляет текстовое состояние в модель
 *
 * {
 *   text: string,
 *   details: string,
 *   class: string,     //physiology | mind
 *   duration: xxxx
 * }
 * параметр duration задается в секундах, и он опционален.
 * Если не задано, то состояния добавляются на 2 часа
 */

interface PutConditionData {
  text?: string;
  details?: string;
  class?: string;
  duration?: number;
}

function putConditionEvent(api: ModelApiInterface<OrganismModel>, data: PutConditionData, event: Event) {
  if (data.text) {
    const cond = api.addCondition({
      mID: '',
      id: `putCondition-${chance.natural({ min: 0, max: 999999 })}`,
      text: data.text,
      details: data.details ? data.details : data.text,
      class: data.class ? data.class : 'physiology',
    });

    if (cond) {
      api.info(`putConditionEvent: add condition "${cond.text.substring(0, 20)}..."`);

      const durationMs = data.duration ? Number(data.duration) * 1000 : 7200000;

      helpers.addDelayedEvent(api, durationMs, 'remove-condition', { mID: cond.mID }, `remCond-${cond.mID}`);
    }
  }
}

/**
 * Обработчик события "add-change-record"
 * Событие позволяет добавить состояние в список состояний
 *
 * {
 *   text: string,
 *   timestamp: number
 * }
 */
interface AddChangeRecordData {
  text?: string;
  timestamp?: number;
}

function addChangeRecord(api: MagellanModelApiInterface, data: AddChangeRecordData, _: Event) {
  if (data.text && data.timestamp) {
    helpers.addChangeRecord(api, data.text, data.timestamp);
  }
}

module.exports = () => {
  return {
    putConditionEvent,
    addChangeRecord,
  };
};
