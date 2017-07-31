var _ = require('lodash');
var medicHelpers = require('../helpers/medic-helper.js')();

function useCure(api, pill) {
    // нет болезней - нет лечения
}

function useStamm(api, pill) {
    _.set(api.model, ['genome', pill.affectedGenomePos], pill.affectedGenomeVal);
}

function useAid(api, pill) {
    medicHelpers.restoreDamage(api, 1);
    if (_.get(api.model, ['usedPills', pill._id])) {
        _.set(api.model, ['genome', pill.affectedGenomePos], pill.affectedGenomeVal);
    }
}

function usePill(api, data, event) {
    let pill = api.aquired('pills', data.id);
    if (!pill) return;

    switch (pill.pillType) {
    case 'cure':
        useCure(api, pill);
        break;
    case 'stamm':
        useStamm(api, pill);
        break;
    case 'aid':
        useAid(api, pill);
        break;
    }

    _.set(api.model, ['usedPills', pill._id], event.timestamp);
}

function aquirePills(api, events) {
    events
        .filter((event) => event.eventType == 'usePill')
        .forEach((event) => api.aquire('pills', event.data.id));
}

module.exports = {
    _preprocess: aquirePills,
    usePill
};
