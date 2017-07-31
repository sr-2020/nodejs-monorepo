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
        medHelpers().addDamage(api, Number(data.hpLost), event.timestamp);
     }
}  

/**
 * Функция вызывается тестоым событием "addHp" 
 *  "data": { "hpAdd": 1  }
 */
function restoreDamageEvent(api, data, event ){
    if(Number(data.hpAdd) && api.model.hp){
        medHelpers().restoreDamage(api, Number(data.hpAdd), event.timestamp);
     }
}

/**
 * Функция события leak-hp, которое запускается по таймеру при потери хитов
 * Этот обаботчик должен в случае, если damage >0 списывать один хит 
 * (если нет каких-то имплантов или модификаторов этому препятствующих )
 */
function leakHpEvent(api, data, event){
    let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);

    //Проверить - нет ли на персонаже имплантов, реализующих эффект timed-recover-hp
    //если такие импланты есть, то тогда хиты списывать не надо
    let imp = api.model. modifiers.filter(m => m.enabled)
                            .find( m => helpers().checkPredicate(api, m.mID, "timed-recover-hp") );

    if(imp){
        api.info(`leakHpEvent: Installed recovery HP implant: ${imp.id}, don't reduce HP`);
        return;
    }

    if(m && m.damage && api.model.isAlive){
        m.damage += 1;
        api.info(`leakHpEvent: damage +1 => ${m.damage}`);

        api.setTimer( consts().HP_LEAK_TIMER, consts().HP_LEAK_DELAY, "leak-hp", {} );
        //console.log(JSON.stringify(api.model.timers, null, 4));

        helpers().addChangeRecord(api, "Вы потеряли 1 hp", event.timestamp);
    }
}  

/**
 * Обработчик события "character-death"
 * Смерть персонажа по медицинским причинам.
 * Запускается по таймеру, когда персонаж переходит в тяж. раненние (отключается системы)
 * При срабатывании проверяет есть ли отключенные системы на которых нет включенных имплантов, 
 * и если нет - ничего не делает (значит уже вылечили)
 * если все еще есть - умирает
 */
