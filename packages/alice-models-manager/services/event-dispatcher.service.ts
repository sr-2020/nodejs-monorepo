import { EmptyModel, Event, EventForModelType } from '@sr2020/interface/models/alice-model-engine';
import { ModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';
import { ModelEngineService, processAny } from '@sr2020/interface/services/model-engine.service';
import { AquiredModelsStorage } from '../utils/aquired-models-storage';

export interface EventDispatcherService {
  dispatchEventsRecursively(events: EventForModelType[], aquiredModels: AquiredModelsStorage): Promise<ModelProcessResponse<EmptyModel>[]>;
}

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
