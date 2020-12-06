import { EventRequest } from '@alice/interface/models/alice-model-engine';
import { EntityManager } from 'typeorm';
import { AquiredModelsStorage } from '../utils/aquired-models-storage';

export interface ModelAquirerService {
  aquireModels(manager: EntityManager, event: EventRequest, now: number): Promise<AquiredModelsStorage>;
}
