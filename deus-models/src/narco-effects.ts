///  Narco effects


let type = require('type-detect');
import helpers = require('../helpers/model-helper');
import Chance = require('chance');
let chance = new Chance();
import consts = require('../helpers/constants');
import { Modifier } from "deus-engine-manager-api";

function loadNarco(api, id)
{
    let drug =  api.getCatalogObject("pills", id);
    if (drug && drug.pillType == 'narco') {
        return drug;
    } else {
        api.error(`Can't find drug ${id}`);
        return null;
    }
}

function createNarcoEffectModifier(api, effectName, modifierId): Modifier | undefined {
    return helpers.createEffectModifier(api, effectName, modifierId, "Воздействие каких-то таблеток", "narco");
}

function addModifierTemporary(api, modifier, duration){
    modifier = api.addModifier(modifier);
    api.debug(modifier);
    helpers.setTimerToKillModifier(api, modifier, duration)
    return modifier;
}

function startTemporaryCubeChange(api, narco)
{
    api.debug("Narco will add modifier")
    //Изменение должно быть временным. Накладываем эффект

    var modifier = createNarcoEffectModifier(api, "change-mind-cube-effect", "narcoEffects");
    if (!modifier)  { return; }

    let duration = narco.duration * 1000;
    modifier.mindCubeChange =  narco.mindCubeTemp,
    modifier.pushbackDuration =  narco.mindCubePushbackEnabled ? duration / 10 : 0;

    //Установка модификатора
    addModifierTemporary(api, modifier, duration + modifier.pushbackDuration)
}

function addTemporaryConditons(api, narco)
{
    api.debug("Narco will add modifier")

    let modifier = createNarcoEffectModifier(api, "show-always-condition", "narcoEffectsCondition");
    if (!modifier)  { return; }

    modifier.conditions = narco.conditions;

    addModifierTemporary(api, modifier, narco.duration * 1000)
}

function canAscend(api)
{
    let genome = api.model.genome;
    return (genome && genome[2-1] == 0 && genome[7-1] == 3 && genome[10-1] == 2 && genome[12-1] == 1);
}

function performAscend(api)
{
    api.info("ASCENDING NOW ***** ******");

    let modifier = createNarcoEffectModifier(api, "show-always-condition", "narcoAscendCondition");
    if (!modifier) {return;}

    modifier.conditions = ["ascend-condition"];

    modifier = api.addModifier(modifier);
    api.debug(modifier);

    api.model.genome[7-1] = 4;
    api.model.genome[10-1] = 4;
    api.model.genome[12-1] = 4;
}

function dieHorribleDeath(api) {
    api.info ("Anscension failed, death awaits..");
    let deathAwaitTimeMs = 42 * 60 * 1000;
    helpers.addDelayedEvent(api, deathAwaitTimeMs , "start-illness", {"id" : "ankylosingspondylitis"});
    helpers.addDelayedEvent(api, deathAwaitTimeMs , "start-illness", {"id" : "DiseaseItsenkoKushinga"});
    helpers.addDelayedEvent(api, deathAwaitTimeMs , "start-illness", {"id" : "Dementia"});
}

function applyNarcoEffect(api, data, event)
{
    api.info(`Taking narco effect: ${event.data.id}`);

    let narco = event.data.narco || loadNarco(api, event.data.id);;

    api.debug(JSON.stringify(narco));

    if (!narco) return;

    if (api.model.profileType != "human") {
        api.error("Only humans can use narcotics");
        narco.history_record = 'Таблетки могут есть только люди.';
        return;
    }

    if (narco.mindCubePermanent) {
        //Изменение должно быть постоянным. Меняем базовую модель
        helpers.modifyMindCubes(api, api.model.mind, narco.mindCubePermanent);
    }

    if (narco.mindCubeTemp) {
        //Изменение должно быть временным. Накладываем эффект
        startTemporaryCubeChange(api, narco);
    }

    if (narco.conditions) {
        addTemporaryConditons(api, narco);
    }

    if (narco.magicAscend) {
        if (canAscend(api)) {
            performAscend(api);
        } else {
            dieHorribleDeath(api);
        }
    }

    narco.history_record = narco.history_record || 'Вы приняли таблетку.';

    api.debug("Narco will add history record " + narco.history_record);
    helpers.addChangeRecord(api, narco.history_record, event.timestamp);
}

/**
 * Remove narco modifier by id
 */
function removeNarcoEffect(api, data, event)
{
    api.info(`Removing narco effect ${data.mID}`);
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
