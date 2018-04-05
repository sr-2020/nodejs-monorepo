import _ = require('lodash');
import helpers = require('../helpers/model-helper');
import medichelpers = require('../helpers/medic-helper');
import { ModelApiInterface, Modifier } from "deus-engine-manager-api";

/*
  modifier jj-immortal-one: {
      currentStage: number
      stages: {
          duration: number
          text: string
      }
      startTime: timestamp
  }

  pill jj-immortal-one: {
      stages: {
          duration: number
          text: string
      }
  }

  pill jj-immortal-two: {
      stages: string[]
      cubes: string
  }
*/

// Событие jj-immortal-one-start
function jjImmortalOneStartEvent(api: ModelApiInterface, data, event) {
    api.info('jjImmortalOneStartEvent');

    if (api.model.profileType != 'human') {
        api.error('jjImmortalOneStartEvent: not a human');
        return;
    }

    if (!api.model.isAlive) {
        api.error('jjImmortalOneStartEvent: character is dead');
        return;
    }

    const pill = data.pill;

    if (pill.id != 'jj-immortal-one') {
        api.error('jjImmortalOneStartEvent: wrong pill %s', pill.id);
        return;
    }

    let modifier: Modifier = {
        mID: "",
        name: 'jj-immortal-one',
        currentStage: 0,
        stages: pill.stages,
        startTime: event.timestamp,
        enabled: true,
        effects: []
    };

    modifier = api.addModifier(modifier);

    const text = modifier.stages[modifier.currentStage].text;
    helpers.addChangeRecord(api, text, event.timestamp);

    const timerName = 'jj-immortal-one-' + modifier.mID;

    api.info('jjImmortalOneStartEvent: set timer %s', timerName);
    api.setTimer(timerName, modifier.stages[0].duration * 1000, 'jj-immortal-one-next-stage', {mID: modifier.mID});
}

// Событие jj-immortal-one-next-stage
function jjImmortalOneNextStageEvent(api: ModelApiInterface, data, event) {
    if (!data.mID) {
        api.error('jjImmortalOneNextStage: no mID');
        return;
    }

    const modifier = api.getModifierById(data.mID);

    if (!modifier) {
        api.error('jjImmortalOneNextStage: modifier not found');
        return;
    }

    if (modifier.currentStage >= modifier.stages.length - 1) {
        api.error('jjImmortalOneNextStage: already finished');
        return;
    }

    modifier.currentStage += 1;

    const text = modifier.stages[modifier.currentStage].text;
    helpers.addChangeRecord(api, text, event.timestamp);

    const duration = modifier.stages[modifier.currentStage].duration || 1;
    const timerName = 'jj-immortal-one-' + modifier.mID;

    if (modifier.currentStage >= modifier.stages.length - 1) {
        api.info('jjImmortalOneStartEvent: last stage reached, remove modifier');
        api.removeModifier(modifier.mID);
    } else {
        api.info('jjImmortalOneStartEvent: start timer %s', timerName);
        api.setTimer(timerName, duration * 1000, 'jj-immortal-one-next-stage', {mID: modifier.mID});
    }
}

// Событие jj-immortal-two-start
function jjImmortalTwoStartEvent(api: ModelApiInterface, data, event) {
    api.info('jjImmortalOneStartEvent');

    if (api.model.profileType != 'human') {
        api.error('jjImmortalTwoStartEvent: not a human');
        return;
    }

    if (!api.model.isAlive) {
        api.error('jjImmortalTwoStartEvent: character is dead');
        return;
    }

    if (!data.pill || data.pill.id != 'jj-immortal-two') {
        api.error('jjImmortalOneStartEvent: wrong pill %j', data.pill);
        return;
    }

    const jjOnes = api.getModifiersByName('jj-immortal-one');

    if (jjOnes.length != 1) {
        api.error("jjImmortalTwoStartEvent: can't find jj-immortal-one modifier " + jjOnes.length);
        return;
    }

    const jjOne = jjOnes[0];

    if (jjOne.currentStage != 2) {
        api.error('jjImmortalTwoStartEvent: wrong jj-immortal-one stage: %s', jjOne.currentStage);
        return;
    }

    api.removeTimer('jj-immortal-one-' + jjOne.mID);
    api.setTimer('jj-immortal-two-awake', 5 * 60 * 1000, 'jj-immortal-two-awake', data);
    helpers.addChangeRecord(api, data.pill.stages[0], event.timestamp);
}

// Событие jj-immortal-two-awake
function jjImmortalTwoAwakeEvent(api: ModelApiInterface, data, event) {
    api.info('jjImmortalOneAwakeEvent');

    if (api.model.profileType != 'human') {
        api.error('jjImmortalTwoAwakeEvent: not a human');
        return;
    }

    if (!api.model.isAlive) {
        api.error('jjImmortalTwoAwakeEvent: character is dead');
        return;
    }

    const pill = data.pill || {};

    if (pill.id != 'jj-immortal-two') {
        api.error('jjImmortalOneAwakeEvent: wrong pill %s', pill.id);
        return;
    }

    const jjOnes = api.getModifiersByName('jj-immortal-one');

    if (jjOnes.length != 1) {
        api.error("jjImmortalTwoStartEvent: can't find jj-immortal-one modifier " + jjOnes.length);
        return;
    }

    const jjOne = jjOnes[0];

    if (!jjOne) {
        api.error("jjImmortalTwoAwakeEvent: can't find jj-immortal-one modifier");
        return;
    }

    api.removeModifier(jjOne.mID);

    api.info('jjImmortalTwoAwakeEvent: remove implants');
    api.model.modifiers = api.model.modifiers.filter((m) => !helpers.isImplant(m));

    api.info('jjImmortalTwoAwakeEvent: remove illnesses');
    helpers.getAllIlnesses(api).forEach((m) => {
        medichelpers.removeIllness(api, m.mID);
    });

    api.model.systems = api.model.systems.map(() => 1);
    api.model.genome[12] = 1;

    api.info('jjImmortalTwoAwakeEvent: set cubes');
    helpers.modifyMindCubes(api, api.model.mind, pill.cubes);

    helpers.addChangeRecord(api, pill.stages[1], event.timestamp);
}

module.exports = {
    jjImmortalOneStartEvent,
    jjImmortalOneNextStageEvent,
    jjImmortalTwoStartEvent,
    jjImmortalTwoAwakeEvent
};
