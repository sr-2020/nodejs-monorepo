import { inject, Provider } from '@loopback/core';
import { AquiredObjects, EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService, processAny } from '@sr2020/interface/services';
import { EntityManager } from 'typeorm';
import { getAndLockModel } from '../utils/db-utils';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';

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
      baseModels: { Location: {}, Character: {}, QrCode: {} },
      workModels: { Location: {}, Character: {}, QrCode: {} },
      maximalTimestamp: now,
    };
    // Aquire location if event.data has locationId set.
    if (event.data && event.data.locationId) {
      const locationId: number = event.data.locationId;
      const baseModel = await getAndLockModel(Location, manager, locationId);
      result.baseModels['Location'][locationId] = baseModel;
      result.maximalTimestamp = Math.max(result.maximalTimestamp, baseModel.timestamp);
    }

    // Aquire QR codes if event.data has qrCodes set.
    if (event.data && event.data.qrCodes) {
      const codes: number[] = event.data.qrCodes;
      for (const code of codes) {
        const baseModel = await getAndLockModel(QrCode, manager, code);
        result.baseModels['QrCode'][code] = baseModel;
        result.maximalTimestamp = Math.max(result.maximalTimestamp, baseModel.timestamp);
      }
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
      let processingResult = await processAny(
        { Location: Location, Character: Sr2020Character, QrCode: QrCode }[modelType],
        this._modelEngineService,
        req,
      );
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
