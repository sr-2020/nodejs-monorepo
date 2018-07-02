/**
 * Универсальные события связанные с VR
 */

import { ModelApiInterface } from 'deus-engine-manager-api';
import helpers = require('../helpers/model-helper');

/**
 * Обработчик события "enterVr" (вход в VR)
 *
 * Сохраняет информацию о времени входа в VR в модели
 * (время события - время входа)
 *
 */
function enterVREvent(api: ModelApiInterface, _data, event) {
  if (!api.model.isAlive) {
    api.error("Dead can't enter VR. Or any other location.");
    helpers.addChangeRecord(api, `Операция невозможна для мертвого.`, event.timestamp);
    return;
  }
  api.model.lastVREnterTimestamp = event.timestamp;
  helpers.addChangeRecord(api, 'Вы вошли в VR', event.timestamp);
}

/**
 * Обработчик события "exitVr" (выход из VR)
 *
 * Сохраняет информацию о времени нахождения в VR в последний раз
 * И увеличивает счетчик суммарного нахождения в VR для персонажа
 * (время события - время выхода)
 */
function exitVREvent(api: ModelApiInterface, _data, event) {
  if (!api.model.isAlive) {
    api.error("Dead can't exit VR. Or any other location.");
    helpers.addChangeRecord(api, `Операция невозможна для мертвого.`, event.timestamp);
    return;
  }
  if (api.model.profileType == 'exhuman-program' || api.model.profileType == 'program') {
    api.error("Program can't exit hard drives.");
    helpers.addChangeRecord(api, `Операция невозможна для программ.`, event.timestamp);
    return;
  }
  if (api.model.lastVREnterTimestamp && api.model.lastVREnterTimestamp < event.timestamp) {
    api.model.lastVREnterDuration = event.timestamp - api.model.lastVREnterTimestamp;

    if (!api.model.totalSpentInVR) {
      api.model.totalSpentInVR = 0;
    }

    api.model.totalSpentInVR += api.model.lastVREnterDuration;

    helpers.addChangeRecord(api,
      `Вы вышли из VR. Время нахождения в VR: ${Math.round(api.model.lastVREnterDuration / 1000 / 60)} мин.`,
      event.timestamp);
  } else {
    api.error(`При обработке выхода из VR время входа ${api.model.lastVREnterTimestamp}; сейчас ${event.timestamp}`);
  }
}

module.exports = () => {
  return {
    enterVREvent,
    exitVREvent,
  };
};
