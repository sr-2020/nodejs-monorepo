import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { DroneQrData, typedQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';
import { AddedActiveAbility } from '@sr2020/sr2020-common/models/sr2020-character.model';

export function startUsingDrone(api: EventModelApi<QrCode>, data: {}) {
  typedQrData<DroneQrData>(api.model).inUse = true;
}

export function stopUsingDrone(api: EventModelApi<QrCode>, data: { activeAbilities: AddedActiveAbility[] }) {
  typedQrData<DroneQrData>(api.model).activeAbilities = data.activeAbilities;
  typedQrData<DroneQrData>(api.model).inUse = false;
}
