/**
 * Эффекты и события для работы болезней 
 */

let consts = require('../helpers/constants');
let helpers = require('../helpers/model-helper');
let medHelpers = require('../helpers/medic-helper');
let clones = require("clones");


/**
 * Обработчик события start-illness
 * Добавляет в модель болезнь (таким образом запуская ее)
 * { id: ilness-id }
 */
function startIllnessEvent( api, data, event ){
    if(data.id && api.model.profileType ==  "human"){
        api.info(`startIllnessEvent: try to start illness: ${data.id}`);

        let _illness = helpers().loadIllness(api, data.id);

        if(_illness && _illness.illnessStages && _illness.illnessStages.length){
        
            //Если система уже мертвая - то болезнь не запускается
            if( !medHelpers().isSystemAlive(api, _illness.system) ){
                api.info(`startIllnessEvent: system: ${_illness.system} is dead. Stop processing`);
                return;
            }

            //Есть ли импланты на этой системе
            //Проверка для нервной системы фактически, остальные "умирают" при установке импланта
            if(helpers().getImplantsBySystem(api, _illness.system).length){
                api.info(`startIllnessEvent: system: ${_illness.system} have implants. Stop processing`);
                return;
            }

            let illness = clones(_illness);
            illness.startTime = event.timestamp;
            api.info(`startIllnessEvent: Add illness: ${illness.displayName}`);
            
            //Установка болезни
            illness = api.addModifier(illness);

            illness.currentStage = 0;

            //Запуск таймера болезни
            let timerName = `${illness._id}-${illness.mID}`

            api.info(`startIllnessEvent: start timer: ${timerName} to ${illness.illnessStages[0].duration} sec (stage 0)`);

            api.setTimer( timerName, illness.illnessStages[0].duration*1000, 
                            "illness-next-stage", { mID: illness.mID } );
        }else{
            api.error(`startIllnessEvent: can't load illness: ${_illness.displayName}`);
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
        helpers().addCharacterCondition(api, modifier.illnessStages[modifier.currentStage].condition);
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
                api.model.systems[ medHelpers().getSystemID(illness.system) ] = 0;  

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


module.exports = () => {
    return {
        startIllnessEvent,
        illnessEffect,
        illnessNextStageEvent,
        delayIllnessEvent
    };
};

