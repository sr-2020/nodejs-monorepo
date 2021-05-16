import { EffectModelApi, EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { MagicFocusData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { modifierFromEffect } from '@alice/sr2020-model-engine/scripts/character/util';
import { addTemporaryQrModifier } from '@alice/sr2020-model-engine/scripts/qr/events';
import { duration } from 'moment';

export function markAsUsed(api: EventModelApi<QrCode>, data: {}) {
  const d = duration(typedQrData<MagicFocusData>(api.model).cooldownSeconds, 'seconds');
  addTemporaryQrModifier(api, modifierFromEffect(markAsOnCooldown, { cooldownUntil: api.model.timestamp + d.asMilliseconds() }), d);
}

export function markAsOnCooldown(api: EffectModelApi<QrCode>, data: { cooldownUntil: number }) {
  api.model.type = 'focus_on_cooldown';
  api.model.description = `${api.model.description}\nНа кулдауне еще ${Math.ceil(
    (data.cooldownUntil - api.model.timestamp) / 1000,
  )} секунд.`;
}
