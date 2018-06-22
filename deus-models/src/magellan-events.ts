import { ModelApiInterface, Modifier, Effect, Condition, Event } from "deus-engine-manager-api";
import consts = require('../helpers/constants');
import uuid = require('uuid/v1');
import helpers = require('../helpers/model-helper');
import { systemsIndices, getTypedOrganismModel, SystemColor, colorOfChange, systemCorrespondsToColor } from "../helpers/magellan";
import { getSymptomValue } from "../helpers/symptoms";


function modifySystemsInstant(api: ModelApiInterface, data: number[], event: Event) {
  helpers.addChangeRecord(api, "Состояние систем организма изменилось!", event.timestamp)

  const model = getTypedOrganismModel(api);

  for (const i of systemsIndices()) {
    if (data[i] != 0) {
      model.systems[i].value += data[i];
      model.systems[i].lastModified = event.timestamp;
    }
  }
}

interface DiseaseTickData {
  systemsModification: number[];
  // Only set for the last tick and only if initial change is single-colored
  mutationColor?: SystemColor;
}

function diseaseTick(api: ModelApiInterface, data: DiseaseTickData, event: Event) {
  modifySystemsInstant(api, data.systemsModification, event);
  const color = data.mutationColor;
  if (color) {
    const model = getTypedOrganismModel(api);
    const mutationData: MutationData = {
      newNucleotideValues: systemsIndices().map((i) => {
        if (!systemCorrespondsToColor(color, i)) return undefined;
        return model.systems[i].nucleotide + getSymptomValue(model.systems[i]);
      })
    };
    api.setTimer(uuid(), consts.MAGELLAN_TICK_MILLISECONDS, "mutation", mutationData);
  }
}

interface MutationData {
  newNucleotideValues: (number | undefined)[];
}

function mutation(api: ModelApiInterface, data: MutationData, event: Event) {
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
    if (i == totalTicks - 1)
      tickData.mutationColor = colorOfChange(totalChange);

    api.setTimer(uuid(), i * consts.MAGELLAN_TICK_MILLISECONDS, "disease-tick", tickData);
  }
}


interface OnTheShipModifier extends Modifier {
  shipId: number;
}

function enterShip(api: ModelApiInterface, data: number, event: Event) {
  leaveShip(api, {}, event);
  // TODO: move to config
  const eff: Effect = { enabled: true, id: 'on-the-ship', class: 'physiology', type: 'normal', handler: 'onTheShip' };
  const m: OnTheShipModifier = { mID: 'OnTheShip', enabled: true, effects: [eff], shipId: data }
  api.addModifier(m);
}

function leaveShip(api: ModelApiInterface, unused_data: any, event: Event) {
  api.removeModifier('OnTheShip')
}

function onTheShip(api: ModelApiInterface, modifier: OnTheShipModifier) {
  const c: Condition = {
    mID: uuid(), id: "on-the-ship", class: 'physiology',
    text: `Вы находитесь на корабле номер ${modifier.shipId}`
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
    leaveShip
  };
};