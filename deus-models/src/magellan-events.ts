import { Condition, Effect, Event, ModelApiInterface, Modifier } from 'deus-engine-manager-api';
import uuid = require('uuid/v1');
import consts = require('../helpers/constants');
import { colorOfChange, getTypedOrganismModel, SystemColor,
  systemCorrespondsToColor, systemsIndices } from '../helpers/magellan';
import helpers = require('../helpers/model-helper');
import { getSymptomValue } from '../helpers/symptoms';

function modifySystemsInstant(api: ModelApiInterface, data: number[], event: Event) {
  helpers.addChangeRecord(api, 'Состояние систем организма изменилось!', event.timestamp);

  const model = getTypedOrganismModel(api);

  for (const i of systemsIndices()) {
    if (data[i] != 0) {
      model.systems[i].value += data[i];
      model.systems[i].lastModified = event.timestamp;
    }
  }
}

interface PreMutationData {
  mutationColor: SystemColor;
  diseaseStartTimestamp: number;
}

interface DiseaseTickData {
  systemsModification: number[];
  // Only set for the last tick and only if initial change is single-colored
  preMutationData?: PreMutationData;
}

function diseaseTick(api: ModelApiInterface, data: DiseaseTickData, event: Event) {
  modifySystemsInstant(api, data.systemsModification, event);
  const preMutationData = data.preMutationData;
  if (preMutationData) {
    const model = getTypedOrganismModel(api);
    const mutationData: MutationData = {
      color: preMutationData.mutationColor,
      diseaseStartTimestamp: preMutationData.diseaseStartTimestamp,
      newNucleotideValues: systemsIndices().map((i) => {
        if (!systemCorrespondsToColor(preMutationData.mutationColor, i)) return undefined;
        return model.systems[i].nucleotide + getSymptomValue(model.systems[i]);
      }),
    };
    api.setTimer(uuid(), consts.MAGELLAN_TICK_MILLISECONDS, 'mutation', mutationData);
  }
}

interface MutationData {
  color: SystemColor;
  diseaseStartTimestamp: number;
  newNucleotideValues: Array<number | undefined>;
}

function mutation(api: ModelApiInterface, data: MutationData, _event: Event) {
  for (const i of systemsIndices()) {
    if (!systemCorrespondsToColor(data.color, i) &&
      getTypedOrganismModel(api).systems[i].lastModified >= data.diseaseStartTimestamp)
      return; // Cancel mutation due to the change in the system of incompatible color
  }

  for (const i of systemsIndices()) {
    const newValueOrUndefined = data.newNucleotideValues[i];
    if (newValueOrUndefined) {
      getTypedOrganismModel(api).systems[i].nucleotide = newValueOrUndefined;
    }
  }
}

function useMagellanPill(api: ModelApiInterface, totalChange: number[], event: Event) {
  const totalTicks = Math.max(...totalChange.map(v => Math.abs(v)));
  for (let i = 0; i < totalTicks; ++i) {
    const adjustment = totalChange.map(v => {
      if (Math.abs(v) <= i) return 0;
      return Math.sign(v);
    });
    const tickData: DiseaseTickData = { systemsModification: adjustment };
    if (i == totalTicks - 1) {
      const color = colorOfChange(totalChange);
      if (color) {
        tickData.preMutationData = {
          mutationColor: color,
          diseaseStartTimestamp: event.timestamp,
        };
      }
    }

    api.setTimer(uuid(), i * consts.MAGELLAN_TICK_MILLISECONDS, 'disease-tick', tickData);
  }
}

interface OnTheShipModifier extends Modifier {
  shipId: number;
}

function enterShip(api: ModelApiInterface, data: number, event: Event) {
  leaveShip(api, {}, event);
  // TODO: move to config
  const eff: Effect = { enabled: true, id: 'on-the-ship', class: 'physiology', type: 'normal', handler: 'onTheShip' };
  const m: OnTheShipModifier = { mID: 'OnTheShip', enabled: true, effects: [eff], shipId: data };
  api.addModifier(m);
}

function leaveShip(api: ModelApiInterface, _data: any, _event: Event) {
  api.removeModifier('OnTheShip');
}

function onTheShip(api: ModelApiInterface, modifier: OnTheShipModifier) {
  const c: Condition = {
    mID: uuid(), id: 'on-the-ship', class: 'physiology',
    text: `Вы находитесь на корабле номер ${modifier.shipId}`,
  };
  api.addCondition(c);
  getTypedOrganismModel(api).location = `ship_${modifier.shipId}`;
}

module.exports = () => {
  return {
    modifySystemsInstant,
    diseaseTick,
    mutation,
    useMagellanPill,
    onTheShip,
    enterShip,
    leaveShip,
  };
};
