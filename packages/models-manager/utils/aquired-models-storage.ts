import { EmptyModel, AquiredObjects } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { ModelEngineService, processAny } from '@sr2020/interface/services';
import { EntityManager } from 'typeorm';
import { HttpErrors } from '@loopback/rest';
import { getAndLockModel } from './db-utils';
import { PubSubService } from '../services/pubsub.service';
import { cloneDeep } from 'lodash';

export interface AquiredModelsStorage {
  // Returns the maximal timestamp of all models currently present in storage.
  // Cheap to call, caches the value.
  readonly maximalTimestamp: number;

  // Locks the model for the update using locking mechanism of underlying DB and returns it.
  // If model is already locked - will just return it.
  lockAndGetBaseModel<TModelEntity extends EmptyModel>(tmodel: new () => TModelEntity, id: number): Promise<TModelEntity>;

  // Updates the model in storage and prepares the write to the DB.
  setModel<TModelEntity extends EmptyModel>(
    tmodel: new () => TModelEntity,
    baseModel: TModelEntity,
    workModel: TModelEntity,
  ): Promise<void>;

  // Creates a consistent "snapshot" of base and work models:
  // Chooses earliest possible point of time (i.e. one in the "future" of every model in storage),
  // and calculates the base/work value for each model at this time point.
  // NB: Until this is called, getWorkModels() will return empty dict.
  synchronizeModels(modelEngineService: ModelEngineService): Promise<void>;

  // Actually writes models to the DB and sends change notifications if needed.
  flush(): Promise<void>;

  // Compatiblity methods, needed to pass this data to model engine.
  getBaseModels(): AquiredObjects;
  getWorkModels(): AquiredObjects;
}

export class AquiredModelsStorageTypeOrm implements AquiredModelsStorage {
  private _baseModels = { Location: {}, Character: {}, QrCode: {} };
  private _workModels = { Location: {}, Character: {}, QrCode: {} };

  constructor(private _manager: EntityManager, private _pubSubService: PubSubService, public maximalTimestamp: number) {}

  private getDbName<TModelEntity extends EmptyModel>(tmodel: new () => TModelEntity): 'Character' | 'Location' | 'QrCode' {
    if (tmodel.name == 'Sr2020Character') return 'Character';
    if (tmodel.name == 'Location') return 'Location';
    if (tmodel.name == 'QrCode') return 'QrCode';
    throw new HttpErrors.InternalServerError(`Unexpected entity type: ${tmodel.name}`);
  }

  async lockAndGetBaseModel<TModelEntity extends EmptyModel>(tmodel: new () => TModelEntity, id: number): Promise<TModelEntity> {
    if (this._baseModels[this.getDbName(tmodel)][id] != undefined) {
      return this._baseModels[this.getDbName(tmodel)][id];
    }
    const baseModel = await getAndLockModel(tmodel, this._manager, id);
    this.maximalTimestamp = Math.max(this.maximalTimestamp, baseModel.timestamp);
    this._baseModels[this.getDbName(tmodel)][id] = baseModel;
    return baseModel;
  }

  async setModel<TModelEntity extends EmptyModel>(
    tmodel: new () => TModelEntity,
    baseModel: TModelEntity,
    workModel: TModelEntity,
  ): Promise<void> {
    this.maximalTimestamp = Math.max(this.maximalTimestamp, baseModel.timestamp);
    this._baseModels[this.getDbName(tmodel)][Number(baseModel.modelId)] = baseModel;
    this._workModels[this.getDbName(tmodel)][Number(workModel.modelId)] = workModel;
  }

  async synchronizeModels(modelEngineService: ModelEngineService): Promise<void> {
    const updateModel = async (modelType: string, modelId: string) => {
      const req = {
        baseModel: this._baseModels[modelType][modelId],
        events: [],
        timestamp: this.maximalTimestamp,
        aquiredObjects: {},
      };
      const processingResult = await processAny(
        { Location: Location, Character: Sr2020Character, QrCode: QrCode }[modelType],
        modelEngineService,
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
    for (const m in this._baseModels['Character']) {
      {
        const character: Sr2020Character = this._baseModels['Character'][m];
        dbWritePromises.push(this._manager.getRepository(Sr2020Character).save(character));
      }
      {
        const characterWork: Sr2020Character = cloneDeep(this._workModels['Character'][m]);
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
