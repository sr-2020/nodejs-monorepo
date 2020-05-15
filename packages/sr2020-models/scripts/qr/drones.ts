import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { DroneQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';

export function setDroneInUse(api: EventModelApi<QrCode>, data: { inUse: boolean }, _: Event) {
  typedQrData<DroneQrData>(api.model).inUse = data.inUse;
}
