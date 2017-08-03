
/**
 * Хелперы для разных моделей
 */
let consts = require('./constants');
let type = require('type-detect');
let Chance = require('chance');
let chance = new Chance();


function loadImplant(api, id){
    let implant = api.getCatalogObject("implants", id.toLowerCase());

    if(!implant){
        api.error(`loadImplant: implant id=${id} not found!`);
        return null;
    }

    let effects = [];

    implant.effects.forEach( eID => {
        let effect = api.getCatalogObject("effects", eID.toLowerCase());
        if(effect){
            effect.enabled = true;
            effects.push(effect);
        } else {
            api.error(`loadImplant: effect id=${eID} not found!`);
        }
    });

    implant.effects = effects;
    implant.enabled = true;

    return implant;
 }

 /**
  * Загружает болезнь и ее эффект из каталога 
  */
function loadIllness(api, id){
    let illness = api.getCatalogObject("illnesses", id.toLowerCase());

    if(!illness){
        api.error(`loadIllness: illness id=${id} not found!`);
        return null;
    }

    let effectName = consts().ILLNESS_EFFECT_NAME;
    let effect = api.getCatalogObject("effects", effectName);

    if (!effect) {
        api.error(`loadIllness: effect id = ${effectName} not found`);
        return null;
    }
    effect.enabled = true;

    illness.effects = [ effect ];
    illness.enabled = true;

    return illness;
 }

//TODO проверить какой timestamp в модели в момент обработки changes
function addChangeRecord( api, text, timestamp ){
    if(text){
        if(api.model.changes.length >= consts().MAX_CHANGES_LINES) api.model.changes.shift();

        api.model.changes.push({
            mID: uuidv4(),
            text: text,
            timestamp
        });
    }
}

//Проверка предиката и возвращение данных для работы эффекта
//Вовращается объект Params (если он есть)
function checkPredicate(api, mID, effectName, multi = false){
    let implant = api.getModifierById(mID)

    //api.info("checkPredicate: " + JSON.stringify(implant));

    if(implant){
        let predicates = implant.predicates;

        //Если предикатов нет внутри импланта, попробовать загрузить имплант из БД
        if(!predicates){
            //api.info("checkPredicate: try to load predicates from catalog");

            let catalogImplant = api.getCatalogObject("implants", implant.id);
            if(catalogImplant) {
                predicates = catalogImplant.predicates;
            }
        }

        if(predicates){
            let p = predicates.filter( p => p.effect == effectName)
                        .filter( p => isGenomeMatch(api, p.variable, p.value) ||
                                    isMindCubeMatch(api, p.variable, p.value) );

        // api.info(`charID: ${api.model._id}: checkPredicate for ${mID}, effect: ${effectName} => ${JSON.stringify(p)}`);

            if(p && p.length){
                if(!multi){
                    return p[0].params;
                }else{
                    return p.map( element => element.params );
                }
            }
        }
    }

    return null;
}

function isMindCubeMatch(api, variable, condition){
    let parts = variable.match(/^([A-G])(\d)/i);
    //console.log(`isMindCubeMatch: ${variable}`);
    if(parts){
        let cube = parts[1];
        let index = Number(parts[2]);

        //console.log(`isMindCubeMatch: ${cube}${index} ? ${condition} => ${api.model.mind[cube][index]}`);

        if(api.model.mind && api.model.mind[cube]){
            if(checkValue( api.model.mind[cube][index], condition)){
                return true;
            }
        }
    }

    return false;
}

