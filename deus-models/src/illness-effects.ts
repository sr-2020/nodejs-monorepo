/**
 * Эффекты и события для работы болезней
 */

import consts = require('../helpers/constants');
import helpers = require('../helpers/model-helper');
import medhelpers = require('../helpers/medic-helper');
import clone = require("clone");
import infection = require('../helpers/infection-illness');


/**
 * Обработчик события start-illness
 * Добавляет в модель болезнь (таким образом запуская ее)
 * { id: ilness-id }
 */
function startIllnessEvent( api, data, event ){
    if(data.id && api.model.profileType ==  "human"){
        api.info(`startIllnessEvent: try to start illness: ${data.id}`);

        let _illness = helpers.loadIllness(api, data.id);

        if(_illness && _illness.illnessStages && _illness.illnessStages.length){

            //Если система уже мертвая - то болезнь не запускается
            if( !medhelpers.isSystemAlive(api, _illness.system) ){
                api.info(`startIllnessEvent: system: ${_illness.system} is dead. Stop processing`);
                return;
            }

            //Есть ли импланты на этой системе
            //Проверка для нервной системы фактически, остальные "умирают" при установке импланта
            if(helpers.getImplantsBySystem(api, _illness.system).length){
                api.info(`startIllnessEvent: system: ${_illness.system} have implants. Stop processing`);
                return;
            }

            let illness = clone(_illness);
            illness.startTime = event.timestamp;
            api.info(`startIllnessEvent: Add illness: ${illness.displayName}`);

            //Установка болезни
            illness = api.addModifier(illness);

            illness.currentStage = 0;

            //Запуск таймера болезни
            let timerName = `${illness.id}-${illness.mID}`

            api.info(`startIllnessEvent: start timer: ${timerName} to ${illness.illnessStages[0].duration} sec (stage 0)`);

            api.setTimer( timerName, illness.illnessStages[0].duration*1000,
                            "illness-next-stage", { mID: illness.mID } );
        }else{
            api.error(`startIllnessEvent: can't load illness: ${data.id}`);
        }
    }
}

/**
 * Эффект "болезни". Название эффекта "illness-effect"
 * Отображает состояние для данного этапа - симптомы.
 */
function illnessEffect( api, modifier ){
    if(modifier.class == "illness"){
        api.info(`illnessEffect: illness: ${modifier.displayName}, stage: ${modifier.currentStage}`);

        //Отладка
        let timer = api.getTimer(`${modifier.id}-${modifier.mID}`);
        let remain = timer ? timer.miliseconds : 0;
        api.info(`illnessEffect:  ${modifier.illnessStages[modifier.currentStage].condition}, time to next stage: ${Math.round(remain/1000)}`);

        //Показать состояние, связанное с текущей стадией
        helpers.addCharacterCondition(api, modifier.illnessStages[modifier.currentStage].condition);
    }
}

/**
 * Обработчик события "illness-next-stage"
 * Переводит болезнь на следующий этап и ставит таймер на следующий цикл
 * Если это был последний этап, то убивает систему для которой болезнь (и не ставит таймер)
 * Модификатор болезни остается до тех пор, пока не будет установлен имплант на эту систему
 */
function illnessNextStageEvent( api, data, event ){
     if(data.mID){
         let illness = api.getModifierById(data.mID);
         if(illness){
             //Если это промежуточный этап, просто перевести на следующий и поставить таймер
            if(illness.currentStage < illness.illnessStages.length - 1){
                illness.currentStage += 1;

                let duration = illness.illnessStages[ illness.currentStage ].duration || 1;
                let timerName = `${illness.id}-${illness.mID}`

                api.info(`startIllnessEvent: illness ${illness.id}, start stage ${illness.currentStage}, set timer to ${duration} sec`);

                api.setTimer( timerName, duration*1000, "illness-next-stage", { mID: illness.mID } );
            }else{
            //Если это последний этап, то убить систему
                let totalTime = Math.round((event.timestamp - illness.startTime)/1000);
                api.info(`startIllnessEvent: illness ${illness.id}, final stage ${illness.currentStage}, total time: ${totalTime} sec, kill system ${illness.system}!`);
                api.model.systems[ medhelpers.getSystemID(illness.system) ] = 0;

            }
         }
     }
}

/**
 * Удлинить текущий этап болезни. Событие delay-illness
 * { system: systemName, delay: ms }
 *
 * Работает так:
 * 1. Находит все болезни для данной системы
 * 2. Берет текущее значение таймера для каждой из болезни и увеличивает его значение на delay миллисекунд
 */
function delayIllnessEvent( api, data, event ){

    if(data.system && data.delay){
        //console.log(JSON.stringify(api.model.modifiers, null, 4));
        api.model.modifiers.filter( m => (m.system == data.system && m.class == "illness") ).forEach( m => {
            api.info( `delayIllness: found illness=${m.id}, try to change timer` )

            let timer = api.getTimer(`${m.id}-${m.mID}`);
            if(timer){
                api.info( `delayIllness: change timer for illness=${m.id}. Current: ${Math.round(timer.miliseconds/1000)}sec, update:  +${Math.round(data.delay/1000)} sec` )
                timer.miliseconds += data.delay;
            }
         });
    }
}

const illneses = [
    "acromegaly", "affectivebipolardisorder", "ankylosingspondylitis", "ankylosis", "arthritis",
    "asphyxia", "bronchialasthma", "burkittlymphoma", "coronaryheartdisease", "dementia",
    "diabetes", "diseaseitsenkokushinga", "dupuytrencontracture", "endocarditis", "heartdisease",
    "hypertension", "hyperthyroidism", "menieredisease", "mononucleosis", "multiplesclerosis",
    "myocarditis", "osteolysis", "pancreatitis", "pleurisy", "pneumonia", "schizophrenia",
    "sjogrensyndrome", "splenitis", "systemiclupuserythematosus", "tracheitis", "tuberculosis"
];

function rollForInfection(api, data,event) {
    api.debug("Start rolling for infection");
    if(api.model.profileType == "human") {
        let systemId = infection.whatSystemShouldBeInfected(api.model);

        if (systemId && systemId > -1) {
            let systemName = consts.medicSystems[systemId].name;

            api.info("Roll for infection: will infect " + systemName + " system.");

            let chance = helpers.getChanceFromModel(api.model);

            let illnessModels = chance.pickone(illneses
                .map(i => api.getCatalogObject("illnesses", i))
                .filter(i => i.system == systemName));

            api.debug("Roll for infection: will start illness " + illnessModels.id);

            let deathAwaitTimeMs = chance.natural({min:0, max:3 * 60 * 60 * 1000});

            helpers.addDelayedEvent(api, deathAwaitTimeMs , "start-illness", {"id" : illnessModels.id});
            api.sendEvent(null, "start-illness", { id: illnessModels.id });
        }
        else{
            api.info("Roll for infection: nothing will happen");
        }
    }
}


module.exports = () => {
    return {
        startIllnessEvent,
        illnessEffect,
        illnessNextStageEvent,
        delayIllnessEvent,
        rollForInfection
    };
};

