import { Condition, EffectModelApi, EventModelApi } from '@alice/interface/models/alice-model-engine';
import { OrganismModel } from './basic-types';
import { cloneDeep } from 'lodash';
import consts = require('./constants');
import cuid = require('cuid');

function addChangeRecord(api: EventModelApi<OrganismModel>, text: string, timestamp: number) {
  if (text) {
    if (api.model.changes.length >= consts.MAX_CHANGES_LINES) api.model.changes.shift();

    api.model.changes.push({
      mID: uuidv4(),
      text: text,
      timestamp,
    });
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // tslint:disable:no-bitwise
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    // tslint:enable:no-bitwise
    return v.toString(16);
  });
}

function addCondition(api: EffectModelApi<OrganismModel>, condition: Condition): Condition {
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
  addChangeRecord,
  uuidv4,
  addCondition,
};