//Condition это условие для проверки value.
//имеет форматы: <X, >Y, A-B, X
function checkValue(value, condition){
    let l = -1;
    let h = -1;
    let parts = "";
    let v = Number.parseInt(value)

    l = Number.parseInt(condition);
    if( !Number.isNaN(l) ){
        h = l;
    }

    if( (parts = condition.match(/^(\d+)\-(\d+)$/i)) ){
        l = Number.parseInt(parts[1]);
        h = Number.parseInt(parts[2]);
    }

    if( (parts = condition.match(/^([<>])(\d+)$/i) ) ){
        if(parts[1] == ">" ){
            l = Number.parseInt(parts[2]) + 1;
            h = Number.MAX_VALUE;
        }else{
            h = parts[2] - 1
            l = 0;
        }
    }

    //console.log(`checkValue: ${l} ..  ${v} .. ${h}`)

    if(v >= l && v <= h ){
        return true;
    }else{
        return false;
    }
}

function isGenomeMatch(api, variable, value){
    let parts = variable.match(/^Z(\d\d?)/i);

    if(parts){
        let index = Number.parseInt(parts[1])-1;
        if(api.model.genome &&  (index < api.model.genome.length)){
            if(api.model.genome[index] == Number.parseInt(value)){
                return true;
            }
        }
    }
    return false;
}

/**
 * Модифицирует кубики сознания в переданном объекте Mind,
 * в соответствии с "инструкцией"
 * Формат инструкции из таблицы имплантов:
 * A1+X,B2-Y,C2=Z
 *
 * Предполагается что текст инструкции уже нормализован
 * (верхний регистр, без пробелов, через запятую)
 * 
 * scaleFactor = 100 (default) to apply normal change
 */
