import { EmptyModel, Event, EventForModelType } from '@alice/alice-common/models/alice-model-engine';
import { AquiredModelsStorage } from '@alice/alice-models-manager/utils/aquired-models-storage';
import { ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { ModelEngineService } from '@alice/alice-common/services/model-engine.service';

export interface EventDispatcherService {
  dispatchEventsRecursively(events: EventForModelType[], aquiredModels: AquiredModelsStorage): Promise<ModelProcessResponse<EmptyModel>[]>;
}

export class GenericEventDispatcherService implements EventDispatcherService {
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
    const result = await this._modelEngineService.process(tmodel, {
      baseModel,
      events: [event],
      timestamp: event.timestamp,
      aquiredObjects: aquiredModels.getWorkModels(),
    });
    await aquiredModels.setModel(tmodel, result.baseModel, result.workModel);
    return result;
  }
}
