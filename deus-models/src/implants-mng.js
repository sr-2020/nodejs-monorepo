/**
 * Эффекты и события для управления имплантами
 */

//import * as helpers from '../helpers/model-helper';

let helpers = require('../helpers/model-helper');
let medHelpers = require('../helpers/medic-helper');
let Chance = require('chance');
let chance = new Chance();

/**
 * Обработчик события
 * Добавляет имплант в модель
 * { id: implant-id }
 * TODO: доабавить проверку легитимности - т.е. кто именно может выполнять эту операцию 
 */
function addImplantEvent( api, data, event ){
    if(data.id){
        let implant = helpers().loadImplant(api, data.id);

        if(implant){
            if(helpers().isImpantCanBeInstalled(api, implant)){
                api.info(`Install implant: ${implant.displayName}`);

                implant.gID = helpers().uuidv4();

                //Установка импланта
                implant = api.addModifier(implant);

                //Установка системы на которой стоит имплант в "мертвую"
                if(implant.system != "nervous"){
                    medHelpers().setMedSystem(api, implant.system, 0);
                }
                
                //Добавление сообщения об этом в список изменений в модели
                helpers().addChangeRecord(api, `Установлен имплант: ${implant.displayName}`, event.timestamp);

                //Выполнение мгновенного эффекта установки (изменение кубиков сознания пока)
                instantInstallEffect(api, implant);
            }else{
                api.info(`Can't install implant (not enough slots or doubling): ${implant.displayName}`);
            }
        }   
    }
}

/**
 * Обработчик события
 * Удвляет имплант из модели
 * { mID: implant-model-id }
 * TODO: доабавить проверку легитимности - т.е. кто именно может выполнять эту операцию 
 */
function removeImplantEvent( api, data, event ){
     if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            helpers().addChangeRecord(api, `Удален имплант: ${implant.displayName}`, event.timestamp);
            api.removeModifier(data.mID);
        }
    }
}

/**
 * Обработчик мгновенного эффекта при установке импланта
 * Пока умеет обрабатывать только install_changeMindCube
 */
function instantInstallEffect(api, implant){
    let params = helpers().checkPredicate(api, implant.mID, "inst_changeMindCube");
    if(params && api.model.mind && params.change){
        helpers().modifyMindCubes(api, api.model.mind, params.change);
    }
}

/**
 * Обработчик события "отключить имплант"
 * { mID: implant-model-id, duration: xxxx }
 * параметр duration задается в секундах, и он опционален.
 * Если задан - имплант отключается на это время 
 */
function disableImplantEvent(api, data, event){
     if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            implant.enabled = false;
            helpers().addChangeRecord(api, `Выключен имплант: ${implant.displayName}`, event.timestamp);
            api.info(`Disabled implant:  mID=${implant.mID} ${implant.displayName}` );

            if(data.duration && Number.isInteger(data.duration)){
                duration_ms = Number(data.duration)*1000;
                helpers().addDelayedEvent(api, duration_ms, "enable-implant", {mID: implant.mID}, `enable-${implant.mID}` );            
            }
        }
     }
}   

/**
 * Обработчик события "включить имплант"
 * { mID: implant-model-id }
 */
function enableImplantEvent(api, data, event){
    if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            implant.enabled = true;
            helpers().addChangeRecord(api, `Включен имплант: ${implant.displayName}`, event.timestamp);
            api.info(`Enabled implant:  mID=${implant.mID} ${implant.displayName}` );
        }
     }
}


module.exports = () => {
    return {
        addImplantEvent,
        removeImplantEvent,
        disableImplantEvent,
        enableImplantEvent
    };
};

