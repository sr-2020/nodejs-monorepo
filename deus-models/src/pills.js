const _ = require('lodash');
const medicHelpers = require('../helpers/medic-helper.js')();
const helpers = require('../helpers/model-helper.js')();
const consts = require('../helpers/constants.js')();

const PILL_TIMEOUT = 2 * 60 * 60 * 1000;


function useCure(api, pill) {
    if (api.model.profileType != 'human') return;

    api.sendEvent(null, 'delay-illness', {system: pill.curedSystem, delay: pill.duration * 1000});
    if (api.model.genome && _.get(api.model, ['usedPills', pill.id])) {
        _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
    }
}

function useStamm(api, pill) {
    if (api.model.profileType != 'human') return;

    if (api.model.genome) {
        _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
    }
}

function useAid(api, pill, event) {
    if (api.model.profileType != 'human') return;

    medicHelpers.restoreDamage(api, 1, event.timestamp);
    if (api.model.genome && _.get(api.model, ['usedPills', pill.id])) {
        _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
    }
}

function useLastChance(api, pill) {
    if (api.model.profileType != 'human') return;

    let deathTimer = api.getTimer(consts.DEATH_TIMER);
    if (deathTimer) {
        deathTimer.miliseconds += 20 * 60 * 1000;
        api.info('new death timer: %s', deathTimer.miliseconds);
    } else {
        api.error('death timer not found');
    }
}

function useNarco(api, pill) {
    if (api.model.profileType != 'human') return;
    api.sendEvent(null, 'take-narco', { id: pill.id, narco: pill });
}

function usePill(api, data, event) {
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
        api.error('usePill: allready used %s', data.id);
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
            useCure(api, pill, event);
            break;
        case 'stamm':
            useStamm(api, pill, event);
            break;
        case 'aid':
            useAid(api, pill, event);
            break;
        case 'lastChance':
            useLastChance(api, pill);
            break;
        case 'narco':
            useNarco(api, pill, event);
            break;

        default:
            return;
        }
    }
    else {
        api.info(`Pill of type ${pill.id} already used lately, cooldown not expired.`)
    }

    _.set(api.model, ['usedPills', pill.id], event.timestamp);
    code.usedAt = event.timestamp;
    code.usedBy = api.model._id;
}

function aquirePills(api, events) {
    if (!api.model.isAlive) return;

    events
        .filter((event) => event.eventType == 'usePill')
        .forEach((event) => api.aquire('pills', event.data.id));
}

module.exports = {
    _preprocess: aquirePills,
    usePill
};
