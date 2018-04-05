/**
 * Эффекты и события для управления имплантами
 */

//import * as helpers from '../helpers/model-helper';

import immortal = require('./s-immortal');
import consts = require('../helpers/constants');
import helpers = require('../helpers/model-helper');
import medhelpers = require('../helpers/medic-helper');
import Chance = require('chance');
const chance = new Chance();
import clone = require("clone");
import { ModelApiInterface } from 'deus-engine-manager-api';


/**
 * Обработчик события
 * Добавляет имплант в модель
 * { id: implant-id }
 * TODO: доабавить проверку легитимности - т.е. кто именно может выполнять эту операцию
 */
function addImplantEvent( api: ModelApiInterface, data, event ){
    if(data.id){

        if (!api.model.isAlive) {
            api.error("Can't install implant to deadman. Why are you doing this...");
            helpers.addChangeRecord(api, `Операция невозможна для мертвого.`, event.timestamp);
            return;
        }
        let implant = helpers.loadImplant(api, data.id);

        if(implant){
            //let implant = clones(_implant);
            //Клонирование перенесено в loadImplant()

            //Убрать предикаты из модели
            delete implant.predicates;
            implant.gID = helpers.uuidv4();

            //Импланты (прошивки) для андроидов
            if(api.model.profileType == "robot"){
                if(implant.class == "firmware"){
                    api.info(`addImplantEvent: Install implant (robot fw): ${implant.displayName}`);
                    implant = api.addModifier(implant);

                    //Добавление сообщения об этом в список изменений в модели
                    helpers.addChangeRecord(api, `Установлено системное ПО: ${implant.displayName}`, event.timestamp);

                    return;
                }

                api.error(`addImplantEvent: Can't install implant ${implant.displayName} to robot`);
                return;
            }

            if(api.model.profileType == "human"){
                api.info(`addImplantEvent: Install implant: ${implant.displayName}`);

                //Получить все существующие импланты на эту систему
                let existingImplants = helpers.getImplantsBySystem(api, implant.system );

                //Информация про систему
                let systemInfo = consts.medicSystems.find( s => s.name == implant.system);
                if (!systemInfo) {
                    api.error('Implants affects non-existant system');
                    return;
                }

                //Проверить на дубль - два одинаковых импланта поставить нельзя (старый будет удален)
                //И проверить количество слотов на одной системе
                let oldDoubleImplant = existingImplants.find( m => m.id == implant.id);

                let implantForRemove: any = null;
                if(oldDoubleImplant){
                    implantForRemove = oldDoubleImplant;
                    api.info(`addImplantEvent: remove doubleimplant: ${oldDoubleImplant.displayName}`);

                } else if(systemInfo.slots == existingImplants.length){
                //Если слоты кончилиcь - удалить первый
                    implantForRemove = existingImplants[0];
                    api.info(`addImplantEvent: not enough slots, remove: ${existingImplants[0].displayName}`);
                }

                //Если нашли что-то на удаление - удалить это
                if(implantForRemove){
                    if(!implantForRemove.unremovable){
                         helpers.removeImplant(api, implantForRemove, event.timestamp);
                    }else{
                        api.error(`addImplantEvent: implant: ${implantForRemove.id} is unremovable. Can't remove old and install new implant. Stop processing!`);
                        return;
                    }
                }

                //Установка импланта
                implant = api.addModifier(implant);
                api.info(`addImplantEvent: installed implant: ${implant.displayName}!`);

                //Установка системы на которой стоит имплант в "мертвую"
                if(implant.system != "nervous"){
                    medhelpers.setMedSystem(api, implant.system, 0);
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
                helpers.addChangeRecord(api, `Установлен имплант: ${implant.displayName}`, event.timestamp);

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
function removeImplantEvent( api: ModelApiInterface, data, event ){
     if(data.mID){
        let implant = api.getModifierById(data.mID);

        if(implant && helpers.isImplant(implant) && !implant.unremovable){

            helpers.addChangeRecord(api, `Удален имплант: ${implant.displayName}`, event.timestamp);
            api.removeModifier(data.mID);
        }else{
            api.error(`removeImplantEvent: can't remove implant/modifier: ${data.mID}`);
        }
    }
}

/**
 *  TODO для подключения
 *  1. Добавить импланты: s_immortal01
 *  2. Добавить события: serenity_immortality_ready, serenity_immortality_go
 *  3. Доработать функцию instantInstallEffect для добавления вызова installSImmortalStage1 при установке
 *  4. Добавить состояние "serenity_immortality_ready" (готовность к модернизации)
 *  5. Добавить эффект serenityImmortalityS01Effect
 */

/**
 * Обработчик мгновенного эффекта установки импланта s_immortal01
 * (бессмертие от Серенити Stage #1)
 *
 * При установке имплант появляется на нервной системе и не делает ничего
 * Через час выводится сообщение
 */
function installSImmortalStage1(api: ModelApiInterface, implant){
    if(implant && implant.id == consts.S_IMMORTAL_NAME_01){
        api.info(`installSImmortalStage1: set timer ${consts.S_IMMORTAL_TIMER_NAME} for 60 min`);

        if(!api.getTimer(consts.S_IMMORTAL_TIMER_NAME)){
            api.setTimer(consts.S_IMMORTAL_TIMER_NAME, 600*1000, "serenity_immortality_ready", { mID: implant.mID })
        }
    }
}

/**
 * Обработчик мгновенного эффекта при установке импланта
 * Пока умеет обрабатывать только install_changeMindCube
 */
function instantInstallEffect(api: ModelApiInterface, implant){
    let params = helpers.checkPredicate(api, implant.mID, "inst_changeMindCube");
    if(params && api.model.mind && params.change){
        helpers.modifyMindCubes(api, api.model.mind, params.change);
    }

    //Бессмертие от серенити
    if(implant.id == consts.S_IMMORTAL_NAME_01){
        installSImmortalStage1(api, implant);
    }
}

/**
 * Обработчик события "отключить имплант"
 * { mID: implant-model-id, duration: xxxx }
 * параметр duration задается в секундах, и он опционален.
 * Если задан - имплант отключается на это время
 */
function disableImplantEvent(api: ModelApiInterface, data, event){
     if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            implant.enabled = false;
            helpers.addChangeRecord(api, `Выключен имплант: ${implant.displayName}`, event.timestamp);
            api.info(`Disabled implant:  mID=${implant.mID} ${implant.displayName}` );

            if(data.duration && Number.isInteger(data.duration)){
                const duration_ms = Number(data.duration)*1000;
                helpers.addDelayedEvent(api, duration_ms, "enable-implant", {mID: implant.mID}, `enable-${implant.mID}` );
            }
        }
     }
}

/**
 * Обработчик события "включить имплант"
 * { mID: implant-model-id }
 */
function enableImplantEvent(api: ModelApiInterface, data, event){
    if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            implant.enabled = true;
            helpers.addChangeRecord(api, `Включен имплант: ${implant.displayName}`, event.timestamp);
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

