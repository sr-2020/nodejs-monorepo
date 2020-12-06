/**
 * Универсальные события связанные с VR
 */

import helpers = require('../helpers/model-helper');
import { DeusExModel } from '../deus-ex-model';
import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';

/**
 * Обработчик события "enterVR" (вход в VR)
 *
 * Сохраняет информацию о времени входа в VR в модели
 * (время события - время входа)
 *
 */
function enterVREvent(api: EventModelApi<DeusExModel>, data) {
  if (!api.model.isAlive) {
    api.error("Dead can't enter VR. Or any other location.");
    helpers.addChangeRecord(api, `Операция невозможна для мертвого.`, api.model.timestamp);
    return;
  }
  api.model.lastVREnterTimestamp = api.model.timestamp;
  helpers.addChangeRecord(api, 'Вы вошли в VR', api.model.timestamp);
}

/**
 * Обработчик события "exitVR" (выход из VR)
 *
 * Сохраняет информацию о времени нахождения в VR в последний раз
 * И увеличивает счетчик суммарного нахождения в VR для персонажа
 * (время события - время выхода)
 */
function exitVREvent(api: EventModelApi<DeusExModel>, data) {
  if (!api.model.isAlive) {
    api.error("Dead can't exit VR. Or any other location.");
    helpers.addChangeRecord(api, `Операция невозможна для мертвого.`, api.model.timestamp);
    return;
  }
  if (api.model.profileType == 'exhuman-program' || api.model.profileType == 'program') {
    api.error("Program can't exit hard drives.");
    helpers.addChangeRecord(api, `Операция невозможна для программ.`, api.model.timestamp);
    return;
  }
  if (api.model.lastVREnterTimestamp && api.model.lastVREnterTimestamp < api.model.timestamp) {
    api.model.lastVREnterDuration = api.model.timestamp - api.model.lastVREnterTimestamp;

    if (!api.model.totalSpentInVR) {
      api.model.totalSpentInVR = 0;
    }

    api.model.totalSpentInVR += api.model.lastVREnterDuration;

    helpers.addChangeRecord(
      api,
      `Вы вышли из VR. Время нахождения в VR: ${Math.round(api.model.lastVREnterDuration / 1000 / 60)} мин.`,
      api.model.timestamp,
    );
  } else {
    api.error(`При обработке выхода из VR время входа ${api.model.lastVREnterTimestamp}; сейчас ${api.model.timestamp}`);
  }
}

module.exports = () => {
  return {
    enterVREvent,
    exitVREvent,
  };
};
