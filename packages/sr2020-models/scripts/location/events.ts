import { Event } from '@sr2020/interface/models/alice-model-engine';
import { LocationApi } from '@sr2020/interface/models/location.model';
import * as uuid from 'uuid';

function reduceManaDensity(api: LocationApi, data: { amount: number }, _: Event) {
  api.model.manaDensity -= data.amount;
  if (api.model.manaDensity < 0) {
    api.model.manaDensity = 0;
  }
}

function scheduleEvent(api: LocationApi, data: { event: Event; delayInSeconds: number }, _: Event) {
  api.setTimer(uuid.v4(), 1000 * data.delayInSeconds, data.event.eventType, data.event.data);
}

module.exports = () => {
  return {
    reduceManaDensity,
    scheduleEvent,
  };
};
