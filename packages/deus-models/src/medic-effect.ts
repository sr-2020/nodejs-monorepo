/**
 * Эффекты и события связанные с медициной и хитами
 */

let Chance = require('chance');

import consts = require('../helpers/constants');
import helpers = require('../helpers/model-helper');
import medhelpers = require('../helpers/medic-helper');

import { Event, ModelApiInterface } from 'deus-engine-manager-api';

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
function getDamageEvent(api: ModelApiInterface, data, event: Event){
    if(Number(data.hpLost) && api.model.hp){
        medhelpers.addDamage(api, Number(data.hpLost), event.timestamp);
     }
}

/**
 * Функция вызывается тестоым событием "addHp"
 *  "data": { "hpAdd": 1  }
 */
function restoreDamageEvent(api, data, event ){
    if(Number(data.hpAdd) && api.model.hp){
        medhelpers.restoreDamage(api, Number(data.hpAdd), event.timestamp);
     }
}

function hasAnyEffect(api, effectName) {
    return api.model. modifiers.filter(m => m.enabled)
                            .find( m => helpers.checkPredicate(api, m.mID, effectName) );

}

/**
 * Функция события leak-hp, которое запускается по таймеру при потери хитов
 * Этот обаботчик должен в случае, если damage >0 списывать один хит
 * (если нет каких-то имплантов или модификаторов этому препятствующих )
 */
function leakHpEvent(api, data, event){
    let m =  api.getModifierById(consts.DAMAGE_MODIFIER_MID);

    //Проверить - нет ли на персонаже имплантов, реализующих эффект timed-recover-hp
    //если такие импланты есть, то тогда хиты списывать не надо
    let imp = hasAnyEffect(api, "timed-recover-hp");

    if(imp){
        api.info(`leakHpEvent: Installed recovery HP implant: ${imp.id}, don't reduce HP`);
        return;
    }

    if(m && m.damage && api.model.isAlive){
        m.damage += 1;
        api.info(`leakHpEvent: damage +1 => ${m.damage}`);

        api.setTimer( consts.HP_LEAK_TIMER, consts.HP_LEAK_DELAY, "leak-hp", {} );

        helpers.addChangeRecord(api, "Вы потеряли 1 hp", event.timestamp);
    }
}

/**
 * Функция события regen-hp, которое запускается по таймеру при потери хитов у Андроидов
 * Этот обаботчик должен в случае, если damage >0 восстанавливать один хит
 * (если нет каких-то имплантов или модификаторов этому препятствующих )
 */
function regenHpEvent(api, data, event){
    let m =  api.getModifierById(consts.DAMAGE_MODIFIER_MID);

    //Проверить - нет ли на персонаже имплантов, реализующих эффект timed-recover-hp
    //если такие импланты есть, то тогда хиты списывать не надо
    if(hasAnyEffect(api, "timed-recover-hp")){
        api.info(`regenHpEvent: Installed recovery HP implant: overrides regen`);
        return;
    }

    if(m && m.damage && api.model.isAlive){
        m.damage -= 1;
        api.info(`regenHpEvent: damage -1 => ${m.damage}`);

        api.setTimer( consts.HP_REGEN_TIMER, consts.HP_REGEN_DELAY, "regen-hp", {} );

        helpers.addChangeRecord(api, "Вы восстановили 1 hp", event.timestamp);
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
        let deadSystem: any = null;

        api.info(`characterDeath: systems ${medhelpers.getSystemsStateString(api)}`);

        api.model.systems.forEach( (sys,i) => {
            let implants = helpers.getImplantsBySystem(api, consts.medicSystems[i].name).filter( m => m.enabled );

            if(!sys && !implants.length){
                api.info(`characterDeath: system ${consts.medicSystems[i].name} is dead. Kill the character!`);
                deadSystem = consts.medicSystems[i].label;
            }
        });

        if(deadSystem){
            api.model.isAlive = false;
            api.info(`characterDeath: character id=${api.model._id} login=${api.model.login || ""} id dead!`);
            helpers.addChangeRecord(api, `Вы умерли. Отказала ${deadSystem} система организма.`, event.timestamp);
        }
    }

}

/**
 * Обработчик события kill-random-system
 * Вызывается когда хиты доходят до нуля
 */
