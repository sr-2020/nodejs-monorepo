import { inject, Provider } from '@loopback/core';
import { Location } from '@sr2020/sr2020-common/models/location.model';
import { Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { ModelEngineService, processAny } from '@sr2020/sr2020-common/services/model-engine.service';
import { EmptyModel, Event, EventForModelType } from '@sr2020/interface/models/alice-model-engine';
import { AquiredModelsStorage } from '@sr2020/alice-models-manager/utils/aquired-models-storage';
import { ModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';

export interface EventDispatcherService {
  dispatchEventsRecursively(events: EventForModelType[], aquiredModels: AquiredModelsStorage): Promise<ModelProcessResponse<EmptyModel>[]>;
}

// TODO(cleanup) It doesn't actually have any sr2020 specific besides ModelEngineService (which "knows" which specific
// model types are present). As such it should be moved to alice-models-manager package after figuring out how to deal
// with ModelEngineService.
export class EventDispatcherServiceImpl implements EventDispatcherService {
  constructor(private _modelEngineService: ModelEngineService, private _knownModelTypes: (new () => any)[]) {}

  async dispatchEventsRecursively(
    events: EventForModelType[],
    aquiredModels: AquiredModelsStorage,
  ): Promise<ModelProcessResponse<EmptyModel>[]> {
    const result: ModelProcessResponse<EmptyModel>[] = [];
    let nextEvents: EventForModelType[] = [];
    while (events.length) {
      for (const outboundEvent of events) {
        const r = await this.dispatchEventForModelType(outboundEvent, aquiredModels);
        result.push(r);
        nextEvents.unshift(...r.outboundEvents);
      }
      events = nextEvents;
      nextEvents = [];
    }
    return result;
  }

  async dispatchEventForModelType(
    event: EventForModelType,
    aquiredModels: AquiredModelsStorage,
  ): Promise<ModelProcessResponse<EmptyModel>> {
    const modelType = this._knownModelTypes.find((t) => t.name == event.modelType);
    if (!modelType) {
      throw new Error('Unsupported modelType: ' + event.modelType);
    }

    delete event.modelType;
    const result = await this.dispatchEvent(modelType, event, aquiredModels);
    return result;
  }

  async dispatchEvent<TModel extends EmptyModel>(
    tmodel: new () => TModel,
    event: Event,
    aquiredModels: AquiredModelsStorage,
  ): Promise<ModelProcessResponse<TModel>> {
    const baseModel: TModel = await aquiredModels.lockAndGetBaseModel(tmodel, Number(event.modelId));
    event.timestamp = Math.max(event.timestamp, baseModel.timestamp);
    const result = await processAny(tmodel, this._modelEngineService, {
      baseModel,
      events: [event],
      timestamp: event.timestamp,
      aquiredObjects: aquiredModels.getWorkModels(),
    });
    await aquiredModels.setModel(tmodel, result.baseModel, result.workModel);
    return result;
  }
}

export class EventDispatcherServiceProvider implements Provider<EventDispatcherService> {
  constructor(
    @inject('services.ModelEngineService')
    private _modelEngineService: ModelEngineService,
  ) {}

  value(): EventDispatcherService {
    return new EventDispatcherServiceImpl(this._modelEngineService, [Sr2020Character, Location, QrCode]);
  }
}
