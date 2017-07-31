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

function startTemporaryCubeChange(api, cubeChange)
{    
    api.debug("Narco will add modifier")
    //Изменение должно быть временным. Накладываем эффект

    var targetTimerId = helpers().uuidv4();

    var effect = api.getCatalogObject("effects", "change-mind-cube-effect");
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
        mindCubeChange: cubeChange.change,
        pushbackDuration: cubeChange.revertAfter * 100
    };

    //Установка модификатора
    modifier = api.addModifier(modifier);

    api.debug(modifier);

    api.setTimer(consts().NARCO_TIME_PREFIX + modifier.mID, cubeChange.revertAfter * 1100 - 1, "stop-narco-modifier", {mID : modifier.mID} );
}

function applyNarcoEffect(api, data, event)
{
    api.info(`Taking narco effect: ${event.data}`);
    let narco = loadNarco(api, event.data);
    if (narco.mindCubeChanges)
        {
            narco.mindCubeChanges.forEach(function(cubeChange) {
                if (cubeChange.revertAfter)
                    {
                        //Изменение должно быть временным. Накладываем эффект
                        startTemporaryCubeChange(api, cubeChange);
                    }
                    else {
                        //Изменение должно быть постоянным. Меняем базовую модель
                        helpers().modifyMindCubes(api, api.model.mind, cubeChange.change);
                    }
                
            }, this);
        }
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