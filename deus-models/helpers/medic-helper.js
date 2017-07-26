
/**
 * Хелперы для медицинских моделей
 */

let helpers = require('./model-helper');
let consts = require('./constants');


function addDamage(api, hpLost){
    if(hpLost && api.model.hp){
        let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);
        
        if(m){
            m.damage += hpLost;
            api.info(`HP Lost: ${hpLost}, summary damage: ${m.damage}` );
        }
     }
}  

/**
 * Эта функция должна проверять не ушли ли рабочие хиты в минус
 * Т.е. если на данный момент maxHP < damage, то надо скорректировать damage так, 
 * что бы лечение начиналось с 0 хитов
 */
function restoreDamage(api, hpHeal){

    console.log(`removeDamage: ${hpHeal}`);

    if(hpHeal && api.model.hp){
        let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);
        
        if(m){
            let maxHP = calcMaxHP(api);

            if(m.damage > maxHP){  m.damage = maxHP; }

            m.damage -= hpHeal;
            if(m.damage < 0)  { m.damage = 0; }

            api.info(`HP heal: ${hpHeal}, summary damage: ${m.damage}` );
        }
     }
}  

/**
 *  Посчитать текущее MaxHP для всех имплантов вида "+2 хита" и базовых хитов персонажа
 */
function calcMaxHP(api){
    return api.model.modifiers.filter( m => m.enabled )
                        .map( m => helpers().checkPredicate(api, m.mID, "change-max-hp") )
                        .map( p => p ? p.maxHp : 0)
                        .reduce( (acc, val) => acc + val, api.model.hp );
 
}

function setMedSystem(api, system, value){
    let i = consts().medicSystems.findIndex( m => m.name == system );

    if((i != -1) && api.model.systems){
        api.model.systems[i] = value;
    }
}

module.exports = () => {
    return {
        addDamage,
        restoreDamage,
        calcMaxHP,
        setMedSystem
    };
};

