import { EventModelApi, UserVisibleError } from '@alice/interface/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { consume } from '../qr/events';
import { LocationData, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { ChemoData } from '@alice/sr2020-model-engine/scripts/character/chemo';
import Chance = require('chance');

const chance = new Chance();

export function shouldBeConsumed(qrCode: QrCode, character: Sr2020Character) {
  if (qrCode.type != 'pill') return true;
  const data = typedQrData<ChemoData>(qrCode);
  const supportedPills = [
    'iodomarin',
    'iodomarin-p',
    'apollo',
    'apollo-p',
    'military-combo',
    'military-supercombo',
    'preper',
    'preper-p',
    'yurgen',
    'yurgen-p',
  ];

  if (!supportedPills.some((id) => id == data.id)) return true;
  if (!character.passiveAbilities.some((ability) => ability.id == 'good-pills')) return true;

  return chance.natural({ min: 1, max: 100 }) > 30;
}

export function scanQr(api: EventModelApi<Sr2020Character>, data: { qrCode: string; location?: LocationData; targetCharacterId?: string }) {
  const qr = api.aquired(QrCode, data.qrCode);
  if (qr.type == 'empty') throw new UserVisibleError('Этот QR-код - пустышка, его нельзя использовать');
  if (!qr.eventType) throw new UserVisibleError('Этот QR-код нельзя использовать напрямую');

  if (data.targetCharacterId != undefined) {
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, qr.eventType, { ...qr.data, location: data.location });
  } else {
    api.sendSelfEvent(qr.eventType, { ...qr.data, location: data.location });
  }

  if (shouldBeConsumed(qr, api.workModel)) {
    api.sendOutboundEvent(QrCode, data.qrCode, consume, {});
  }
}