function killRandomSystemEvent(api, data, event){
    if(data.from && data.from == "self" && api.model.profileType=="human"){
        api.info("killRandomSystem: event handler start!");

        let chance = new Chance();
        //debug seedind
        if(api.model.randomSeed){
            chance = new Chance(api.model.randomSeed);
        }

        //выбрать случайную систему кроме нервной
        let sys;

         do {
            sys = chance.integer({min: 0, max: 4});

             api.info(`killRandomSystem: kill system ${consts.medicSystems[sys].label}`);

            //Если система работала и импланта не было, то убить систему
            if(api.model.systems[sys]){
                api.model.systems[sys] = 0;
                helpers.addChangeRecord(api,
                        `Необратимо повреждена ${consts.medicSystems[sys].label} система! Необходима срочная замена на имплант!`,
                         event.timestamp)

                 api.info(`killRandomSystem: ${consts.medicSystems[sys].label} ==> dead`);

                //делать так, что бы точно не пойти на второй круг (Если это была ОДС)
                sys = -1;
            }else{
            //Если система уже дохлая, но на ней есть имплант - он уничтожается (если больше одного - первый)
                let implants = api.getModifiersBySystem(consts.medicSystems[sys].name);
                if(implants[0]){
                    if(implants.length == 1){ sys = -1; }

                    api.removeModifier(implants[0].mID);
                    helpers.addChangeRecord(api, `Необратимо поврежден имплант: ${implants[0].displayName}!`, event.timestamp);

                    api.info(`killRandomSystem: kill system ${implants[0].displayName} ==> destroyed`);
                }

            }
        //Если выбрана была система 0 (ОДС), то повторить процесс (либо добить систему, там может быть два импланта)
         }while(sys==0)

        //Сбросить счетчик повреждений HP в 0, т.к. теперь отключена одна система целиком
        let m =  api.getModifierById(consts.DAMAGE_MODIFIER_MID);
        if(m){
            api.info(`killRandomSystem: set damage == 0`);
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

    let isHuman = api.model.profileType=="human";
    let isRobot = (api.model.profileType=="robot" || api.model.profileType=="ex-human-robot");

    let curMaxHP = medhelpers.calcMaxHP(api);

    api.model.maxHp = curMaxHP;

    let deadSystems = false;

    //Индикация для клиента, что системы организма не работают!
    //Проходим по всем системам и показываем состояния что система дохлая
    //Для андроидов видимо какая-то иная логика работы
    if(api.model.systems){

        api.info(`damageEffect: systems ${medhelpers.getSystemsStateString(api)}`);

        api.model.systems.forEach( (sys,i) => {
            let implants = helpers.getImplantsBySystem(api, consts.medicSystems[i].name).filter( m => m.enabled );

            //api.info(`system: ${sys}, implants: ${implants.map(x=>x.id).join(',')}`);
            if(!sys && !implants.length){
                helpers.addCharacterCondition(api, `system_damage_${i}`);

                api.info(`damageEffect: system ${consts.medicSystems[i].name} is dead!`);
                deadSystems = true;
            }
        });
    }

    //Если есть "мертвые системы" то HP == 0 всегда и запускаем таймер на умирание (если ранее не запущен)
    if(deadSystems){
        api.model.hp = 0;
        api.info(`damageEffect: dead systems ==> hp = 0`);

        if(!api.getTimer(consts.DEATH_TIMER)){
            api.info(`damageEffect: start death timer!`);
            api.setTimer( consts.DEATH_TIMER, consts.DEATH_DELAY, "character-death", {} );

            api.sendEvent(null, "add-change-record", { text: `Тяжелое повреждение организма! Требуется немедленная реанимация, возможна смерть в течении 20 минут`, timestamp: api.model.timestamp } );

            //Debug
            //api.info(JSON.stringify(api.model.timers));
        }
    }else{
        //Иначе надо учитывать повреждения (хранящиеся в данном объекте)
        api.model.hp = curMaxHP - modifier.damage;

        api.info(`damageEffect: maxHP: ${curMaxHP}, Damage: ${modifier.damage} ==>  hp = ${api.model.hp}`);

        //Если оказалось, что <=0 хитов, то послать событие грохнуть систему организама и поставить ==0
        //только для хуманов
        if(api.model.hp <=0) {

            //Послать событие - грохнуть случайную систему организма
            if(isHuman){
                api.info(`damageEffect: hp = ${api.model.hp} ==> send "kill-random-system" event!`);
                api.sendEvent(null, "kill-random-system", { from: "self" });
            }

            api.model.hp = 0
        }
    }

    if (isHuman) {
        handleHumansWounded(api, deadSystems);
    }

    if (api.model.profileType=="robot") {
        handleDroidsWounded(api);
    }
}

function handleDroidsWounded(api)
{
    if((api.model.hp < api.model.maxHp)){
        startRegenTimerIfRequired(api);

    }else{
        stopRegenTimerIfRequired(api);
    }
}

function startRegenTimerIfRequired(api)
{
     if(!api.getTimer(consts.HP_REGEN_TIMER)){
            api.info(`damageEffect: damage detected ==> start regen HP timer!`);
            api.setTimer( consts.HP_REGEN_TIMER, consts.HP_LEAK_DELAY, "regen-hp", {} );
        }
}

function stopRegenTimerIfRequired(api) {
    if(api.getTimer(consts.HP_REGEN_TIMER)){
        api.info(`damageEffect: damage was healed ==> stop regen HP timer!`);
        api.removeTimer(consts.HP_REGEN_TIMER);
    }
}

function handleHumansWounded(api, deadSystems)
{
    if((api.model.hp < api.model.maxHp) && !deadSystems){
        //Установить таймер для утечки хитов, либо если он уже есть - не трогать
        //api.info(JSON.stringify(api.model.timers, null, 4));
        startLeakTimerIfRequired(api);

    }else{
        //Отключить таймер если нет повреждений или есть мертвы системы (тогда работает таймер на умирание)
        stopLeakTimerIfRequired(api);
    }
}

function startLeakTimerIfRequired(api)
{
     if(!api.getTimer(consts.HP_LEAK_TIMER)){
            api.info(`damageEffect: damage detected ==> start leak HP timer!`);
            api.setTimer( consts.HP_LEAK_TIMER, consts.HP_LEAK_DELAY, "leak-hp", {} );
        }
}

function stopLeakTimerIfRequired(api) {
    if(api.getTimer(consts.HP_LEAK_TIMER)){
        api.info(`damageEffect: damage was healed or system was dead ==> stop leak HP timer!`);
        api.removeTimer(consts.HP_LEAK_TIMER);
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

        api.info(`characterResurectEvent: systems ${medhelpers.getSystemsStateString(api)}`);

        //Пройти по всем системам
        api.model.systems = api.model.systems.map( (sys,systemID) => {
            //Найти все модификаторы для системы
            let systemName = consts.medicSystems[systemID].name;
            let modifiers = api.getModifiersBySystem(systemName);
            let systemState = 1;

            //Убить все болезни
            helpers.getAllIlnesses(api).forEach( ill => medhelpers.removeIllness(api, ill.mID) );

            //Включить все импланты
            modifiers = helpers.getAllImplants(api)
                                    .forEach( m => {
                                        m.enabled = true;
                                        api.info(`characterResurectEvent: enable ${m.id} implant`);
                                        systemState = 0;
                                    });


            //Если это нервная система, то она не может быть "отключенной"
            if(systemName == "nervous"){
                systemState = 1;
            }

            return systemState;
        });

        api.info(`characterResurectEvent: systems after ${medhelpers.getSystemsStateString(api)}`);

        let m =  api.getModifierById(consts.DAMAGE_MODIFIER_MID);
        if(m){
            m.damage = 0;
        }

        api.model.isAlive = true;

        api.info(`characterResurectEvent: character id=${api.model._id} login=${api.model.login || ""} is live again!`);

        helpers.addChangeRecord(api, `Базовые функции жизнедеятельности организма восстановлены`, event.timestamp);
    }

}

/**
 * Обработчик эффекта "timed-recover-hp"
 * Этот эффект реализует механику имплантов "автоматическое восстаноаление хитов в случае легкого ранения"
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
    if(!api.model.isAlive){
        api.info("timedRecoveryEffect: character already dead. Stop processing");
        return;
    }

    let params = helpers.checkPredicate(api, modifier.mID, "timed-recover-hp");
    api.info("timedRecoveryEffect: start, predicate: " + JSON.stringify(params));

    let m =  api.getModifierById(consts.DAMAGE_MODIFIER_MID);

    if(m && m.damage && params && params.recoveryRate){
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
    let m =  api.getModifierById(consts.DAMAGE_MODIFIER_MID);

    if(m && m.damage && api.model.isAlive){
        m.damage -= 1;
        api.info(`recoverHpEvent: damage-1 => damage == ${m.damage}`);

        helpers.addChangeRecord(api, "Вы восстановили 1 hp", event.timestamp);
    }
}

/**
 * Обработчик эффекта "timed-recover-systems"
 * Этот эффект реализует механику имплантов "автоматическое восстановление из тяжелого ранения"
 * Эффект зависит от предикатов, в параметрах которых должно быть:
 *  { "recoveryTime": x, "hpRemain" : y }
 *
 * Где x = время восстановления в секундах, а y - количество хитов после восстанвления
 * (восстанавливается не больше базы)
 *
 * Логика работы:
 * если hp==0 то поставить таймер, событие по которому:
 * 1. вылечит все отключенные системы, на которых нет имплантов
 * 2. выставить повреждения в зависимости от параметров
 */
function timedRecoverSystemsEffect(api, modifier){
    if(!api.model.isAlive){
        api.info("timedRecoverSystemsEffect: character already dead. Stop processing");
        return;
    }

    let params = helpers.checkPredicate(api, modifier.mID, "timed-recover-systems");
    api.info("timedRecoverSystemsEffect: start, predicate: " + JSON.stringify(params));

    let deadSystems = medhelpers.getDeadSystems(api);

    if(deadSystems.length){
        api.info(`timedRecoverSystemsEffect: has dead systems ${medhelpers.getSystemsStateString(api)}`);

        let hpRemain = params.hpRemain ? params.hpRemain : 0;
        let timerName = "hpRecoverySys-" + modifier.mID;

        if(!api.getTimer(timerName)){
            api.info(`timedRecoverSystemsEffect: dead systems detected ==> set system recovery timer, with name ${timerName} to ${params.recoveryTime} sec!`);
            api.setTimer( timerName, params.recoveryTime*1000, "recover-systems", { mID: modifier.mID, hpRemain } );
        }else{
            api.info(`timedRecoverSystemsEffect: dead systems detected ==> timer already activated!`);
        }

    }
}

/**
 * Обработчик события recover-systems
 * Событие срабатывает по таймеру, который выставляется эффектом timed-recover-systems
 */
function recoverSystemsEvent(api, data, event){
    let modifier = api.getModifierById(data.mID);

    if(!modifier || !modifier.enabled){
        api.info(`recoverSystemsEvent: implant removed or disabled. Stop processing`)
        return;
    }

    if(!api.model.isAlive){
        api.info(`recoverSystemsEvent: character already dead. Stop processing`)
        return;
    }

    api.info(`recoverSystems: event handler!`)

    //Ограничить использование импланта - максимум 3 раза
    if(modifier.count){
        if(modifier.count > 2){
            api.info(`recoverSystemsEvent: counter ${modifier.count} > 2, implant is not working. Stop processing`)
            helpers.addChangeRecord(api, `Ресурсы импланта ${modifier._id} исчерпаны. Необходимо срочное медицинское вмешательство`, event.timestamp);
            return;
        }else{
           modifier.count += 1;
        }
    }else{
        modifier.count = 1;
    }

    if(api.model.systems){
        api.info(`recoverSystemsEvent: counter ${modifier.count}, systems before ${medhelpers.getSystemsStateString(api)}`)

        //Найти все отключенные системы организма, для которых нет имплантов и "починить их"
        let deadSystems = medhelpers.getDeadSystems(api);

        deadSystems.forEach( si => {
            api.info(`recoverSystemsEvent: Recovering system ${consts.medicSystems[si].name}`)
            api.model.systems[si] = 1;
        });
    }

    //Включить все импланты
    helpers.getAllImplants(api).forEach( m => m.enabled = true );

    //Проставить повреждения (восстановление не с полными хитами)
    //Повреждения выставляются "примерно" т.к. внутри обработчика события нельзя понять точно MaxHP персонажа
    //Если hpRemain не передается или ==0 то персонаж восстанавливается с полными хитами
    if(data.hpRemain){
        let maxHP = medhelpers.calcMaxHP(api);
        let dmgMod =  api.getModifierById(consts.DAMAGE_MODIFIER_MID);

        dmgMod.damage = maxHP - data.hpRemain;

        api.info(`recoverSystemsEvent: hpRemain: ${data.hpRemain}, maxHP: ${maxHP} ==> damage: ${dmgMod.damage}`);
    }

    helpers.addChangeRecord(api, `Имплант ${modifier._id} провел восстановление организма.`, event.timestamp);
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
        recoverHpEvent,
        regenHpEvent,
        timedRecoverSystemsEffect,
        recoverSystemsEvent
    };
};

