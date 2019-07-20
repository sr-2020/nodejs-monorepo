import { inject, Provider } from '@loopback/core';
import { EventForModelType, EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { LocationProcessResponse } from '@sr2020/interface/models/location.model';
import { Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { CharacterDbEntity, fromModel as fromCharacterModel } from 'models-manager/models/character-db-entity';
import { fromModel as fromLocationModel, LocationDbEntity } from 'models-manager/models/location-db-entity';
import { EntityManager } from 'typeorm';

import { getAndLockModel } from '../utils/db-utils';
import { TimeService } from './time.service';

export interface EventDispatcherService {
  dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[]): Promise<void>;

  dispatchEvent(
    manager: EntityManager,
    modelId: number,
    modelType: string,
    event: EventRequest,
  ): Promise<Sr2020CharacterProcessResponse | LocationProcessResponse>;

  dispatchCharacterEvent(manager: EntityManager, modelId: number, event: EventRequest): Promise<Sr2020CharacterProcessResponse>;
  dispatchLocationEvent(manager: EntityManager, modelId: number, event: EventRequest): Promise<LocationProcessResponse>;
}

export class EventDispatcherServiceImpl implements EventDispatcherService {
  constructor(private _timeService: TimeService, private _modelEngineService: ModelEngineService) {}

  async dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[]): Promise<void> {
    while (events.length) {
      const promises = events.map((outboundEvent) =>
        this.dispatchEvent(manager, Number(outboundEvent.modelId), outboundEvent.modelType, outboundEvent),
      );
      const outboundEventResults = await Promise.all<Sr2020CharacterProcessResponse | LocationProcessResponse>(promises);
      events = [];
      for (const r of outboundEventResults) {
        events.unshift(...r.outboundEvents);
      }
    }
  }

  dispatchEvent(manager: EntityManager, modelId: number, modelType: string, event: EventRequest) {
    if (modelType == 'Sr2020Character') {
      return this.dispatchCharacterEvent(manager, Number(modelId), event);
    }
    if (modelType == 'Location') {
      return this.dispatchLocationEvent(manager, Number(modelId), event);
    }
    throw new Error('Unsupported modelType: ' + modelType);
  }

  async dispatchCharacterEvent(manager: EntityManager, modelId: number, event: EventRequest) {
    const baseModel = await getAndLockModel(CharacterDbEntity, manager, modelId);
    const timestamp = this._timeService.timestamp();
    const result = await this._modelEngineService.processCharacter({
      baseModel: baseModel!!.getModel(),
      events: [{ ...event, modelId: modelId.toString(), timestamp }],
      timestamp,
    });
    await manager.getRepository(CharacterDbEntity).save(fromCharacterModel(result.baseModel));
    return result;
  }

  async dispatchLocationEvent(manager: EntityManager, modelId: number, event: EventRequest) {
    const baseModel = await getAndLockModel(LocationDbEntity, manager, modelId);
    const timestamp = this._timeService.timestamp();
    const result = await this._modelEngineService.processLocation({
      baseModel: baseModel!!.getModel(),
      events: [{ ...event, modelId: modelId.toString(), timestamp }],
      timestamp,
    });
    await manager.getRepository(LocationDbEntity).save(fromLocationModel(result.baseModel));
    return result;
  }
}

export class EventDispatcherServiceProvider implements Provider<EventDispatcherService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
    @inject('services.TimeService')
    private _timeService: TimeService,
  ) {}

  value(): EventDispatcherService {
    return new EventDispatcherServiceImpl(this._timeService, this._modelEngineService);
  }
}
