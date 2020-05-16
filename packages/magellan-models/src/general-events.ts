/**
 * Универсальные события для хакерства и т.д.
 */

import { EventModelApi } from 'interface/src/models/alice-model-engine';
import helpers = require('../helpers/model-helper');
import { OrganismModel } from 'magellan-models/helpers/basic-types';

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

function addChangeRecord(api: EventModelApi<OrganismModel>, data: AddChangeRecordData) {
  if (data.text && data.timestamp) {
    helpers.addChangeRecord(api, data.text, data.timestamp);
  }
}

module.exports = () => {
  return {
    addChangeRecord,
  };
};
