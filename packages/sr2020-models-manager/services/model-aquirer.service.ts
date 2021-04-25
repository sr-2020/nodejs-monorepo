import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { EntityManager } from 'typeorm';
import { Location } from '@alice/sr2020-common/models/location.model';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { AquiredModelsStorageTypeOrm } from '../utils/aquired-models-storage';
import type { ModelAquirerService } from '@alice/alice-models-manager/services/model-aquirer.service';
import { AquiredModelsStorage } from '@alice/alice-models-manager/utils/aquired-models-storage';
import type { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import type { ModelEngineService } from '@alice/alice-common/services/model-engine.service';
import { Inject } from '@nestjs/common';

export class ModelAquirerServiceImpl implements ModelAquirerService {
  constructor(
    @Inject('ModelEngineService') private _modelEngineService: ModelEngineService,
    @Inject('PubSubService') private _pubSubService: PubSubService,
  ) {}

  async aquireModels(manager: EntityManager, event: EventRequest, now: number): Promise<AquiredModelsStorage> {
    const result = new AquiredModelsStorageTypeOrm(manager, this._pubSubService, this._modelEngineService, now);
    if (event.data) {
      // Aquire location if event.data has location set.
      if (event.data.location) {
        const locationId = Number(event.data.location.id);
        await result.lockAndGetBaseModel(Location, locationId);
      }

      for (const key of ['pillId', 'locusId', 'qrCode', 'qrCodeId', 'droneId', 'bodyStorageId', 'focusId']) {
        if (event.data[key]) {
          await result.lockAndGetBaseModel(QrCode, Number(event.data[key]));
        }
      }

      // Aquire character if event.data has targetCharacterId set.
      if (event.data.targetCharacterId) {
        const characterId = Number(event.data.targetCharacterId);
        await result.lockAndGetBaseModel(Sr2020Character, characterId);
      }

      const orEmpty = (a: number[] | undefined) => a ?? [];

      // Aquire reagents if event.data has reagentIds set.
      for (const reagentId of orEmpty(event.data.reagentIds)) {
        await result.lockAndGetBaseModel(QrCode, reagentId);
      }

      // Aquire ritual participants and victimes if event.data has ritualMembersIds set.
      for (const id of [...orEmpty(event.data.ritualMembersIds), ...orEmpty(event.data.ritualVictimIds)]) {
        await result.lockAndGetBaseModel(Sr2020Character, Number(id));
      }
    }
    await result.synchronizeModels();
    return result;
  }
}
