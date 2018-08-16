import { Event, ModelApiInterface, PreprocessApiInterface } from 'deus-engine-manager-api';
import { LabTerminalRefillData, QrType, ScanQRData, XenoDisease } from '../helpers/basic-types';

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

    case QrType.Rollback:
      api.sendEvent(null, 'full-rollback', {});
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

function aquireDocuments(api: PreprocessApiInterface, events: Event[]) {
  events
    .filter((event) => event.eventType == 'scanQr' &&
      (event.data.type == QrType.LabTerminalRefill || event.data.type == QrType.SpaceSuitRefill))
    .forEach((event) => api.aquire('counters', parseLabTerminalRefillData(event.data.payload).uniqueId));

    events
    .filter((event) => event.eventType == 'scanQr' && event.data.type == QrType.EnterShip)
    .forEach((event) => api.aquire('counters', `ship_${Number(event.data.payload)}`));
  }

module.exports = {
  _preprocess: aquireDocuments,
  scanQR,
};
