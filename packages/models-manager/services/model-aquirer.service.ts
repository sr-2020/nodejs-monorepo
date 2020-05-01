import { inject, Provider } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService } from '@sr2020/interface/services';
import { EntityManager } from 'typeorm';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { AquiredModelsStorageTypeOrm, AquiredModelsStorage } from '../utils/aquired-models-storage';
import { PubSubService } from './pubsub.service';

export interface ModelAquirerService {
  aquireModels(manager: EntityManager, event: EventRequest, now: number): Promise<AquiredModelsStorage>;
}

class ModelAquirerServiceImpl implements ModelAquirerService {
  constructor(private _modelEngineService: ModelEngineService, private _pubSubService: PubSubService) {}

  async aquireModels(manager: EntityManager, event: EventRequest, now: number): Promise<AquiredModelsStorage> {
    const result = new AquiredModelsStorageTypeOrm(manager, this._pubSubService, now);
    // Aquire location if event.data has location set.
    if (event.data && event.data.location) {
      const locationId: number = event.data.location.id;
      await result.lockAndGetBaseModel(Location, locationId);
    }

    // Aquire character if event.data has targetCharacterId set.
    if (event.data && event.data.targetCharacterId) {
      const characterId: number = event.data.targetCharacterId;
      await result.lockAndGetBaseModel(Sr2020Character, characterId);
    }

    // Aquire pill if event.data has pillId set.
    if (event.data && event.data.pillId) {
      const pillId: number = event.data.pillId;
      await result.lockAndGetBaseModel(QrCode, pillId);
    }

    // Aquire reagents if event.data has reagentIds set.
    if (event.data && event.data.reagentIds) {
      for (const reagentId of event.data.reagentIds) {
        await result.lockAndGetBaseModel(QrCode, reagentId);
      }
    }

    // Aquire QR codes if event.data has qrCodes set.
    if (event.data && (event.data.qrCodes != undefined || event.data.qrCode != undefined)) {
      const codes: number[] = event.data.qrCodes || [];
      if (event.data.qrCode != undefined) codes.push(event.data.qrCode);
      for (const code of codes) {
        await result.lockAndGetBaseModel(QrCode, code);
      }
    }

    // Aquire ritual participants if event.data has ritualMembersIds set.
    if (event.data?.ritualMembersIds) {
      for (const id of event.data?.ritualMembersIds) {
        await result.lockAndGetBaseModel(Sr2020Character, Number(id));
      }
    }

    await result.synchronizeModels(this._modelEngineService);
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
