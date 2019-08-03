import { Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { consume } from '../qr/events';

export function consumeQrs(api: Sr2020CharacterApi, data: { qrCodes: number[] }, _: Event) {
  for (const code of data.qrCodes) {
    api.sendOutboundEvent(QrCode, code.toString(), consume, {});
  }
}

export function scanQr(api: Sr2020CharacterApi, data: { qrCode: number; locationId?: string }, _: Event) {
  const qr: QrCode = api.aquired('QrCode', data.qrCode.toString());
  if (qr.type == 'empty') {
    api.sendNotification('Неожиданный QR', 'Этот QR-код - пустышка, его нельзя использовать');
    return;
  }

  if (!qr.eventType) {
    api.sendNotification('Неожиданный QR', 'Этот QR-код нельзя использовать напрямую');
    return;
  }

  api.sendSelfEvent(qr.eventType, { ...qr.data, locationId: data.locationId });
  api.sendOutboundEvent(QrCode, data.qrCode.toString(), consume, {});
}
