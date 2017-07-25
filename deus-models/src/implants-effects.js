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
        let condition = api.getCatalogObject("conditions", params.condition);
        if(condition){
            api.addCondition(condition);
        }
    }
}

module.exports = () => {
    return {
        showCondition,
    };
};