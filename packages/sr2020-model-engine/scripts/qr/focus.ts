import { EffectModelApi, EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { MagicFocusData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { modifierFromEffect } from '@alice/sr2020-model-engine/scripts/character/util';
import { addTemporaryQrModifier } from '@alice/sr2020-model-engine/scripts/qr/events';
import { duration } from 'moment';

export function markAsUsed(api: EventModelApi<QrCode>, data: {}) {
  addTemporaryQrModifier(
    api,
    modifierFromEffect(markAsOnCooldown, {}),
    duration(typedQrData<MagicFocusData>(api.model).cooldownSeconds, 'seconds'),
  );
}

export function markAsOnCooldown(api: EffectModelApi<QrCode>, data: {}) {
  api.model.type = 'focus_on_cooldown';
}
