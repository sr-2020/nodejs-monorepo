import * as _ from 'lodash';
import { default as consts } from '../helpers/constants';
import { default as helpers } from '../helpers/model-helper';
import { default as medichelpers } from '../helpers/medic-helper';
import { EventModelApi, Modifier, PreprocessApiInterface } from '@alice/alice-common/models/alice-model-engine';
import { DeusExModel } from '../deus-ex-model';
import { Narcotic } from '../helpers/catalog_types';

const PILL_TIMEOUT = 2 * 60 * 60 * 1000;

function useCure(api: EventModelApi<DeusExModel>, pill) {
  if (api.model.profileType != 'human') return;

  api.sendSelfEvent('delay-illness', { system: pill.curedSystem, delay: pill.duration * 1000 });
  if (api.model.genome && _.get(api.model, ['usedPills', pill.id])) {
    _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
  }
}

function useStamm(api: EventModelApi<DeusExModel>, pill) {
  if (api.model.profileType != 'human') return;

  if (api.model.genome) {
    _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
  }
}

function useAid(api: EventModelApi<DeusExModel>, pill) {
  if (api.model.profileType != 'human') return;

  medichelpers.restoreDamage(api, 1, api.model.timestamp);
  if (api.model.genome && _.get(api.model, ['usedPills', pill.id])) {
    _.set(api.model, ['genome', pill.affectedGenomePos - 1], pill.affectedGenomeVal);
  }
}

function useLastChance(api: EventModelApi<DeusExModel>, pill) {
  if (api.model.profileType != 'human') return;

  const deathTimer = api.getTimer(consts.DEATH_TIMER);
  if (deathTimer) {
    deathTimer.miliseconds += 20 * 60 * 1000;
    api.info('new death timer: %s', deathTimer.miliseconds);
  } else {
    api.error('death timer not found');
  }
}

function useNarco(api: EventModelApi<DeusExModel>, pill) {
  if (api.model.profileType != 'human') return;
  api.sendSelfEvent('take-narco', { id: pill.id, narco: pill });
}

function useImmortal(api: EventModelApi<DeusExModel>, pill) {
  if (api.model.profileType != 'human') return;
  api.model.profileType = 'exhuman-program';

  helpers.modifyMindCubes(api, api.model.mind, pill.mindCubePermanent);

  helpers.getAllImplants(api).forEach((implant) => helpers.removeImplant(api, implant, api.model.timestamp));
  delete api.model.genome;
  delete api.model.systems;
  delete api.model.generation;
  helpers.getAllIlnesses(api).forEach((ill) => medichelpers.removeIllness(api, ill.mID));

  let modifier: Modifier | undefined = helpers.createEffectModifier(
    api,
    'show-always-condition',
    'ImmortalProgram',
    'Эффект бессмертия',
    'immortal',
  );

  if (!modifier) {
    return;
  }

  modifier.conditions = ['pa_cyberg0-1', 'lab_becomehacker-3', 'pa-immortal-condition'];
  modifier = api.addModifier(modifier);
  api.info('IMMORTAL PANAM');
}

function useGeneric(api: EventModelApi<DeusExModel>, pill) {
  api.sendSelfEvent(pill.eventType, { pill });
}

export function usePill(api: EventModelApi<DeusExModel>, data) {
  if (!api.model.isAlive) {
    api.error(`usePill: Dead can't use pills or anything at all, to be honest.`);
    return;
  }

  const code = api.aquiredDeprecated('pills', data.id);
  if (!code) {
    api.error(`usePill: can't aquire code ${data.id}`);
    return;
  }

  if (code.usedAt) {
    api.error('usePill: allready used %s', data.id);
    return;
  }

  const pill = api.getCatalogObject<Narcotic>('pills', code.pillId);
  if (!pill) {
    api.error(`usePill: can't load pill ${code.pillId}`);
    return;
  }

  api.info(`usePill: started code: ${JSON.stringify(code)}, pill: ${JSON.stringify(pill)}`);

  const previousUsage = _.get(api.model, ['usedPills', pill.id]);

  if (code._id.startsWith('9c5d9d84-dbf2')) {
    const pillText = code._id.substring(code._id.length - 6);
    helpers.addChangeRecord(api, `Вы использовали препарат ${pillText}`, api.model.timestamp);
  }

  if (!previousUsage || api.model.timestamp - previousUsage > PILL_TIMEOUT) {
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
      case 'lastChance':
        useLastChance(api, pill);
        break;
      case 'narco':
        useNarco(api, pill);
        break;
      case 'immortal-panam':
        useImmortal(api, pill);
        break;
      case 'generic':
        useGeneric(api, pill);
        break;
      default:
        return;
    }
  } else {
    api.info(`Pill of type ${pill.id} already used lately, cooldown not expired.`);
  }

  _.set(api.model, ['usedPills', pill.id], api.model.timestamp);
  code.usedAt = api.model.timestamp;
  code.usedBy = api.model.modelId;
}

function aquirePills(api: PreprocessApiInterface<any>, events) {
  if (!api.model.isAlive) return;

  events.filter((event) => event.eventType == 'usePill').forEach((event) => api.aquire('pills', event.data.id));
}

export function _preprocess(api: PreprocessApiInterface<any>, events) {
  return aquirePills(api, events);
}
