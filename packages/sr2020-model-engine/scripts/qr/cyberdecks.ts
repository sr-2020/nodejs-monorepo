import { EffectModelApi, EventModelApi, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { CyberDeckQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { modifierFromEffect } from '@alice/sr2020-model-engine/scripts/character/util';

const kCyberdeckIsBrokenModifier = 'суberdeck-is-broken';

export function breakCyberDeck(api: EventModelApi<QrCode>, data: {}) {
  if (api.model.type != 'cyberdeck') throw new UserVisibleError('Это не QR кибердеки!');
  api.addModifier({ ...modifierFromEffect(cyberdeckIsBroken, {}), mID: kCyberdeckIsBrokenModifier});
}

export function repairCyberdeck(api: EventModelApi<QrCode>, data: {}) {
  api.removeModifier(kCyberdeckIsBrokenModifier);
} 
export function cyberdeckIsBroken(api: EffectModelApi<QrCode>, data: {}) {
  typedQrData<CyberDeckQrData>(api.model).broken = true;
  api.model.name = api.model.name + ' (сломана)';
}
