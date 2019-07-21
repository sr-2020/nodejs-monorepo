import { inject, Provider } from '@loopback/core';
import { EventForModelType, Event } from '@sr2020/interface/models/alice-model-engine';
import { LocationProcessResponse } from '@sr2020/interface/models/location.model';
import { Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { CharacterDbEntity, fromModel as fromCharacterModel } from 'models-manager/models/character-db-entity';
import { fromModel as fromLocationModel, LocationDbEntity } from 'models-manager/models/location-db-entity';
import { EntityManager } from 'typeorm';

import { getAndLockModel } from '../utils/db-utils';

export interface EventDispatcherService {
  dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[]): Promise<void>;

  dispatchEvent(manager: EntityManager, event: EventForModelType): Promise<Sr2020CharacterProcessResponse | LocationProcessResponse>;

  dispatchCharacterEvent(manager: EntityManager, event: Event): Promise<Sr2020CharacterProcessResponse>;
  dispatchLocationEvent(manager: EntityManager, event: Event): Promise<LocationProcessResponse>;
}

export class EventDispatcherServiceImpl implements EventDispatcherService {
  constructor(private _modelEngineService: ModelEngineService) {}

  async dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[]): Promise<void> {
    while (events.length) {
      const promises = events.map((outboundEvent) => this.dispatchEvent(manager, outboundEvent));
      const outboundEventResults = await Promise.all<Sr2020CharacterProcessResponse | LocationProcessResponse>(promises);
      events = [];
      for (const r of outboundEventResults) {
        events.unshift(...r.outboundEvents);
      }
    }
  }

  dispatchEvent(manager: EntityManager, event: EventForModelType) {
    if (event.modelType == 'Sr2020Character') {
      return this.dispatchCharacterEvent(manager, event);
    }
    if (event.modelType == 'Location') {
      return this.dispatchLocationEvent(manager, event);
    }
    throw new Error('Unsupported modelType: ' + event.modelType);
  }

  async dispatchCharacterEvent(manager: EntityManager, event: Event) {
    const baseModel = await getAndLockModel(CharacterDbEntity, manager, Number(event.modelId));
    const result = await this._modelEngineService.processCharacter({
      baseModel: baseModel!!.getModel(),
      events: [event],
      timestamp: event.timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(CharacterDbEntity).save(fromCharacterModel(result.baseModel));
    return result;
  }

  async dispatchLocationEvent(manager: EntityManager, event: Event) {
    const baseModel = await getAndLockModel(LocationDbEntity, manager, Number(event.modelId));
    const result = await this._modelEngineService.processLocation({
      baseModel: baseModel!!.getModel(),
      events: [event],
      timestamp: event.timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(LocationDbEntity).save(fromLocationModel(result.baseModel));
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
