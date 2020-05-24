import { EventModelApi, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { BodyType } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { BodyStorageQrData, typedQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';

export function putBodyToStorage(api: EventModelApi<QrCode>, data: { characterId: string; bodyType: BodyType }) {
  const myData = typedQrData<BodyStorageQrData>(api.model);
  if (myData.body) {
    throw new UserVisibleError('Данная ячейка телохранилища уже занята!');
  }
  typedQrData<BodyStorageQrData>(api.model).body = {
    characterId: data.characterId,
    type: data.bodyType,
  };
}

export function removeBodyFromStorage(api: EventModelApi<QrCode>, data: {}) {
  typedQrData<BodyStorageQrData>(api.model).body = undefined;
}
