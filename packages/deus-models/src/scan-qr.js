function scanQR(api, data) {
    api.info(`scanQR: event handler. Data: ${JSON.stringify(data)}`)
    switch (data.type) {
    case 1:
        if (!api.model.isAlive) return;
        api.sendEvent(null, 'usePill', { id: data.payload });
        break;
    }
}

function aquirePills(api, events) {
    if (!api.model.isAlive) return;

    events
        .filter((event) => event.eventType == 'scanQr' && event.data.type == 1)
        .forEach((event) => api.aquire('pills', event.data.payload));
}

module.exports = {
    _preprocess: aquirePills,
    scanQR
};
