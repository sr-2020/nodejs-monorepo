import { EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { DroneQrData, SpiritQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { AddedActiveAbility } from '@alice/sr2020-common/models/sr2020-character.model';

export function startUsingDroneOrSpirit(api: EventModelApi<QrCode>, data: {}) {
  typedQrData<DroneQrData | SpiritQrData>(api.model).inUse = true;
}

export function stopUsingDroneOrSpirit(api: EventModelApi<QrCode>, data: { activeAbilities: AddedActiveAbility[]; broken?: boolean }) {
  typedQrData<DroneQrData | SpiritQrData>(api.model).activeAbilities = data.activeAbilities;
  typedQrData<DroneQrData | SpiritQrData>(api.model).inUse = false;
  if (data.broken) {
    typedQrData<DroneQrData>(api.model).broken = true;
  }
}

export function repairDrone(api: EventModelApi<QrCode>, data: {}) {
  typedQrData<DroneQrData>(api.model).broken = false;
}
