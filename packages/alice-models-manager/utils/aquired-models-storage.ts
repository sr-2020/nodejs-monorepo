import { AquiredObjects, EmptyModel } from '@sr2020/interface/models/alice-model-engine';
import { ModelEngineService } from '@sr2020/interface/services/model-engine.service';

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
