import { Event, UserVisibleError, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { consume } from '../qr/events';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

export function consumeQrs(api: EventModelApi<Sr2020Character>, data: { qrCodes: number[] }, _: Event) {
  for (const code of data.qrCodes) {
    api.sendOutboundEvent(QrCode, code.toString(), consume, {});
  }
}

export function scanQr(
  api: EventModelApi<Sr2020Character>,
  data: { qrCode: number; locationId?: string; targetCharacterId?: number },
  _: Event,
) {
  const qr: QrCode = api.aquired('QrCode', data.qrCode.toString());
  if (qr.type == 'empty') throw new UserVisibleError('Этот QR-код - пустышка, его нельзя использовать');
  if (!qr.eventType) throw new UserVisibleError('Этот QR-код нельзя использовать напрямую');

  if (data.targetCharacterId != undefined) {
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), qr.eventType, { ...qr.data, locationId: data.locationId });
  } else {
    api.sendSelfEvent(qr.eventType, { ...qr.data, locationId: data.locationId });
  }
  api.sendOutboundEvent(QrCode, data.qrCode.toString(), consume, {});
}
