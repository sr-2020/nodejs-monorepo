/**
 * Эффекты и события связанные с медициной и хитами
 */

let Chance = require('chance');

let consts = require('../helpers/constants');
let helpers = require('../helpers/model-helper');
let medHelpers = require('../helpers/medic-helper');


/**
 * Формат специального модификатора в каждой модели для отображения и хранения ущерба
 * При получении повреждений они добавляются к damage и при пересчете модели вычитаются из максимального
 * числа хитов. Переменная hp в базовой модели  == maxHP, а в рабочей maxHP - damage
 * 
 * При добавлении новых имплнатов damage не меняется
 * При удалении имплантов damage корректируется так, что бы рабочее всегда было hp >= 0
 * 
 * При лечении damage корректируется
 * 
 * При нанесении повреждений damage увеличивается
 * 
 * При расчете рабочей модели эффекты имплантов явно не влияют на Hp/MaxHP. Специальный эффект модификатора  _damage
 * проходит по всем имплнтам и собирает результирующие значения
 * 
 * Установленные импланты влияют на обе рабочих переменных maxHP и hp
        {
            id: "_damage",
            displayName: "internal damage modificator",
            class: "_internal",
            effects: [
                {
                    id: "damage-effect",
                    class: "physiology",
                    type: "normal",
                    handler: "damageEffect",
                    enabled: true
                }
            ],
            damage: 0,
            enabled: true,
            mID: "_internal_damage"
        }
*/

/**
 * Функция вызывается событием "subtractHp" когда игрок нажимает кнопку снятия хитов
 *  "data": { "hpLost": 1  }
 */
function getDamageEvent(api, data, event){
    if(Number(data.hpLost) && api.model.hp){
        medHelpers().addDamage(api, Number(data.hpLost));
     }
}  

/**
 * Функция вызывается тестоым событием "addHp" 
 *  "data": { "hpAdd": 1  }
 */
function restoreDamageEvent(api, data, event ){
    if(Number(data.hpAdd) && api.model.hp){
        medHelpers().restoreDamage(api, Number(data.hpAdd));
     }
}

/**
 * Обработчик события kill-random-system
 * Вызывается когда хиты доходят до нуля
 */
function killRandomSystemEvent(api, data, event){
    if(data.from && data.from == "self" && api.model.profileType=="human"){
        console.log("killRandomSystem: event handler start!");

        let chance = new Chance();
        //debug seedind
        if(api.model.randomSeed){
            chance = new Chance(api.model.randomSeed);
        }
        
        //выбрать случайную систему кроме нервной
        let sys;

         do {
            sys = chance.integer({min: 0, max: 4});
            
             console.log(`killRandomSystem: kill system ${consts().medicSystems[sys].label}`);

            //Если система работала и импланта не было, то убить систему
            if(api.model.systems[sys]){
                api.model.systems[sys] = 0;
                helpers().addChangeRecord(api, 
                        `Необратимо повреждена ${consts().medicSystems[sys].label} система! Необходима срочная замена на имплант!`,
                         event.timestamp)

                 console.log(`killRandomSystem: ${consts().medicSystems[sys].label} ==> dead`);

                //делать так, что бы точно не пойти на второй круг (Если это была ОДС)
                sys = -1;
            }else{
            //Если система уже дохлая, но на ней есть имплант - он уничтожается (если больше одного - первый)
                let implants = api.getModifiersBySystem(consts().medicSystems[sys].name);
                if(implants[0]){
                    if(implants.length == 1){ sys = -1; }

                    api.removeModifier(implants[0].mID);
                    helpers().addChangeRecord(api, `Необратимо поврежден имплант: ${implants[0].displayName}!`, event.timestamp);
                    
                    console.log(`killRandomSystem: kill system ${implants[0].displayName} ==> destroyed`);
                }

            }
        //Если выбрана была система 0 (ОДС), то повторить процесс (либо добить систему, там может быть два импланта)
         }while(sys==0)

        //Сбросить счетчик повреждений HP в 0, т.к. теперь отключена одна система целиком
        let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);
        if(m){
            console.log(`killRandomSystem: set damage == 0`);
            m.damage = 0;
        }
    }
}

/**
 * Эффект обработки "фейкового" импланта _damage
 * Меняет "текущее" число хитов и посылает событие об "убийстве системы"
 *   если суммарное повреждение больше maxHP
 * Выполняется при расчете рабочей модели (т.е. как эффект импланта)
 * 
 * 1. Проходит по всем модификаторам
 * 2. Ищет в каждом из них предикат для эффекта  change-max-hp
 * 3. Если находится такой предикат для данного состояния персонажа получает корректировки к HP пример: { maxHp : 2  }
 * 4. Суммирует все найденные корректировки и добавляет их к базовым хитам (model.hp)
 * 5. Вычитает из полученной суммы текущий ущерб (modifier.damage)
 * 
 * 6. Если в итоге расчетное значние <=0 посылает событие kill-random-system и Refresh
 *    (т.е. надо сделать еще один цикл пересчета -убить систему)
 * 
 * 7. Итог записывает в новую рабочую версию model.hp  (если <0 то ставит 0)
 * 
 * Предполагается что никакие другие импланты не вносят корректировки в HP
 */
function damageEffect(api, modifier){
    let curMaxHP = medHelpers().calcMaxHP(api);

    api.model.maxHp = curMaxHP;

    let deadSystems = false;

    //Проходим по всем системам и показываем состояния что система дохлая
    //Для андроидов видимо какая-то иная логика работы
    if(api.model.systems){

        api.info(`damageEffect: systems ${api.model.systems.join(',')}`);       

        api.model.systems.forEach( (sys,i) => {
            let implants = api.getModifiersBySystem(consts().medicSystems[i].name).filter( m => m.enabled );

            //api.info(`system: ${sys}, implants: ${implants.map(x=>x.id).join(',')}`);
            if(!sys && !implants.length){
                helpers().addCharacterCondition(api, `system_damage_${i}`);

                api.info(`damageEffect: system ${consts().medicSystems[i].name} is dead!`); 
                deadSystems = true;
            }
        });
    }

    //Если есть "мертвые системы" то HP == 0 всегда
    if(deadSystems){
        api.model.hp = 0;      
        api.info(`damageEffect: dead systems ==> hp = 0`);        
    }else{
        //Иначе надо учитывать повреждения (хранящиеся в данном объекте)
        api.model.hp = curMaxHP - modifier.damage;

        api.info(`damageEffect: maxHP: ${curMaxHP}, Damage: ${modifier.damage} ==>  hp = ${api.model.hp}`);        

        //Если оказалось, что <=0 хитов, то послать событие грохнуть систему организама и поставить ==0
        //только для хуманов 
        if(api.model.hp <=0) {

            //Послать событие - грохнуть случайную систему организма
            if(api.model.profileType=="human"){
                api.info(`damageEffect: hp = ${api.model.hp} ==> send "kill-random-system" event!`);        
                api.sendEvent(null, "kill-random-system", { from: "self" });
            }

            api.model.hp = 0 
        }
    }

}  

module.exports = () => {
    return {
        getDamageEvent,
        damageEffect,
        restoreDamageEvent,
        killRandomSystemEvent
    };
};

