import { Event, ModelApiInterface, PreprocessApiInterface } from 'deus-engine-manager-api';
import { LabTerminalRefillData, XenoDisease } from '../helpers/basic-types';

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

  // Payload is 1,2,3,0,1,2,0,26 where first 7 numbers are systems influce,
  // and the last one is disease power
  XenoDisease = 9,

  LabTerminalRefill = 20, // payload is <unique id>,<how many tests to add>

  Passport = 100,
  Bill = 101,
}

interface ScanQRData {
  type: QrType;
  kind: number;
  validUntil: number;
  payload: string;
}

function parseLabTerminalRefillData(payload: string): LabTerminalRefillData {
  const [uniqueId, numTests] = payload.split(',');
  return { uniqueId, numTests: Number(numTests) };
}

function scanQR(api: ModelApiInterface, data: ScanQRData) {
  api.info(`scanQR: event handler. Data: ${JSON.stringify(data)}`);
  switch (data.type) {
    case QrType.Pill:
      if (!api.model.isAlive) return;
      api.sendEvent(null, 'usePill', { id: data.payload });
      break;

    case QrType.MagellanPill:
      api.sendEvent(null, 'biological-systems-influence', data.payload.split(',').map(Number));
      break;

    case QrType.EnterShip:
      api.sendEvent(null, 'enter-ship', Number(data.payload));
      break;

    case QrType.LeaveShip:
      api.sendEvent(null, 'leave-ship', {});
      break;

    case QrType.LabTerminalRefill:
      api.sendEvent(null, 'lab-terminal-refill', parseLabTerminalRefillData(data.payload));
      break;

    case QrType.SpaceSuitRefill:
      {
        const [uniqueId, time] = data.payload.split(',');
        api.sendEvent(null, 'space-suit-refill',
          { uniqueId, time: Number(time) });
      }
      break;

    case QrType.SpaceSuitTakeOff:
      api.sendEvent(null, 'space-suit-take-off', Number(data.payload));
      break;

    case QrType.XenoDisease:
      {
        const values = data.payload.split(',').map(Number);
        const power = values.pop() as number;
        const diseaseData: XenoDisease = {
          influence: values,
          power,
        };
        api.sendEvent(null, 'xeno-disease', diseaseData);
      }
      break;

    default:
      api.error('Unsupported QR code received', { data });
  }
}

function aquirePills(api: PreprocessApiInterface, events: Event[]) {
  events
    .filter((event) => event.eventType == 'scanQr' &&
      (event.data.type == QrType.LabTerminalRefill || event.data.type == QrType.SpaceSuitRefill))
    .forEach((event) => api.aquire('counters', parseLabTerminalRefillData(event.data.payload).uniqueId));
}

module.exports = {
  _preprocess: aquirePills,
  scanQR,
};
