/**
 * Универсальные события связанные с VR
 */

let helpers = require('../helpers/model-helper');
let consts = require('../helpers/constants');


/**
 * Обработчик события "enterVr" (вход в VR)
 *
 * Сохраняет информацию о времени входа в VR в модели
 * (время события - время входа)
 * 
 */
function enterVREvent( api, data, event ){  
    api.model.lastVREnterTimestamp = event.timestamp;
    helpers().addChangeRecord(api, "Вы вошли в VR", event.timestamp);
}

/**
 * Обработчик события "exitVr" (выход из VR)
 *
 * Сохраняет информацию о времени нахождения в VR в последний раз
 * И увеличивает счетчик суммарного нахождения в VR для персонажа
 * (время события - время выхода)
 */
function exitVREvent( api, data, event ){
    if(api.model.lastVREnterTimestamp && api.model.lastVREnterTimestamp < event.timestamp){
        api.model.lastVREnterDuration = event.timestamp - api.model.lastVREnterTimestamp;
        
        if(!api.model.totalSpentInVR){
            api.model.totalSpentInVR = 0;
        }

        api.model.totalSpentInVR += api.model.lastVREnterDuration;

        helpers().addChangeRecord(api, `Вы вышли из VR. Время нахождения в VR: ${Math.round(api.model.totalSpentInVR/1000/60)} мин.`, event.timestamp);
    }
}

module.exports = () => {
    return {
        enterVREvent,
        exitVREvent
    };
};