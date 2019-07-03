import { Event, PreprocessApiInterface } from '@sr2020/interface/models/alice-model-engine';
import { DeusExModelApiInterface } from '@sr2020/interface/models/deus-ex-model';

function scanQR(api: DeusExModelApiInterface, data: any) {
  api.info(`scanQR: event handler. Data: ${JSON.stringify(data)}`);
  switch (data.type) {
    case 1:
      if (!api.model.isAlive) return;
      api.sendEvent(null, 'usePill', { id: data.payload });
      break;
  }
}

function aquirePills(api: PreprocessApiInterface<any>, events: Event[]) {
  if (!api.model.isAlive) return;

  events.filter((event) => event.eventType == 'scanQr' && event.data.type == 1).forEach((event) => api.aquire('pills', event.data.payload));
}

module.exports = {
  _preprocess: aquirePills,
  scanQR,
};
