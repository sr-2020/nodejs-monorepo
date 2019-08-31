import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { MAX_HISTORY_LINES } from './consts';
import uuid = require('uuid');

export function addHistoryRecord(api: Sr2020CharacterApi, title: string, shortText: string = '', longText = '') {
  if (api.model.history.length >= MAX_HISTORY_LINES) api.model.history.shift();

  api.model.history.push({
    id: uuid.v4(),
    title,
    shortText,
    longText,
    timestamp: api.model.timestamp,
  });
}

export function sendNotificationAndHistoryRecord(api: Sr2020CharacterApi, title: string, shortText: string = '', longText = '') {
  api.sendNotification(title, shortText);
  addHistoryRecord(api, title, shortText, longText);
}
