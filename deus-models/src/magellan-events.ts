import { ModelApiInterface, Modifier, Effect, Condition, Event } from "deus-engine-manager-api";
import consts = require('../helpers/constants');
import uuid = require('uuid/v1');
import helpers = require('../helpers/model-helper');

function modifySystemsInstant(api: ModelApiInterface, data: number[], event: Event) {
  helpers.addChangeRecord(api, "Состояние систем организма изменилось!", event.timestamp)
  for (let i = 0; i < consts.medicSystems.length; ++i)
    api.model.systems[i] += data[i];
}

function useMagellanPill(api: ModelApiInterface, data: number[], event: Event) {
  const totalTicks = Math.max(...data.map(v => Math.abs(v)));
  for (let i = 0; i < totalTicks; ++i) {
    const adjustment = data.map(v => {
      if (Math.abs(v) <= i) return 0;
      return Math.sign(v);
    });
    api.setTimer(uuid(), i * consts.MAGELLAN_TICK_MILLISECONDS, "modify-systems-instant", adjustment);
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
  api.model.location = `ship_${modifier.shipId}`;
}

module.exports = () => {
  return {
    modifySystemsInstant,
    useMagellanPill,
    onTheShip,
    enterShip,
    leaveShip
  };
};