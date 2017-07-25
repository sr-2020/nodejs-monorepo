/**
 * Эффекты и события для управления имплантами
 */

//import * as helpers from '../helpers/model-helper';

let helpers = require('../helpers/model-helper');

/**
 * Обработчик события
 * Добавляет имплант в модель
 * { id: implant-id }
 * TODO: доабавить проверку легитимности - т.е. кто именно может выполнять эту операцию 
 */
function addImplant( api, data ){
    if(data.id){
        let implant = helpers().loadImplant(api, data.id);
        if(implant){
            implant.gID = helpers().uuidv4();

            //Установка импланта
            implant = api.addModifier(implant);

            //Добавление сообщения об этом в список изменений в модели
            helpers().addChangeRecord(api, `Установлен имплант: ${implant.displayName}`);

            //Выполнение мгновенного эффекта установки (изменение кубиков сознания пока)
            instantInstallEffect(api, implant);
        }
    }
}

/**
 * Обработчик события
 * Удвляет имплант из модели
 * { mId: implant-model-id }
 * TODO: доабавить проверку легитимности - т.е. кто именно может выполнять эту операцию 
 */
function removeImplant( api, data ){
     if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            helpers().addChangeRecord(api, `Удален имплант: ${implant.displayName}`);
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
 * { mId: implant-model-id }
 */
function disableImplant(api, data){
    api.info(`!!!!!! Disabled implant:  mID=${data.mID}` );

     if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            implant.enabled = false;
            helpers().addChangeRecord(api, `Выключен имплант: ${implant.displayName}`);
            api.info(`Disabled implant:  mID=${implant.mID} ${implant.displayName}` );
        }
     }
}   

/**
 * Обработчик события "включить имплант"
 * { mId: implant-model-id }
 */
function enableImplant(api, data){
    if(data.mID){
        let implant = api.getModifierById(data.mID);
        if(implant){
            implant.enabled = true;
            helpers().addChangeRecord(api, `Включен имплант: ${implant.displayName}`);
            api.info(`Enabled implant:  mID=${implant.mID} ${implant.displayName}` );
        }
     }
}


module.exports = () => {
    return {
        addImplant,
        removeImplant,
        disableImplant,
        enableImplant
    };
};

