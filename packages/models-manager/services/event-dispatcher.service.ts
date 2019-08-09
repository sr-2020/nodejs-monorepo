import { inject, Provider } from '@loopback/core';
import { Event, EventForModelType, EmptyModel } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { ModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';
import { ModelEngineService, processAny, PushService } from '@sr2020/interface/services';
import _ = require('lodash');
import { EntityManager } from 'typeorm';

import { getAndLockModel } from '../utils/db-utils';
import { AquiredModels } from './model-aquirer.service';

export interface EventDispatcherService {
  dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[], aquiredModels: AquiredModels): Promise<void>;

  dispatchEventForModelType(
    manager: EntityManager,
    event: EventForModelType,
    aquiredModels: AquiredModels,
  ): Promise<ModelProcessResponse<EmptyModel>>;

  dispatchEvent<TModel extends EmptyModel>(
    tmodel: new () => TModel,
    manager: EntityManager,
    event: Event,
    aquiredModels: AquiredModels,
  ): Promise<ModelProcessResponse<TModel>>;
}

export class EventDispatcherServiceImpl implements EventDispatcherService {
  constructor(
    private _modelEngineService: ModelEngineService,
    private _pushService: PushService,
    private _knownModelTypes: (new () => any)[],
  ) {}

  async dispatchEventsRecursively(manager: EntityManager, events: EventForModelType[], aquiredModels: AquiredModels): Promise<void> {
    while (events.length) {
      const promises = events.map((outboundEvent) => this.dispatchEventForModelType(manager, outboundEvent, aquiredModels));
      const outboundEventResults = await Promise.all<ModelProcessResponse<EmptyModel>>(promises);
      events = [];
      for (const r of outboundEventResults) {
        events.unshift(...r.outboundEvents);
      }
    }
  }

  async dispatchEventForModelType(manager: EntityManager, event: EventForModelType, aquiredModels: AquiredModels) {
    const modelType = this._knownModelTypes.find((t) => t.name == event.modelType);
    if (!modelType) {
      throw new Error('Unsupported modelType: ' + event.modelType);
    }

    const result = await this.dispatchEvent(modelType, manager, event, aquiredModels);
    return result;
  }

  async dispatchEvent<TModel extends EmptyModel>(
    tmodel: new () => TModel,
    manager: EntityManager,
    event: Event,
    aquiredModels: AquiredModels,
  ) {
    const baseModel: TModel =
      _.get(aquiredModels.baseModels, [tmodel.name, event.modelId]) || (await getAndLockModel(tmodel, manager, Number(event.modelId)));
    event.timestamp = Math.max(event.timestamp, baseModel.timestamp);
    const result = await processAny(tmodel, this._modelEngineService, {
      baseModel,
      events: [event],
      timestamp: event.timestamp,
      aquiredObjects: aquiredModels.workModels,
    });
    await manager.getRepository(tmodel).save(result.baseModel as any);
    if (tmodel.name.toLowerCase().includes('character')) {
      await Promise.all(result.notifications.map((notification) => this._pushService.send(Number(result.baseModel.modelId), notification)));
    }
    return result;
  }
}

export class EventDispatcherServiceProvider implements Provider<EventDispatcherService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
    @inject('services.PushService')
    private _pushService: PushService,
  ) {}

  value(): EventDispatcherService {
    return new EventDispatcherServiceImpl(this._modelEngineService, this._pushService, [Sr2020Character, Location, QrCode]);
  }
}
