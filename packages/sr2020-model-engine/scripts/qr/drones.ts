import { EventModelApi } from '@alice/interface/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { DroneQrData, SpiritQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { AddedActiveAbility } from '@alice/sr2020-common/models/sr2020-character.model';

export function startUsingDroneOrSpirit(api: EventModelApi<QrCode>, data: {}) {
  typedQrData<DroneQrData | SpiritQrData>(api.model).inUse = true;
}

export function stopUsingDroneOrSpirit(api: EventModelApi<QrCode>, data: { activeAbilities: AddedActiveAbility[] }) {
  typedQrData<DroneQrData | SpiritQrData>(api.model).activeAbilities = data.activeAbilities;
  typedQrData<DroneQrData | SpiritQrData>(api.model).inUse = false;
}
