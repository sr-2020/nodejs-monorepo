///  Narco effects


let type = require('type-detect');
let helpers = require('../helpers/model-helper');
let Chance = require('chance');
let chance = new Chance();
let consts = require('../helpers/constants');

function loadNarco(api, id)
{
    return api.getCatalogObject("narco", id.toLowerCase());
}

function startTemporaryCubeChange(api, narco)
{    
    api.debug("Narco will add modifier")
    //Изменение должно быть временным. Накладываем эффект

    var effect = api.getCatalogObject("effects", "change-mind-cube-effect");
    
    if (!effect)
        {
            api.warn("Can't load effect change-mind-cube-effect");
            return;
        }

    effect.enabled = true;
    var modifier = { 
        id: "narcoEffects",
        name: "narco-effect",
        displayName: "Воздействие каких-то таблеток",
        class: "narco",
        effects: [
            effect
        ],
        enabled: true,
        mindCubeChange: narco.mindCubeTemp,
    };

    modifier.pushbackDuration =  narco.mindCubePushbackEnabled ? narco.duration * 100 : 0;

    //Установка модификатора
    modifier = api.addModifier(modifier);

    api.debug(modifier);

    setTimerToKillModifier(api, modifier, narco.duration * 1000 + modifier.pushbackDuration)
}

function addTemporaryConditons(api, narco)
{    
    api.debug("Narco will add modifier")
    //Изменение должно быть временным. Накладываем эффект

    var effect = api.getCatalogObject("effects", "show-always-condition");
    
    if (!effect)
        {
            api.warn("Can't load effect change-mind-cube-effect");
            return;
        }

    effect.enabled = true;
    var modifier = { 
        id: "narcoEffectsCondition",
        displayName: "Воздействие каких-то таблеток",
        class: "narco",
        effects: [
            effect
        ],
        enabled: true,
        conditions: narco.conditions
    };

    //Установка модификатора
    modifier = api.addModifier(modifier);

    api.debug(modifier);

    setTimerToKillModifier(api, modifier, narco.duration * 1000)
}

function setTimerToKillModifier(api, modifier, timestamp)
{
    api.setTimer(
        consts().NARCO_TIME_PREFIX + modifier.mID,
        timestamp - 1, 
        "stop-narco-modifier", 
        {mID : modifier.mID} );
}

function applyNarcoEffect(api, data, event)
{
    api.info(`Taking narco effect: ${event.data}`);
    let narco = loadNarco(api, event.data);
    api.debug(JSON.stringify(narco));
    if (narco.mindCubePermanent)
        {
            //Изменение должно быть постоянным. Меняем базовую модель
            helpers().modifyMindCubes(api, api.model.mind, narco.mindCubePermanent);
        }
    
    if (narco.mindCubeTemp)
        {
            //Изменение должно быть временным. Накладываем эффект
            startTemporaryCubeChange(api, narco);
        }

    if (narco.conditions)
        {
            addTemporaryConditons(api, narco);
        }
    
    narco.history_record = narco.history_record || 'Вы приняли таблетку.';
    
    api.debug("Narco will add history record " + narco.history_record)
    helpers().addChangeRecord(api, narco.history_record, event.timestamp);       
}

/**
 * Remove narco modifier by id
 */
function removeNarcoEffect(api, data, event)
{
    api.info(`Removing narco effect ${data.mID}`)
    if(data.mID){
        let modifier = api.getModifierById(data.mID);
        if(modifier){
            api.removeModifier(data.mID);
        }
    }
}

module.exports = () => {
    return {
        applyNarcoEffect,
        removeNarcoEffect
    };
};