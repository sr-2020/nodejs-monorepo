///  Narco effects

import helpers = require('../helpers/model-helper');
import { EventModelApi, Modifier } from '@alice/interface/models/alice-model-engine';
import { DeusExModel } from '../deus-ex-model';
import { Narcotic } from '../helpers/catalog_types';

function loadNarco(api: EventModelApi<DeusExModel>, id) {
  const drug = api.getCatalogObject<Narcotic>('pills', id);
  if (drug && drug.pillType == 'narco') {
    return drug;
  } else {
    api.error(`Can't find drug ${id}`);
    return null;
  }
}

function createNarcoEffectModifier(api: EventModelApi<DeusExModel>, effectName, modifierId): Modifier | undefined {
  return helpers.createEffectModifier(api, effectName, modifierId, 'Воздействие каких-то таблеток', 'narco');
}

function addModifierTemporary(api: EventModelApi<DeusExModel>, modifier, duration) {
  modifier = api.addModifier(modifier);
  api.debug(modifier);
  helpers.setTimerToKillModifier(api, modifier, duration);
  return modifier;
}

function startTemporaryCubeChange(api: EventModelApi<DeusExModel>, narco) {
  api.debug('Narco will add modifier');
  //Изменение должно быть временным. Накладываем эффект

  const baseModifier = createNarcoEffectModifier(api, 'change-mind-cube-effect', 'narcoEffects');
  if (!baseModifier) {
    return;
  }

  const duration = narco.duration * 1000;
  const modifier = {
    ...baseModifier,
    mindCubeChange: narco.mindCubeTemp,
    pushbackDuration: narco.mindCubePushbackEnabled ? duration / 10 : 0,
  };

  //Установка модификатора
  addModifierTemporary(api, modifier, duration + modifier.pushbackDuration);
}

function addTemporaryConditons(api: EventModelApi<DeusExModel>, narco) {
  api.debug('Narco will add modifier');

  const modifier = createNarcoEffectModifier(api, 'show-always-condition', 'narcoEffectsCondition');
  if (!modifier) {
    return;
  }

  modifier.conditions = narco.conditions;

  addModifierTemporary(api, modifier, narco.duration * 1000);
}

function canAscend(api) {
  const genome = api.model.genome;
  return genome && genome[2 - 1] == 0 && genome[7 - 1] == 3 && genome[10 - 1] == 2 && genome[12 - 1] == 1;
}

function performAscend(api) {
  api.info('ASCENDING NOW ***** ******');

  let modifier = createNarcoEffectModifier(api, 'show-always-condition', 'narcoAscendCondition');
  if (!modifier) {
    return;
  }

  modifier.conditions = ['ascend-condition'];

  modifier = api.addModifier(modifier);
  api.debug(modifier);

  api.model.genome[7 - 1] = 4;
  api.model.genome[10 - 1] = 4;
  api.model.genome[12 - 1] = 4;
}

function dieHorribleDeath(api) {
  api.info('Anscension failed, death awaits..');
  const deathAwaitTimeMs = 42 * 60 * 1000;
  helpers.addDelayedEvent(api, deathAwaitTimeMs, 'start-illness', { id: 'ankylosingspondylitis' });
  helpers.addDelayedEvent(api, deathAwaitTimeMs, 'start-illness', { id: 'DiseaseItsenkoKushinga' });
  helpers.addDelayedEvent(api, deathAwaitTimeMs, 'start-illness', { id: 'Dementia' });
}

function takeNarcoEvent(api: EventModelApi<DeusExModel>, data) {
  api.info(`Taking narco effect: ${data.id}`);

  const narco = data.narco ?? loadNarco(api, data.id);

  api.debug(JSON.stringify(narco));

  if (!narco) return;

  if (api.model.profileType != 'human') {
    api.error('Only humans can use narcotics');
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

  narco.history_record = narco.history_record ?? 'Вы приняли таблетку.';

  api.debug('Narco will add history record ' + narco.history_record);
  helpers.addChangeRecord(api, narco.history_record, api.model.timestamp);
}

/**
 * Remove narco modifier by id
 */
function stopNarcoModifier(api: EventModelApi<DeusExModel>, data) {
  api.info(`Removing narco effect ${data.mID}`);
  if (data.mID) {
    const modifier = api.getModifierById(data.mID);
    if (modifier) {
      api.removeModifier(data.mID);
    }
  }
}

module.exports = () => {
  return {
    takeNarcoEvent,
    stopNarcoModifier,
  };
};
