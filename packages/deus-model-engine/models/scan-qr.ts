import { Event, EventModelApi, PreprocessApiInterface } from '@alice/interface/models/alice-model-engine';
import { DeusExModel } from '../deus-ex-model';

export function scanQR(api: EventModelApi<DeusExModel>, data: any) {
  api.info(`scanQR: event handler. Data: ${JSON.stringify(data)}`);
  switch (data.type) {
    case 1:
      if (!api.model.isAlive) return;
      api.sendSelfEvent('usePill', { id: data.payload });
      break;
  }
}

function aquirePills(api: PreprocessApiInterface<any>, events: Event[]) {
  if (!api.model.isAlive) return;

  events.filter((event) => event.eventType == 'scanQR' && event.data.type == 1).forEach((event) => api.aquire('pills', event.data.payload));
}

export function _preprocess(api: PreprocessApiInterface<any>, events: Event[]) {
  return aquirePills(api, events);
}
