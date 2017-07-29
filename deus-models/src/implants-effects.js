/**
 * Эффекты работы имплантов
 */

let helpers = require('../helpers/model-helper');


/**
 * Эффект показывающий состояние пока работает импланта.
 * Работа эффекта зависит от состояния предикатов в описание импланта
 * т.е. при каких данных генома и сознания что показывать
 * Параметры в предикате:
 * 
 * "params": {
 *   "condition": "s_stability-0"
 * }
 */

function showCondition(api, modifier){
    let params = helpers().checkPredicate(api, modifier.mID, "show-condition");
    api.info("showCondition: start, predicate: " + JSON.stringify(params));

    if(params){
        helpers().addCharacterCondition(api, params.condition);
    }
}

/**
 * Универсальный эффект "изменение свойства модели" (change-properties)
 * Эффект позволяет импланту изменить любое простое свойство в модели (или несоклько )
 * на то время пока он действует.
 * Функционально аналогичен событию changeModelVariableEvent, за исключением того
 * что может менять несколько переменных сразу
 * Использует предикаты для определения что и как менять
 * 
 * В предикате в параметрах должна быть строка вида:
 *  propertyName1+X,propertyName2-Y,propertyName3=Z
 *  
 */
function changeProperties(api, modifier){
    let params = helpers().checkPredicate(api, modifier.mID, "change-properties");
    api.info("changeProperties: start, predicate: " + JSON.stringify(params));

    if(params){
        helpers().modifyModelProperties(api, params.operations);
    }
}


module.exports = () => {
    return {
        showCondition,
        changeProperties
    };
};