import { Event, ModelApiInterface, PreprocessApiInterface } from 'interface/src/models/alice-model-engine';
import { LabTerminalRefillData, QrType, ScanQRData, XenoDisease, OrganismModel } from '../helpers/basic-types';

function parseLabTerminalRefillData(payload: string): LabTerminalRefillData {
  const [uniqueId, numTests] = payload.split(',');
  return { uniqueId, numTests: Number(numTests) };
}

function scanQR(api: ModelApiInterface<OrganismModel>, data: ScanQRData) {
  api.info(`scanQR: event handler. Data: ${JSON.stringify(data)}`);
  switch (data.type) {
    case QrType.Pill:
      if (!api.model.isAlive) return;
      api.sendSelfEvent('usePill', { id: data.payload });
      break;

    case QrType.MagellanPill:
      api.sendSelfEvent('biological-systems-influence', data.payload.split(',').map(Number));
      break;

    case QrType.EnterShip:
      api.sendSelfEvent('enter-ship', Number(data.payload));
      break;

    case QrType.LeaveShip:
      api.sendSelfEvent('leave-ship', {});
      break;

    case QrType.LabTerminalRefill:
      api.sendSelfEvent('lab-terminal-refill', parseLabTerminalRefillData(data.payload));
      break;

    case QrType.SpaceSuitRefill:
      {
        const [uniqueId, time] = data.payload.split(',');
        api.sendSelfEvent('space-suit-refill', { uniqueId, time: Number(time) });
      }
      break;

    case QrType.SpaceSuitTakeOff:
      api.sendSelfEvent('space-suit-take-off', Number(data.payload));
      break;

    case QrType.Rollback:
      api.sendSelfEvent('full-rollback', {});
      break;

    case QrType.XenoDisease:
      {
        const values = data.payload.split(',').map(Number);
        const power = values.pop() as number;
        const diseaseData: XenoDisease = {
          influence: values,
          power,
        };
        api.sendSelfEvent('xeno-disease', diseaseData);
      }
      break;

    default:
      api.error('Unsupported QR code received', { data });
  }
}

function aquireDocuments(api: PreprocessApiInterface<OrganismModel>, events: Event[]) {
  events
    .filter(
      (event) => event.eventType == 'scanQr' && (event.data.type == QrType.LabTerminalRefill || event.data.type == QrType.SpaceSuitRefill),
    )
    .forEach((event) => api.aquire('counters', parseLabTerminalRefillData(event.data.payload).uniqueId));

  events
    .filter((event) => event.eventType == 'scanQr' && event.data.type == QrType.EnterShip)
    .forEach((event) => api.aquire('counters', `ship_${Number(event.data.payload)}`));
}

module.exports = {
  _preprocess: aquireDocuments,
  scanQR,
};
