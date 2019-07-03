import { ModelApiInterface } from 'interface/src/models/alice-model-engine';

/**
 * Хелперы для разных моделей
 */
import Chance = require('chance');
import consts = require('./constants');
import { OrganismModel, MagellanModelApiInterface } from './basic-types';
const chance = new Chance();

function addChangeRecord(api: MagellanModelApiInterface, text: string, timestamp: number) {
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

/**
 * Проверка - можно ли устанавливать имплант в модель
 * На ОДН и НС па слота, на остальные - по дному
 * Так же нельзя установить один имплант два раза
 */

//  function isImpantCanBeInstalled(api: ModelApiInterface, implant){
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
function addDelayedEvent(api: ModelApiInterface<OrganismModel>, duration: number, eventType: string, data: any, prefix = 'delayed') {
  if (api && duration && eventType && data) {
    const timerName = `${prefix}-${chance.natural({ min: 0, max: 999999 })}`;

    api.setTimer(timerName, Number(duration), eventType, data);

    api.info(`Set timer ${timerName} for event ${eventType} after ${duration} ms`);
  } else {
    api.error('Not enough params');
  }
}

export = {
  addChangeRecord,
  uuidv4,
  addDelayedEvent,
};