function characterDeathEvent(api, data, event){
    //проверить системы и импланты на них (все только для Human'ов пока)
    if(api.model.systems){
        let deadSystem = null;

        api.info(`characterDeath: systems ${api.model.systems.join(',')}`);       

        api.model.systems.forEach( (sys,i) => {
            let implants = api.getModifiersBySystem(consts().medicSystems[i].name).filter( m => m.enabled );

            if(!sys && !implants.length){
                api.info(`characterDeath: system ${consts().medicSystems[i].name} is dead. Kill the character!`); 
                deadSystem = consts().medicSystems[i].label;
            }
        });

        if(deadSystem){
            api.model.isAlive = false;
            api.info(`characterDeath: character id=${api.model._id} login=${api.model.login || ""} id dead!`); 
            helpers().addChangeRecord(api, `Вы умерли. Отказала ${deadSystem} система организма.`, event.timestamp);
        }
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

    //Если персонаж мертв ничего больше не делаем
    if(!api.model.isAlive){
        api.model.maxHp = 0;
        api.model.hp = 0;        
        return;
    }

    let curMaxHP = medHelpers().calcMaxHP(api);

    api.model.maxHp = curMaxHP;

    let deadSystems = false;

    //Индикация для клиента, что системы организма не работают!
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

    //Если есть "мертвые системы" то HP == 0 всегда и запускаем таймер на умирание (если ранее не запущен)
    if(deadSystems){
        api.model.hp = 0;      
        api.info(`damageEffect: dead systems ==> hp = 0`);    

        if(!api.getTimer(consts().DEATH_TIMER)){
            api.info(`damageEffect: start death timer!`);        
            api.setTimer( consts().DEATH_TIMER, consts().DEATH_DELAY, "character-death", {} );
        }
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

    if((api.model.hp < api.model.maxHp) && !deadSystems){
        //Установить таймер для утечки хитов, либо если он уже есть - не трогать
        //console.log(JSON.stringify(api.model.timers, null, 4));

        if(!api.getTimer(consts().HP_LEAK_TIMER)){
            api.info(`damageEffect: damage detected ==> start leak HP timer!`);        
            api.setTimer( consts().HP_LEAK_TIMER, consts().HP_LEAK_DELAY, "leak-hp", {} );
        }
    }else{
        //Отключить таймер если нет повреждений или есть мертвы системы (тогда работает таймер на умирание)
        if(api.getTimer(consts().HP_LEAK_TIMER)){
            api.info(`damageEffect: damage was healed or system was dead ==> stop leak HP timer!`);        
            api.removeTimer(consts().HP_LEAK_TIMER);
        }
    }
} 

/**
 * Обработчик отладочного события "character-resurect"
 * Восстанавливает "жизнь" мертвого персонажа.
 * 
 * 1. Находит все импланты и включает их
 * 2. Находит все мертвые системы, для которых нет имплантов и делает их живыми
 * 3. Сбрасывает damage в 0 (на всякий случай)
 * 4. Ставит флаг isAlive в true
 */
function characterResurectEvent(api, data, event){
    //проверить системы и импланты на них (все только для Human'ов пока)
    if(api.model.systems && !api.model.isAlive){

        api.info(`characterResurectEvent: systems ${api.model.systems.join(',')}`);       

        api.model.systems = api.model.systems.map( (sys,i) => {
                    let implants = api.getModifiersBySystem(consts().medicSystems[i].name);
                    let retVar = 1;

                    //Если есть импланты для системы - включить их все.
                    if(implants.length){
                        retVar = 0;
                        implants.forEach( e => e.enabled = true )
                    }

                    return retVar;
                });

        api.info(`characterResurectEvent: systems after ${api.model.systems.join(',')}`);       
        
        let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);
        if(m){
            m.damage = 0;
        }

        api.model.isAlive = true;

        api.info(`characterResurectEvent: character id=${api.model._id} login=${api.model.login || ""} is live again!`);       
    }

}

/**
 * Обработчик эффекта "timed-recover-hp"
 * Этот эффект на реализует механику имплантов "автоматическое восстаноаление хитов в случае легкого ранения"
 * Эффект зависит от предикатов, в параметрах которых должно быть:
 *  { "recoveryRate": x }
 * 
 * Где x = время восстановления одного хита в секундах (0 означает, что хиты просто не теряются, но не восстанавливаются)
 * 
 * Логика работы:
 * если damage >0 то поставить таймер, событие по которому прибавит хит
 * Если это был не последний хит, то таймер само обновится.
 * Название таймера хранится внутри импланта
 */
function timedRecoveryEffect(api, modifier){
    let params = helpers().checkPredicate(api, modifier.mID, "timed-recover-hp");    
    api.info("timedRecoveryEffect: start, predicate: " + JSON.stringify(params));

    let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);

    if(m && m.damage && api.model.isAlive && params && params.recoveryRate){
        let timerName = "hpRecovery-" + modifier.mID;

        if(!api.getTimer(timerName)){
            api.info(`timedRecoveryEffect: damage detected ==> set HP recovery timer, with name ${timerName} to ${params.recoveryRate}sec!`);        
            api.setTimer( timerName, params.recoveryRate*1000, "recover-hp", {} );
        }
    }
}

/**
 * Обработчик события recover-hp
 * Событие срабатывает по таймеру, который выставляется эффектом timed-recover-hp
 * Обработчик уменьшает damage на 1 и перевзводит таймер. Если это был последний хит, то следюущий вызов
 * просто отключит таймер (повреждения в минус уйти не могут) 
 */
function recoverHpEvent(api, data, event){
    let m =  api.getModifierById(consts().DAMAGE_MODIFIER_MID);

    if(m && m.damage && api.model.isAlive){
        m.damage -= 1;
        api.info(`recoverHpEvent: damage-1 => damage == ${m.damage}`);

        helpers().addChangeRecord(api, "Вы восстановили 1 hp", event.timestamp);
    }
}  



module.exports = () => {
    return {
        getDamageEvent,
        damageEffect,
        restoreDamageEvent,
        killRandomSystemEvent,
        leakHpEvent,
        characterDeathEvent,
        characterResurectEvent,
        timedRecoveryEffect,
        recoverHpEvent
    };
};

