import { inject, Provider } from '@loopback/core';
import { AquiredObjects, EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService } from '@sr2020/interface/services';
import { EntityManager } from 'typeorm';
import { LocationDbEntity } from '../models/location-db-entity';
import { getAndLockModel } from '../utils/db-utils';

export interface AquiredModels {
  baseModels: AquiredObjects;
  workModels: AquiredObjects;
  maximalTimestamp: number;
}

export interface ModelAquirerService {
  aquireModels(manager: EntityManager, event: EventRequest, now: number): Promise<AquiredModels>;
}

class ModelAquirerServiceImpl implements ModelAquirerService {
  constructor(private _modelEngineService: ModelEngineService) {}

  async aquireModels(manager: EntityManager, event: EventRequest, now: number): Promise<AquiredModels> {
    const result: AquiredModels = {
      baseModels: { Location: {}, Character: {} },
      workModels: { Location: {}, Character: {} },
      maximalTimestamp: now,
    };
    // Aquire location if event.data has locationId set.
    if (event.data && event.data.locationId) {
      const locationId: number = event.data.locationId;
      const baseModel = (await getAndLockModel(LocationDbEntity, manager, locationId)).getModel();
      result.baseModels['Location'][locationId] = baseModel;
      result.maximalTimestamp = Math.max(result.maximalTimestamp, baseModel.timestamp);
    }
    // TODO(aeremin): Add support for other cases requiring acquiring.

    await this._actualizeModels(result);
    return result;
  }

  private async _actualizeModels(aquiredModels: AquiredModels) {
    const updateModel = async (modelType: string, modelId: string) => {
      const req = {
        baseModel: aquiredModels.baseModels[modelType][modelId],
        events: [],
        timestamp: aquiredModels.maximalTimestamp,
        aquiredObjects: {},
      };
      let processingResult: any = null;
      if (modelType == 'Location') processingResult = await this._modelEngineService.processLocation(req);
      else if (modelType == 'Character') processingResult = await this._modelEngineService.processCharacter(req);
      else throw new Error('Invalid modelType: ' + modelType);

      aquiredModels.baseModels[modelType][modelId] = processingResult.baseModel;
      aquiredModels.workModels[modelType][modelId] = processingResult.workModel;
    };

    const promises: Promise<void>[] = [];
    for (const modelType in aquiredModels.baseModels) {
      for (const modelId in aquiredModels.baseModels[modelType]) {
        promises.push(updateModel(modelType, modelId));
      }
    }

    await Promise.all(promises);
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
