import { Event, ModelApiInterface, PreprocessApiInterface } from 'deus-engine-manager-api';

// TODO: Merge with deus-qr-lib
enum QrType {
  Unknown = 0,

  Pill = 1,
  Implant = 2,
  InstantEffect = 3,

  MagellanPill = 4,  // payload should be of [1,2,3,4,5,6] kind
  EnterShip = 5,     // payload should contain ship id (number)
  LeaveShip = 6,

  SpaceSuitRefill = 7, // payload is <unique id>,<time in minutes>
  SpaceSuitTakeOff = 8, // payload is life support system disinfection power

  LabTerminalRefill = 20, // payload is <unique id>,<how many tests to add>

  Passport = 100,
  Bill = 101
}

interface ScanQRData {
  type: QrType,
  kind: number,
  validUntil: number,
  payload: string,
}

function scanQR(api: ModelApiInterface, data: ScanQRData) {
  api.info(`scanQR: event handler. Data: ${JSON.stringify(data)}`)
  switch (data.type) {
    case QrType.Pill:
      if (!api.model.isAlive) return;
      api.sendEvent(null, 'usePill', { id: data.payload });
      break;

    case QrType.MagellanPill:
      api.sendEvent(null, 'use-magellan-pill', data.payload.split(',').map(Number));
      break;

    case QrType.EnterShip:
      api.sendEvent(null, 'enter-ship', Number(data.payload));
      break;

    case QrType.LeaveShip:
      api.sendEvent(null, 'leave-ship', {});
      break;

    case QrType.LabTerminalRefill:
      {
        let [uniqueId, numTests] = data.payload.split(',');
        api.sendEvent(null, 'lab-terminal-refill',
          { uniqueId, numTests: Number(numTests) });
      }
      break;

    case QrType.SpaceSuitRefill:
      {
        let [uniqueId, time] = data.payload.split(',');
        api.sendEvent(null, 'space-suit-refill',
          { uniqueId, time: Number(time) });
      }
      break;

    case QrType.SpaceSuitTakeOff:
      {
        let [uniqueId, disinfectionPower] = data.payload.split(',');
        api.sendEvent(null, 'space-suit-take-off',
          { uniqueId, disinfectionPower: Number(disinfectionPower) });
      }
      break;

    default:
      api.error("Unsupported QR code received", { data });
  }
}

function aquirePills(api: PreprocessApiInterface, events: Event[]) {
  if (!api.model.isAlive) return;

  events
    .filter((event) => event.eventType == 'scanQr' && event.data.type == QrType.Pill)
    .forEach((event) => api.aquire('pills', event.data.payload));
}

module.exports = {
  _preprocess: aquirePills,
  scanQR
};
