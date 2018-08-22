import { ModelApiInterface, Modifier } from 'deus-engine-manager-api';

/**
 * Хелперы для разных моделей
 */
import Chance = require('chance');
import type = require('type-detect');
import consts = require('./constants');
const chance = new Chance();

function loadImplant(api: ModelApiInterface, id: string) {
    const implant = api.getCatalogObject('implants', id.toLowerCase());

    if (!implant) {
        api.error(`loadImplant: implant id=${id} not found!`);
        return null;
    }

    const effects: any[] = [];

    implant.effects.forEach((eID: string) => {
        const effect = api.getCatalogObject('effects', eID.toLowerCase());
        if (effect) {
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
function loadIllness(api: ModelApiInterface, id: string) {
    const illness = api.getCatalogObject('illnesses', id.toLowerCase());

    if (!illness) {
        api.error(`loadIllness: illness id=${id} not found!`);
        return null;
    }

    const effectName = consts.ILLNESS_EFFECT_NAME;
    const effect = api.getCatalogObject('effects', effectName);

    if (!effect) {
        api.error(`loadIllness: effect id = ${effectName} not found`);
        return null;
    }
    effect.enabled = true;

    illness.effects = [effect];
    illness.enabled = true;

    return illness;
}

// TODO проверить какой timestamp в модели в момент обработки changes
function addChangeRecord(api: ModelApiInterface, text: string, timestamp: number) {
    if (text) {
        if (api.model.changes.length >= consts.MAX_CHANGES_LINES) api.model.changes.shift();

        api.model.changes.push({
            mID: uuidv4(),
            text: text,
            timestamp,
        });
    }
}

function isGenomeMatch(api: ModelApiInterface, variable: string, value: string) {
    const parts = variable.match(/^Z(\d\d?)/i);

    if (parts) {
        const index = Number.parseInt(parts[1], 10) - 1;
        if (api.model.genome && (index < api.model.genome.length)) {
            if (api.model.genome[index] == Number.parseInt(value, 10)) {
                return true;
            }
        }
    }
    return false;
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // tslint:disable:no-bitwise
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        // tslint:enable:no-bitwise
        return v.toString(16);
    });
}

/**
 *  Устанавливает значение состояния системы в модели по ее имени (англоязычному)
 */
function addCharacterCondition(api: ModelApiInterface, condId: string) {
    if (condId) {
        const condition = api.getCatalogObject('conditions', condId);

        if (condition) {
            api.debug(JSON.stringify(condition));
            return api.addCondition(condition);
        } else {
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
function addDelayedEvent(api: ModelApiInterface,
                         duration: number, eventType: string, data: any, prefix = 'delayed') {
    if (api && duration && eventType && data) {
        const timerName = `${prefix}-${chance.natural({ min: 0, max: 999999 })}`;

        api.setTimer(timerName, Number(duration), eventType, data);

        api.info(`Set timer ${timerName} for event ${eventType} after ${duration} ms`);
    } else {
        api.error('Not enough params');
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
function removeElementByMID(list: Modifier[], mID: string): Modifier | null {
    if (list) {
        const i = list.findIndex((e) => e.mID ? (e.mID == mID) : false);
        if (i != -1) {
            const e = list[i];

            list.slice(i, 1);

            return e;
        }
    }

    return null;
}

const restrictedVars = ['_id', 'id', 'hp', 'maxHp', 'login', 'profileType', 'timestamp',
    'mind', 'genome', 'systems', 'conditions', 'modifiers', 'changes', 'messages', 'timers'];

/**
 * Изменить простые свойства модели по инструкциям в переданной строке вида
 *  propertyName1+X,propertyName2-Y,propertyName3=Z
 *
 * Можно менять только простые переменные (string/number), не входящие в структуры
 * Нельзя менять ключевые поля, меняемые через специальные события и методы
 */
function modifyModelProperties(api: ModelApiInterface, operations: string) {
    if (operations) {
        operations.replace(/\s/ig, '').split(',').forEach((op) => {
            const parts = op.match(/^([\w\d]+)([\+\-\=])(\d+)$|^([\w\d]+)\=\"(.*)\"$/i);

            if (parts) {
                let result = false;

                if (parts[1]) {
                    result = modifyModelDigitProperty(api, parts[1], parts[2], parts[3]);
                } else {
                    result = modifyModelStringProperty(api, parts[4], parts[5]);
                }

                if (result) {
                    const varName = parts[1] || parts[4];
                    api.info(`modifyModelProperties:  ${varName} ==> ${api.model[varName]}`);
                } else {
                    api.error(`modifyModelProperties: can't execute operation \"${op}\"`);
                }
            }
        });
    }
}

function modifyModelStringProperty(api: ModelApiInterface, varName, value) {
    if (restrictedVars.find((v) => varName == v)) {
        return false;
    }

    if (!api.model.hasOwnProperty(varName)) {
        return false;
    }

    const t = type(api.model[varName]);

    if (t != 'string' && t != 'null' && t != 'undefined') {
        return false;
    }

    api.model[varName] = value;

    return true;
}

function modifyModelDigitProperty(api: ModelApiInterface, varName: string, op: string, value: string) {
    if (restrictedVars.find((v) => varName == v)) {
        return false;
    }

    if (!api.model.hasOwnProperty(varName)) {
        return false;
    }

    const t = type(api.model[varName]);

    if (t != 'number') {
        return false;
    }

    switch (op) {
        case '+': api.model[varName] += Number(value);
            break;
        case '-': api.model[varName] -= Number(value);
            break;
        case '=': api.model[varName] = Number(value);
            break;
        default: return false;
    }

    return true;
}

function setTimerToKillModifier(api: ModelApiInterface, modifier, timestamp) {
    api.setTimer(
        consts.NARCO_TIME_PREFIX + modifier.mID,
        timestamp - 1,
        'stop-narco-modifier',
        { mID: modifier.mID });
}

const implantClasses = [
    'cyber-implant',
    'bio-implant',
    'illegal-cyber-implant',
    'illegal-bio-implant',
    'virtual',
];

/**
 * Проверяет класс модификатора и возращается true если это имплант
 */
function isImplant(modifier) {
    if (modifier.class && implantClasses.find((c) => c == modifier.class)) {
        return true;
    }

    return false;
}

/**
 * Проверяет класс модификатора и возращается true если это болезнь
 */
function isIllness(modifier) {
    if (modifier.class && modifier.class == 'illness') {
        return true;
    }

    return false;
}

function getImplantsBySystem(api: ModelApiInterface, systemName) {
    return api.getModifiersBySystem(systemName).filter((m) => isImplant(m));
}

function getAllImplants(api) {
    return api.model.modifiers.filter((m) => isImplant(m));
}

function getAllIlnesses(api) {
    return api.model.modifiers.filter((m) => isIllness(m));
}

function getChanceFromModel(model) {
    return (model.randomSeed) ? new Chance(model.randomSeed) : new Chance();
}

function removeImplant(api: ModelApiInterface, implantForRemove, timestamp) {
    api.removeModifier(implantForRemove.mID);
    addChangeRecord(api, `Удален имплант: ${implantForRemove.displayName} при установке нового`, timestamp);
}

function createEffectModifier(api: ModelApiInterface, effectName, modifierId,
                              displayName, modifierClass): Modifier | undefined {
    const effect = api.getCatalogObject('effects', effectName);

    if (!effect) {
        api.error("Can't load effect " + effectName);
        return;
    }

    effect.enabled = true;

    const modifier = {
        mID: '',
        id: modifierId,
        name: modifierId,
        displayName: displayName,
        class: modifierClass,
        effects: [effect],
        enabled: true,
    };

    return modifier;
}

export = {
    loadImplant,
    addChangeRecord,
    uuidv4,
    isGenomeMatch,
    addCharacterCondition,
    addDelayedEvent,
    removeElementByMID,
    modifyModelProperties,
    setTimerToKillModifier,
    loadIllness,
    getImplantsBySystem,
    getChanceFromModel,
    removeImplant,
    isImplant,
    getAllImplants,
    getAllIlnesses,
    createEffectModifier,
    isIllness,
};
