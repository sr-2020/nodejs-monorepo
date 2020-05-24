import { AquiredObjects, EmptyModel } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { Location } from '@sr2020/sr2020-common/models/location.model';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { ModelEngineService, processAny } from '@sr2020/sr2020-common/services/model-engine.service';
import { EntityManager } from 'typeorm';
import { cloneDeep } from 'lodash';
import { AquiredModelsStorage } from '@sr2020/alice-models-manager/utils/aquired-models-storage';
import { getAndLockModel } from '@sr2020/alice-models-manager/utils/db-utils';
import { PubSubService } from '@sr2020/alice-models-manager/services/pubsub.service';

export class AquiredModelsStorageTypeOrm implements AquiredModelsStorage {
  private _baseModels = { Location: {}, Sr2020Character: {}, QrCode: {} };
  private _workModels = { Location: {}, Sr2020Character: {}, QrCode: {} };

  constructor(
    private _manager: EntityManager,
    private _pubSubService: PubSubService,
    private _modelEngineService: ModelEngineService,
    public maximalTimestamp: number,
  ) {}

  async lockAndGetBaseModel<TModelEntity extends EmptyModel>(tmodel: new () => TModelEntity, id: number): Promise<TModelEntity> {
    if (this._baseModels[tmodel.name][id] != undefined) {
      return this._baseModels[tmodel.name][id];
    }
    const baseModel = await getAndLockModel(tmodel, this._manager, id);
    this.maximalTimestamp = Math.max(this.maximalTimestamp, baseModel.timestamp);
    this._baseModels[tmodel.name][id] = baseModel;
    return baseModel;
  }

  async setModel<TModelEntity extends EmptyModel>(
    tmodel: new () => TModelEntity,
    baseModel: TModelEntity,
    workModel: TModelEntity,
  ): Promise<void> {
    this.maximalTimestamp = Math.max(this.maximalTimestamp, baseModel.timestamp);
    this._baseModels[tmodel.name][Number(baseModel.modelId)] = baseModel;
    this._workModels[tmodel.name][Number(workModel.modelId)] = workModel;
  }

  async synchronizeModels(): Promise<void> {
    const updateModel = async (modelType: string, modelId: string) => {
      const req = {
        baseModel: this._baseModels[modelType][modelId],
        events: [],
        timestamp: this.maximalTimestamp,
        aquiredObjects: {},
      };
      const processingResult = await processAny(
        { Location: Location, Sr2020Character: Sr2020Character, QrCode: QrCode }[modelType],
        this._modelEngineService,
        req,
      );
      this._baseModels[modelType][modelId] = processingResult.baseModel;
      this._workModels[modelType][modelId] = processingResult.workModel;
    };

    const promises: Promise<void>[] = [];
    for (const modelType in this._baseModels) {
      for (const modelId in this._baseModels[modelType]) {
        promises.push(updateModel(modelType, modelId));
      }
    }

    await Promise.all(promises);
  }

  async flush(): Promise<void> {
    const dbWritePromises: Promise<any>[] = [];
    for (const m in this._baseModels['Location']) {
      {
        const location: Location = this._baseModels['Location'][m];
        dbWritePromises.push(this._manager.getRepository(Location).save(location));
      }
      {
        const locationWork: Location = cloneDeep(this._workModels['Location'][m]);
        delete locationWork.timers;
        locationWork.modifiers = [];
        dbWritePromises.push(this._pubSubService.publish('location_update', locationWork));
      }
    }
    for (const m in this._baseModels['Sr2020Character']) {
      {
        const character: Sr2020Character = this._baseModels['Sr2020Character'][m];
        dbWritePromises.push(this._manager.getRepository(Sr2020Character).save(character));
      }
      {
        const characterWork: Sr2020Character = cloneDeep(this._workModels['Sr2020Character'][m]);
        characterWork.history = [];
        delete characterWork.timers;
        characterWork.modifiers = [];
        dbWritePromises.push(this._pubSubService.publish('character_update', characterWork));
      }
    }
    for (const m in this._baseModels['QrCode']) {
      {
        const qr: QrCode = this._baseModels['QrCode'][m];
        dbWritePromises.push(this._manager.getRepository(QrCode).save(qr));
      }
      {
        const qrWork: QrCode = cloneDeep(this._workModels['QrCode'][m]);
        delete qrWork.timers;
        qrWork.modifiers = [];
        dbWritePromises.push(this._pubSubService.publish('qr_update', qrWork));
      }
    }
    await Promise.all(dbWritePromises);
  }

  getBaseModels(): AquiredObjects {
    return this._baseModels;
  }

  getWorkModels(): AquiredObjects {
    return this._workModels;
  }
}
