import { EmptyModel, AquiredObjects } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { ModelEngineService, processAny } from '@sr2020/interface/services';
import { EntityManager } from 'typeorm';
import { HttpErrors } from '@loopback/rest';
import { getAndLockModel } from './db-utils';

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

  // Compatiblity methods, needed to pass this data to model engine.
  getBaseModels(): AquiredObjects;
  getWorkModels(): AquiredObjects;
}

export class AquiredModelsStorageTypeOrm implements AquiredModelsStorage {
  private _baseModels = { Location: {}, Character: {}, QrCode: {} };
  private _workModels = { Location: {}, Character: {}, QrCode: {} };

  constructor(private _manager: EntityManager, public maximalTimestamp: number) {}

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
    await this._manager.getRepository(tmodel).save(baseModel as any);
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

  getBaseModels(): AquiredObjects {
    return this._baseModels;
  }

  getWorkModels(): AquiredObjects {
    return this._workModels;
  }
}
