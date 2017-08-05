/**
 * Эффекты и события для управления имплантами
 */

//import * as helpers from '../helpers/model-helper';

let consts = require('../helpers/constants');
let helpers = require('../helpers/model-helper');
let medHelpers = require('../helpers/medic-helper');
let Chance = require('chance');
let chance = new Chance();
let clones = require("clones");


/**
 * Обработчик события
 * Добавляет имплант в модель
 * { id: implant-id }
 * TODO: доабавить проверку легитимности - т.е. кто именно может выполнять эту операцию 
 */
function addImplantEvent( api, data, event ){
    if(data.id){
     
        if (!api.model.isAlive) {
            api.error("Can't install implant to deadman. Why are you doing this...");
            helpers().addChangeRecord(api, `Операция невозможна для мертвого.`, event.timestamp);
            return;
        }
        let implant = helpers().loadImplant(api, data.id);

        if(implant){
            //let implant = clones(_implant);

            //Убрать предикаты из модели
            delete implant.predicates;
            implant.gID = helpers().uuidv4();

            //Импланты (прошивки) для андроидов
            if(api.model.profileType == "robot"){
                if(implant.class == "firmware"){
                    api.info(`addImplantEvent: Install implant (robot fw): ${implant.displayName}`);
                    implant = api.addModifier(implant);

                    //Добавление сообщения об этом в список изменений в модели
                    helpers().addChangeRecord(api, `Установлено системное ПО: ${implant.displayName}`, event.timestamp);
                
                    return;
                }

                api.error(`addImplantEvent: Can't install implant ${implant.displayName} to robot`);
                return;
            }

            if(api.model.profileType == "human"){
                api.info(`addImplantEvent: Install implant: ${implant.displayName}`);

                //Получить все существующие импланты на эту систему
                let existingImplants = helpers().getImplantsBySystem(api, implant.system );
                
                //Информация про систему
                let systemInfo = consts().medicSystems.find( s => s.name == implant.system);

                let implantForRemove = null;

                //Проверить на дубль - два одинаковых импланта поставить нельзя (старый будет удален)
                //И проверить количество слотов на одной системе
                let oldDoubleImplant = existingImplants.find( m => m.id == implant.id);

                if(oldDoubleImplant){
                    implantForRemove = oldDoubleImplant;
                    api.info(`addImplantEvent: remove doubleimplant: ${implantForRemove.displayName}`); 
                }else if(systemInfo.slots == existingImplants.length){
                //Если слоты кончилиcь - удалить первый
                    implantForRemove = existingImplants[0];
                    api.info(`addImplantEvent: not enough slots, remove: ${implantForRemove.displayName}`); 
                }

                //Если нашли что-то на удаление - удалить это
                if(implantForRemove){
                    helpers().removeImplant(api, implantForRemove, event.timestamp);
                }
             
                //Установка импланта
                implant = api.addModifier(implant);
                api.info(`addImplantEvent: installed implant: ${implant.displayName}!`);

                //Установка системы на которой стоит имплант в "мертвую"
                if(implant.system != "nervous"){
                    medHelpers().setMedSystem(api, implant.system, 0);
                    api.info(`addImplantEvent: set system ${implant.system} to 0 (dead)!`);
                }

                //Если у персонажа были болезни для этой системы их надо найти и удалить
                let illnesses = api.getModifiersByClass("illness").filter( ill => ill.system == implant.system );
                illnesses.forEach( ill => {
                    api.removeModifier(ill.mID);
                    api.removeTimer(`${ill._id}-${ill.mID}`);
                    api.info(`addImplantEvent: remove illness ${ill.id}!`);
                });
                
                //Добавление сообщения об этом в список изменений в модели
                helpers().addChangeRecord(api, `Установлен имплант: ${implant.displayName}`, event.timestamp);

                //Выполнение мгновенного эффекта установки (изменение кубиков сознания пока)
                instantInstallEffect(api, implant);
            }else{
                api.error(`addImplantEvent: it's not human or robot - can't install implant : ${implant.displayName}`);
            }
        }else{
            api.error(`addImplantEvent: implant not found: ${data.id}`);
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

