import { Event, UserVisibleError, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { consume } from '../qr/events';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

export function scanQr(
  api: EventModelApi<Sr2020Character>,
  data: { qrCode: string; location?: { id: string; manaLevel: string }; targetCharacterId?: string },
  _: Event,
) {
  const qr = api.aquired(QrCode, data.qrCode);
  if (qr.type == 'empty') throw new UserVisibleError('Этот QR-код - пустышка, его нельзя использовать');
  if (!qr.eventType) throw new UserVisibleError('Этот QR-код нельзя использовать напрямую');

  if (data.targetCharacterId != undefined) {
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, qr.eventType, { ...qr.data, location: data.location });
  } else {
    api.sendSelfEvent(qr.eventType, { ...qr.data, location: data.location });
  }
  api.sendOutboundEvent(QrCode, data.qrCode, consume, {});
}
