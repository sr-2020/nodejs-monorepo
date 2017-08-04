
/**
 * Хелперы для медицинских моделей
 */

let helpers = require('./model-helper');
let consts = require('./constants');


function addDamage(api, hpLost, timestamp){
    if(hpLost && api.model.hp && api.model.profileType != "program"){
        let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);
        
        if(m){
            m.damage += hpLost;
            api.info(`HP Lost: ${hpLost}, summary damage: ${m.damage}` );

            helpers().addChangeRecord(api, `Вы потеряли ${hpLost} HP`, timestamp);
        }
     }
}  

/**
 * Эта функция должна проверять не ушли ли рабочие хиты в минус
 * Т.е. если на данный момент maxHP < damage, то надо скорректировать damage так, 
 * что бы лечение начиналось с 0 хитов
 */
function restoreDamage(api, hpHeal, timestamp){

    api.info(`removeDamage: ${hpHeal}`);

    if(hpHeal && api.model.hp){
        let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);
        
        if(m){
            let maxHP = calcMaxHP(api);

            if(m.damage > maxHP){  m.damage = maxHP; }

            let dmgBefore = m.damage;

            m.damage -= hpHeal;
            if(m.damage < 0)  { m.damage = 0; }

            api.info(`HP heal: ${hpHeal}, summary damage: ${m.damage}` );
            helpers().addChangeRecord(api, `Вы восстановили ${dmgBefore - m.damage} HP`, timestamp);
        }
     }
}  

/**
 *  Посчитать текущее MaxHP для всех имплантов вида "+2 хита" и базовых хитов персонажа
 */
function calcMaxHP(api){
    let maxHP = api.model.modifiers.filter( m => m.enabled )
                        .map( m => helpers().checkPredicate(api, m.mID, "change-max-hp") )
                        .map( p => p ? p.maxHp : 0)
                        .reduce( (acc, val) => acc + val, api.model.hp );
 
    return (maxHP <= 6 ? maxHP : 6);
}

/**
 * Поставить состояние системы по названию
 */
function setMedSystem(api, system, value){
    let i = consts().medicSystems.findIndex( m => m.name == system );

    if((i != -1) && api.model.systems){
        api.model.systems[i] = value;
    }
}

/**
 * Проверить: есть ли в организме неработающие системы, на которых нет включенных имплантов 
 * (т.е. в тяжелом ли ранении персонаж)
 * Возвращает массив с номерами таких систем (пустой, если таких систем нет) 
 * Если у персонажа нет систем - возвращает пустой массив
 */
function getDeadSystems(api){
    let ret = [];

    if(api.model.systems){
        api.model.systems.forEach( (sys,i) => {
            let implants = helpers().getImplantsBySystem(api,consts().medicSystems[i].name).filter( m => m.enabled );

            if(!sys && !implants.length){
                ret.push(i);
            }
        });
    }

    return ret;
}

/**
 * Вернуть строку описывающую состояние систем
 */
function getSystemsStateString(api){
    if(api.model.systems){
        let systemsStr = api.model.systems.map( (s, i) => { 
            let imps = helpers().getImplantsBySystem(api, consts().medicSystems[i].name).filter( m => m.enabled );
            let impDat = imps.length ? ` (+${imps.length})` : '';

            return `${consts().medicSystems[i].name.substring(0,3)}: ${s}${impDat}`
        }).join(',')
            
        return  "[ " + systemsStr + " ]";
    }

    return "";
}

function getSystemID(name){
    return consts().medicSystems.findIndex( s => s.name == name );
}

function isSystemAlive(api, name){
    let i = consts().medicSystems.findIndex( s => s.name == name );
    if(i != -1 && api.model.systems){
        return (api.model.systems[i] == 1);
    }
}

/**
 * Удалить болезь 
 */
function removeIllness(api, mID){
    if(mID){
        let index = api.model.modifiers.findIndex( m => m.mID == mID );

        if(index != -1){
            let ill = api.model.modifiers[index];

            api.info(`removeIllness: remove ${ill.id} and timer ${ill.id}-${ill.mID}`);
                        
            api.removeTimer(`${ill.id}-${ill.mID}`);
            api.model.modifiers.splice(index,1);        
        }else{
            api.error(`removeIllness: illness ${mID} not found!`);
        }
    }
}
 

module.exports = () => {
    return {
        addDamage,
        restoreDamage,
        calcMaxHP,
        setMedSystem,
        getDeadSystems,
        getSystemsStateString,
        getSystemID,
        isSystemAlive,
        removeIllness
    };
};

