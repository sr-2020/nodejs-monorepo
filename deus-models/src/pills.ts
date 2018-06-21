import _ = require('lodash');
import helpers = require('../helpers/model-helper');
import consts = require('../helpers/constants');
import { Modifier, ModelApiInterface, PreprocessApiInterface } from "deus-engine-manager-api";

const PILL_TIMEOUT = 2 * 60 * 60 * 1000;


function useCure(api: ModelApiInterface, pill) {
    if (api.model.profileType != 'human') return;

    api.sendEvent(null, 'delay-illness', {system: pill.curedSystem, delay: pill.duration * 1000});
    if (api.model.genome && _.get(api.model, ['usedPills', pill.id])) {
        _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
    }
}

function useStamm(api: ModelApiInterface, pill) {
    if (api.model.profileType != 'human') return;

    if (api.model.genome) {
        _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
    }
}

function useAid(api: ModelApiInterface, pill, event) {
    if (api.model.profileType != 'human') return;
    api.model.hp += 1;
}

function useLastChance(api: ModelApiInterface, pill) {
    if (api.model.profileType != 'human') return;

    let deathTimer = api.getTimer(consts.DEATH_TIMER);
    if (deathTimer) {
        deathTimer.miliseconds += 20 * 60 * 1000;
        api.info(`new death timer: ${deathTimer.miliseconds}`);
    } else {
        api.error('death timer not found');
    }
}

function useNarco(api: ModelApiInterface, pill) {
    if (api.model.profileType != 'human') return;
    api.sendEvent(null, 'take-narco', { id: pill.id, narco: pill });
}

function useGeneric(api: ModelApiInterface, pill) {
    api.sendEvent(null, pill.eventType, {pill});
}

function usePill(api: ModelApiInterface, data, event) {
    if (!api.model.isAlive) {
        api.error(`usePill: Dead can't use pills or anything at all, to be honest.`);
        return;
    }

    let code = api.aquired('pills', data.id);
    if (!code) {
        api.error(`usePill: can't aquire code ${data.id}`);
        return;
    }

    if (code.usedAt) {
        api.error(`usePill: allready used ${data.id$}`);
        return;
    }

    let pill = api.getCatalogObject('pills', code.pillId);
    if (!pill) {
        api.error(`usePill: can't load pill ${code.pillId}`);
        return;
    }

    api.info(`usePill: started code: ${JSON.stringify(code)}, pill: ${JSON.stringify(pill)}`);

    const previousUsage = _.get(api.model, ['usedPills', pill.id]);

    if(code._id.startsWith("9c5d9d84-dbf2")){

        let pillText = code._id.substring(code._id.length - 6);
        helpers.addChangeRecord(api, `Вы использовали препарат ${pillText}`, event.timestamp);
    }

    if (!previousUsage || event.timestamp - previousUsage > PILL_TIMEOUT) {
        switch (pill.pillType) {
        case 'cure':
            useCure(api, pill);
            break;
        case 'stamm':
            useStamm(api, pill);
            break;
        case 'aid':
            useAid(api, pill, event);
            break;
        case 'lastChance':
            useLastChance(api, pill);
            break;
        case 'narco':
            useNarco(api, pill);
            break;
        case "generic":
            useGeneric(api, pill);
            break;
        default:
            return;
        }
    }
    else {
        api.info(`Pill of type ${pill.id} already used lately, cooldown not expired.`);
    }

    _.set(api.model, ['usedPills', pill.id], event.timestamp);
    code.usedAt = event.timestamp;
    code.usedBy = api.model._id;
}

function aquirePills(api: PreprocessApiInterface, events) {
    if (!api.model.isAlive) return;

    events
        .filter((event) => event.eventType == 'usePill')
        .forEach((event) => api.aquire('pills', event.data.id));
}

module.exports = {
    _preprocess: aquirePills,
    usePill
};
