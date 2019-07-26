import { inject, Provider } from '@loopback/core';
import { Event, EventForModelType, EmptyModel } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { ModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';
import { ModelEngineService, processAny } from '@sr2020/interface/services';
import _ = require('lodash');
import { CharacterDbEntity } from 'models-manager/models/character-db-entity';
import { LocationDbEntity } from 'models-manager/models/location-db-entity';
import { EntityManager } from 'typeorm';

import { getAndLockModel } from '../utils/db-utils';
import { AquiredModels } from './model-aquirer.service';

export interface EventDispatcherService {
  dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[], aquiredModels: AquiredModels): Promise<void>;

  dispatchEventForModelType(
    manager: EntityManager,
    event: EventForModelType,
    aquiredModels: AquiredModels,
  ): Promise<ModelProcessResponse<Sr2020Character> | ModelProcessResponse<Location>>;

  dispatchCharacterEvent(
    manager: EntityManager,
    event: Event,
    aquiredModels: AquiredModels,
  ): Promise<ModelProcessResponse<Sr2020Character>>;
  dispatchLocationEvent(manager: EntityManager, event: Event, aquiredModels: AquiredModels): Promise<ModelProcessResponse<Location>>;
}

interface TEntityInterface {
  getModel(): any;
  fromModel(m: any): any;
}

export class EventDispatcherServiceImpl implements EventDispatcherService {
  constructor(private _modelEngineService: ModelEngineService) {}

  async dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[], aquiredModels: AquiredModels): Promise<void> {
    while (events.length) {
      const promises = events.map((outboundEvent) => this.dispatchEventForModelType(manager, outboundEvent, aquiredModels));
      const outboundEventResults = await Promise.all<ModelProcessResponse<Sr2020Character> | ModelProcessResponse<Location>>(promises);
      events = [];
      for (const r of outboundEventResults) {
        events.unshift(...r.outboundEvents);
      }
    }
  }

  dispatchEventForModelType(manager: EntityManager, event: EventForModelType, aquiredModels: AquiredModels) {
    if (event.modelType == 'Sr2020Character') {
      return this.dispatchCharacterEvent(manager, event, aquiredModels);
    }
    if (event.modelType == 'Location') {
      return this.dispatchLocationEvent(manager, event, aquiredModels);
    }
    throw new Error('Unsupported modelType: ' + event.modelType);
  }

  async dispatchCharacterEvent(manager: EntityManager, event: Event, aquiredModels: AquiredModels) {
    return this._dispatchEvent(Sr2020Character, CharacterDbEntity, manager, event, aquiredModels);
  }

  async dispatchLocationEvent(manager: EntityManager, event: Event, aquiredModels: AquiredModels) {
    return this._dispatchEvent(Location, LocationDbEntity, manager, event, aquiredModels);
  }

  async _dispatchEvent<TModel extends EmptyModel, TEntity extends TEntityInterface>(
    tmodel: new () => TModel,
    tentity: new () => TEntity,
    manager: EntityManager,
    event: Event,
    aquiredModels: AquiredModels,
  ) {
    const baseModel: TModel =
      _.get(aquiredModels.baseModels, [tmodel.name, event.modelId]) ||
      (await getAndLockModel(tentity, manager, Number(event.modelId))).getModel();
    const result = await processAny(tmodel, this._modelEngineService, {
      baseModel,
      events: [event],
      timestamp: Math.max(event.timestamp, baseModel.timestamp),
      aquiredObjects: aquiredModels.workModels,
    });
    await manager.getRepository(tentity).save(new tentity().fromModel(result.baseModel));
    return result;
  }
}

export class EventDispatcherServiceProvider implements Provider<EventDispatcherService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
  ) {}

  value(): EventDispatcherService {
    return new EventDispatcherServiceImpl(this._modelEngineService);
  }
}
