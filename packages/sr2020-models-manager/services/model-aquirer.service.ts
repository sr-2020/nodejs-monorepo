import { inject, Provider } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService } from '@sr2020/sr2020-common/services/model-engine.service';
import { EntityManager } from 'typeorm';
import { Location } from '@sr2020/sr2020-common/models/location.model';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { AquiredModelsStorageTypeOrm } from '../utils/aquired-models-storage';
import { ModelAquirerService } from '@sr2020/alice-models-manager/services/model-aquirer.service';
import { AquiredModelsStorage } from '@sr2020/alice-models-manager/utils/aquired-models-storage';
import { PubSubService } from '@sr2020/alice-models-manager/services/pubsub.service';

class ModelAquirerServiceImpl implements ModelAquirerService {
  constructor(private _modelEngineService: ModelEngineService, private _pubSubService: PubSubService) {}

  async aquireModels(manager: EntityManager, event: EventRequest, now: number): Promise<AquiredModelsStorage> {
    const result = new AquiredModelsStorageTypeOrm(manager, this._pubSubService, this._modelEngineService, now);
    if (event.data) {
      // Aquire location if event.data has location set.
      if (event.data.location) {
        const locationId = Number(event.data.location.id);
        await result.lockAndGetBaseModel(Location, locationId);
      }

      for (const key of ['pillId', 'locusId', 'qrCode', 'droneId', 'bodyStorageId']) {
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

export class ModelAquirerServiceProvider implements Provider<ModelAquirerService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
    @inject('services.PubSubService')
    private _pubSubService: PubSubService,
  ) {}

  value(): ModelAquirerService {
    return new ModelAquirerServiceImpl(this._modelEngineService, this._pubSubService);
  }
}
