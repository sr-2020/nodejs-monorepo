import { inject, Provider } from '@loopback/core';
import { Location } from '@alice/sr2020-common/models/location.model';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { ModelEngineService, processAny } from '@alice/sr2020-common/services/model-engine.service';
import { EmptyModel, Event, EventForModelType } from '@alice/alice-common/models/alice-model-engine';
import { AquiredModelsStorage } from '@alice/alice-models-manager/utils/aquired-models-storage';
import { ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';

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
    const { modelType, ...eventWithoutModelType } = event;
    const modelTypeCtor = this._knownModelTypes.find((t) => t.name == modelType);
    if (!modelTypeCtor) {
      throw new Error('Unsupported modelType: ' + event.modelType);
    }

    const result = await this.dispatchEvent(modelTypeCtor, eventWithoutModelType, aquiredModels);
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
