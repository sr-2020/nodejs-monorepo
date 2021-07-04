import { EventModelApi, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { BodyType, MetaRace } from '@alice/sr2020-common/models/sr2020-character.model';
import { BodyStorageQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

export function putBodyToStorage(
  api: EventModelApi<QrCode>,
  data: { characterId: string; bodyType: BodyType; name: string; metarace: MetaRace },
) {
  const myData = typedQrData<BodyStorageQrData>(api.model);
  if (myData.body) {
    throw new UserVisibleError('Данная ячейка телохранилища уже занята!');
  }
  typedQrData<BodyStorageQrData>(api.model).body = {
    characterId: data.characterId,
    type: data.bodyType,
    name: data.name,
    metarace: data.metarace,
  };
}

export function removeBodyFromStorage(api: EventModelApi<QrCode>, data: {}) {
  typedQrData<BodyStorageQrData>(api.model).body = undefined;
}
