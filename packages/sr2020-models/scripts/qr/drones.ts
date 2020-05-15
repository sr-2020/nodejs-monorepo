import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { DroneQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';
import { AddedActiveAbility } from '@sr2020/interface/models/sr2020-character.model';

export function startUsingDrone(api: EventModelApi<QrCode>, data: {}, _: Event) {
  typedQrData<DroneQrData>(api.model).inUse = true;
}

export function stopUsingDrone(api: EventModelApi<QrCode>, data: { activeAbilities: AddedActiveAbility[] }, _: Event) {
  typedQrData<DroneQrData>(api.model).activeAbilities = data.activeAbilities;
  typedQrData<DroneQrData>(api.model).inUse = false;
}
