import { inject, Provider } from '@loopback/core';
import { AquiredObjects, EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService } from '@sr2020/interface/services';
import { EntityManager } from 'typeorm';
import { LocationDbEntity } from '../models/location-db-entity';
import { getAndLockModel } from '../utils/db-utils';

export interface AquiredModels {
  baseModels: AquiredObjects;
  workModels: AquiredObjects;
}

export interface ModelAquirerService {
  aquireModels(manager: EntityManager, event: EventRequest, timestamp: number): Promise<AquiredModels>;
}

class ModelAquirerServiceImpl implements ModelAquirerService {
  constructor(private _modelEngineService: ModelEngineService) {}

  async aquireModels(manager: EntityManager, event: EventRequest, timestamp: number): Promise<AquiredModels> {
    const result: AquiredModels = { baseModels: { Location: {}, Character: {} }, workModels: { Location: {}, Character: {} } };
    if (event.data && event.data.locationId) {
      const locationId: number = event.data.locationId;
      const baseModel = await getAndLockModel(LocationDbEntity, manager, locationId);
      const processingResult = await this._modelEngineService.processLocation({
        baseModel: baseModel!!.getModel(),
        events: [],
        timestamp,
        aquiredObjects: {},
      });
      result.baseModels['Location'][locationId] = processingResult.baseModel;
      result.workModels['Location'][locationId] = processingResult.workModel;
    }
    return result;
  }
}

export class ModelAquirerServiceProvider implements Provider<ModelAquirerService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
  ) {}

  value(): ModelAquirerService {
    return new ModelAquirerServiceImpl(this._modelEngineService);
  }
}
