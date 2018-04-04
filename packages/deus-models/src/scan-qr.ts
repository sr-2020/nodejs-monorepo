import { Event, ModelApiInterface, PreprocessApiInterface } from 'deus-engine-manager-api';

function scanQR(api: ModelApiInterface, data: any) {
    api.info(`scanQR: event handler. Data: ${JSON.stringify(data)}`)
    switch (data.type) {
    case 1:
        if (!api.model.isAlive) return;
        api.sendEvent(null, 'usePill', { id: data.payload });
        break;
    }
}

function aquirePills(api: PreprocessApiInterface, events: Event[]) {
    if (!api.model.isAlive) return;

    events
        .filter((event) => event.eventType == 'scanQr' && event.data.type == 1)
        .forEach((event) => api.aquire('pills', event.data.payload));
}

module.exports = {
    _preprocess: aquirePills,
    scanQR
};
