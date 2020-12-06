import * as moment from 'moment';
import { EventModelApi, Modifier } from '@alice/interface/models/alice-model-engine';
import { DeusExModel } from '../deus-ex-model';
import helpers = require('../helpers/model-helper');
import medichelpers = require('../helpers/medic-helper');

interface JjImmortalOneModifier extends Modifier {
  currentStage: number;
  stages: Array<{ duration: number; text: string }>;
  startTime: number;
}

interface JjImmortalTwoModifier extends Modifier {
  stages: string[];
  cubes: string;
}

/*
  pill jj-immortal-one: {
      stages: {
          duration: number
          text: string
      }
  }
*/

// Событие jj-immortal-one-start
function jjImmortalOneStartEvent(api: EventModelApi<DeusExModel>, data) {
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

  const modifier: JjImmortalOneModifier = {
    mID: '',
    name: 'jj-immortal-one',
    currentStage: 0,
    stages: pill.stages,
    startTime: api.model.timestamp,
    enabled: true,
    effects: [],
  };

  modifier.mID = api.addModifier(modifier).mID;

  const text = modifier.stages[modifier.currentStage].text;
  helpers.addChangeRecord(api, text, api.model.timestamp);

  const timerName = 'jj-immortal-one-' + modifier.mID;

  api.info(`jjImmortalOneStartEvent: set timer ${timerName}`);
  api.setTimer(timerName, '', moment.duration(modifier.stages[0].duration, 'seconds'), 'jj-immortal-one-next-stage', { mID: modifier.mID });
}

// Событие jj-immortal-one-next-stage
function jjImmortalOneNextStageEvent(api: EventModelApi<DeusExModel>, data) {
  if (!data.mID) {
    api.error('jjImmortalOneNextStage: no mID');
    return;
  }

  const modifier = api.getModifierById(data.mID) as JjImmortalOneModifier | undefined;

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
  helpers.addChangeRecord(api, text, api.model.timestamp);

  const duration = modifier.stages[modifier.currentStage].duration ?? 1;
  const timerName = 'jj-immortal-one-' + modifier.mID;

  if (modifier.currentStage >= modifier.stages.length - 1) {
    api.info('jjImmortalOneStartEvent: last stage reached, remove modifier');
    api.removeModifier(modifier.mID);
  } else {
    api.info(`jjImmortalOneStartEvent: start timer ${timerName}`);
    api.setTimer(timerName, '', moment.duration(duration, 'seconds'), 'jj-immortal-one-next-stage', { mID: modifier.mID });
  }
}

// Событие jj-immortal-two-start
function jjImmortalTwoStartEvent(api: EventModelApi<DeusExModel>, data) {
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
  api.setTimer('jj-immortal-two-awake', '', moment.duration(5, 'minutes'), 'jj-immortal-two-awake', data);
  helpers.addChangeRecord(api, data.pill.stages[0], api.model.timestamp);
}

// Событие jj-immortal-two-awake
function jjImmortalTwoAwakeEvent(api: EventModelApi<DeusExModel>, data) {
  api.info('jjImmortalOneAwakeEvent');

  if (api.model.profileType != 'human') {
    api.error('jjImmortalTwoAwakeEvent: not a human');
    return;
  }

  if (!api.model.isAlive) {
    api.error('jjImmortalTwoAwakeEvent: character is dead');
    return;
  }

  const pill = data.pill ?? {};

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

  api.model.systems = api.model.systems!.map(() => 1);
  api.model.genome![12] = 1;

  api.info('jjImmortalTwoAwakeEvent: set cubes');
  helpers.modifyMindCubes(api, api.model.mind, pill.cubes);

  helpers.addChangeRecord(api, pill.stages[1], api.model.timestamp);
}

module.exports = {
  jjImmortalOneStartEvent,
  jjImmortalOneNextStageEvent,
  jjImmortalTwoStartEvent,
  jjImmortalTwoAwakeEvent,
};
