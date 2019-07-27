import { Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';
import { reduceManaDensity } from '../location/events';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { consume } from '../qr/events';

export function increaseSpellsCasted(api: Sr2020CharacterApi, _data: {}, _event: Event) {
  api.model.spellsCasted++;
}

export function dummySpell(api: Sr2020CharacterApi, _data: void, _event: Event) {
  api.sendSelfEvent(increaseSpellsCasted, {});
  api.sendNotification('Скастован спелл', 'Ура! Вы скастовали спелл-заглушку');
}

export function densityDrainSpell(api: Sr2020CharacterApi, data: { locationId: string; amount: number }, _: Event) {
  api.model.spellsCasted++;
  api.sendOutboundEvent(Location, data.locationId, reduceManaDensity, { amount: data.amount });
}

export function densityHalveSpell(api: Sr2020CharacterApi, data: { locationId: string }, _: Event) {
  api.model.spellsCasted++;
  const location = api.aquired('Location', data.locationId) as Location;
  api.sendOutboundEvent(Location, data.locationId, reduceManaDensity, { amount: location.manaDensity / 2 });
}

export function consumeQrs(api: Sr2020CharacterApi, data: { qrCodes: number[] }, _: Event) {
  for (const code of data.qrCodes) {
    api.sendOutboundEvent(QrCode, code.toString(), consume, {});
  }
}

export function scanQr(api: Sr2020CharacterApi, data: { qrCode: number }, _: Event) {
  const qr: QrCode = api.aquired('QrCode', data.qrCode.toString());
  if (qr.type == 'empty') {
    api.sendNotification('Неожиданный QR', 'Этот QR-код - пустышка, его нельзя использовать');
    return;
  }

  if (!qr.eventType) {
    api.sendNotification('Неожиданный QR', 'Этот QR-код нельзя использовать напрямую');
    return;
  }

  api.sendSelfEvent(qr.eventType, qr.data);
  api.sendOutboundEvent(QrCode, data.qrCode.toString(), consume, {});
}