function modifyMindCubes(api, mind, changeText, scaleFactor){
    scaleFactor = scaleFactor || 100;
    changeText.split(',').forEach( exp => {

        //console.log(`MMC:  Part: ${exp}`);

        let exParts = exp.match(/([A-G])(\d)([\+\-\=])(\d+)/i);
        if(exParts){
            let cube = exParts[1];
            let index = Number(exParts[2]);
            let op = exParts[3];
            let mod = Math.trunc(Number(exParts[4]) * scaleFactor / 100);

            //console.log(`MMC parsed: ${cube}${index} ${op} ${mod}`);
            let beforeOp = mind[cube][index];

            if(mind[cube] && index < mind[cube].length){
                switch(op){
                    case '+' :  mind[cube][index] += mod;
                                break;
                    case '-' :  mind[cube][index] -= mod;
                                break;
                    default:    mind[cube][index] = mod;
                }
            }

            if(mind[cube][index] < 0 ){
                mind[cube][index] = 0;
            }

            if(mind[cube][index] > 100 ){
                mind[cube][index] = 100;
            }

            api.info(`modifyMindCubes: ${cube}${index} ${beforeOp} => ${mind[cube][index]}` );
        }
    })
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 *  Устанавливает значение состояния системы в модели по ее имени (англоязычному)
 */
function addCharacterCondition( api, condId ){
    if(condId){
        let condition = api.getCatalogObject("conditions", condId);

        if(condition){
            api.debug(JSON.stringify(condition));
            return api.addCondition(condition);
        }
        else {
            api.error("Couldn't find condition " + condId);
        }
    }

    return null;
}

/**
 * Проверка - можно ли устанавливать имплант в модель
 * На ОДН и НС па слота, на остальные - по дному
 * Так же нельзя установить один имплант два раза
 */

//  function isImpantCanBeInstalled(api, implant){
//     if(implant && implant.system){
//         let systemInfo = consts().medicSystems.find( s => s.name == implant.system);

//         if(systemInfo){
//             let existingImplants = helpers().getImplantsBySystem( implant.system );

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
function addDelayedEvent( api, duration, eventType, data, prefix = "delayed" ){
    if(api && duration && eventType && data){
        let timerName = `${prefix}-${chance.natural({min: 0, max: 999999})}`;

        api.setTimer( timerName, Number(duration), eventType, data );

        api.info(`Set timer ${timerName} for event ${eventType} after ${duration} ms` );
    }
    else
    {
        api.error("Not enough params");
    }
}

/**
 * Удалить элемент по mID из списка
 *
 * Проходит по массиву, если в элементе есть поле mID и оно равно переданному,
 * элемент удаляется (ищется только первый подходящий жлемент)
 *
 * Функция возращает удаленный элемент или null
 */
function removeElementByMID( list, mID  ){
    if(list){
        let i = list.findIndex( e => e.mID ? ( e.mID == mID ) : false );
        if(i != -1){
            let e = list[i];

            list.slice(i, 1);

            return e;
        }
    }

    return null;
}

let restrictedVars = ["_id", "id", "hp", "maxHp", "login", "mail", "profileType", "timestamp",
                    "mind", "genome", "systems", "conditions", "modifiers", "changes", "messages", "timers" ];


/**
 * Изменить простые свойства модели по инструкциям в переданной строке вида
 *  propertyName1+X,propertyName2-Y,propertyName3=Z
 *
 * Можно менять только простые переменные (string/number), не входящие в структуры
 * Нельзя менять ключевые поля, меняемые через специальные события и методы
 */
function modifyModelProperties(api, operations){
    if(operations){
        operations.replace(/\s/ig,'').split(',').forEach( op => {
            let parts = op.match(/^([\w\d]+)([\+\-\=])(\d+)$|^([\w\d]+)\=\"(.*)\"$/i);

            if(parts){
                result = false;

                if(parts[1]){
                    result = modifyModelDigitProperty(api, parts[1], parts[2], parts[3]);
                }else{
                    result = modifyModelStringProperty(api, parts[4], parts[5]);
                }

                if(result){
                    let varName = parts[1] || parts[4];
                    api.info(`modifyModelProperties:  ${varName} ==> ${api.model[varName]}`);
                }else{
                    api.error(`modifyModelProperties: can't execute operation \"${op}\"`);
                }
            }
        });
    }
}

function modifyModelStringProperty(api, varName, value){
    if(restrictedVars.find( v => varName == v)){
        return false;
    }

    if(!api.model.hasOwnProperty(varName)){
        return false;
    }

    let t = type(api.model[varName]);

    if( t!="string" && t!="null" && t!="undefined" ){
        return false;
    }

    api.model[varName] = value;

    return true;
}

function modifyModelDigitProperty(api, varName, op, value){
    if(restrictedVars.find( v => varName == v)){
        return false;
    }

    if(!api.model.hasOwnProperty(varName)){
        return false;
    }

    let t = type(api.model[varName]);

    if( t != "number" || Number(value).isNaN ){
        return false;
    }

    switch(op){
        case "+":   api.model[varName] += Number(value);
                    break;
        case "-":   api.model[varName] -= Number(value);
                    break;
        case "=":   api.model[varName] = Number(value)
                    break;
        default:    return false;
    }

    return true;
}

function setTimerToKillModifier(api, modifier, timestamp)
{
    api.setTimer(
        consts().NARCO_TIME_PREFIX + modifier.mID,
        timestamp - 1, 
        "stop-narco-modifier", 
        {mID : modifier.mID} );
}


const implantClasses = [
    "cyber-implant",
    "bio-implant",
    "illegal-cyber-implant",
    "illegal-bio-implant",
    "virtual"
];

/**
 * Проверяет класс модификатора и возращается true если это имплант 
 */
function isImplant(modifier){
    if(modifier.class && implantClasses.find(c => c == modifier.class)){
        return true;
    }

    return false;
}

function getImplantsBySystem(api, systemName){
    return api.getModifiersBySystem(systemName).filter( m => isImplant(m) );
}

function getChanceFromModel (model) {
    return  (model.randomSeed) ?  new Chance(model.randomSeed) : new Chance();
}

 
module.exports = () => {
    return {
        loadImplant,
        addChangeRecord,
        uuidv4,
        checkValue,
        isMindCubeMatch,
        isGenomeMatch,
        checkPredicate,
        modifyMindCubes,
        addCharacterCondition,
        addDelayedEvent,
        removeElementByMID,
        modifyModelProperties,
        setTimerToKillModifier,
        isImplant,
        loadIllness,
        getImplantsBySystem,
        getChanceFromModel
    };
};

