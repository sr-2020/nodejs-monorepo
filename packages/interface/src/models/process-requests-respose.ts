import { model, property } from '@loopback/repository';
import { Event, EventForModelType, AquiredObjects, EmptyModel } from './alice-model-engine';

@model()
export class BaseModelProcessRequest {
  @property.array(Event, { required: true })
  events: Event[];

  @property({ required: true })
  timestamp: number;

  @property()
  aquiredObjects: AquiredObjects;
}

@model()
export class BaseModelProcessResponse {
  @property.array(EventForModelType, { required: true })
  outboundEvents: EventForModelType[];
}

export class ModelProcessRequest<TModel extends EmptyModel> extends BaseModelProcessRequest {
  baseModel: TModel;
}

export class ModelProcessResponse<TModel extends EmptyModel> extends BaseModelProcessResponse {
  baseModel: TModel;
  workModel: TModel;
}
