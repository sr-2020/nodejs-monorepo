import { Event, EventModelApi, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { BodyType } from '@sr2020/interface/models/sr2020-character.model';
import { BodyStorageQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';

export function putBodyToStorage(api: EventModelApi<QrCode>, data: { characterId: string; bodyType: BodyType }, _: Event) {
  const myData = typedQrData<BodyStorageQrData>(api.model);
  if (myData.body) {
    throw new UserVisibleError('Данная ячейка телохранилища уже занята!');
  }
  typedQrData<BodyStorageQrData>(api.model).body = {
    characterId: data.characterId,
    type: data.bodyType,
  };
}

export function removeBodyFromStorage(api: EventModelApi<QrCode>, data: {}, _: Event) {
  typedQrData<BodyStorageQrData>(api.model).body = undefined;
}
