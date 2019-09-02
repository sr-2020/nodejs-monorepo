import { model, property } from '@loopback/repository';
import { Event, EventForModelType, AquiredObjects, EmptyModel, rproperty } from './alice-model-engine';
import { PushNotification } from './push-notification.model';

@model()
export class BaseModelProcessRequest {
  @property.array(Event, { required: true })
  events: Event[];

  @rproperty()
  timestamp: number;

  @property()
  aquiredObjects: AquiredObjects;
}

@model()
export class BaseModelProcessResponse {
  @property.array(EventForModelType, { required: true })
  outboundEvents: EventForModelType[];

  @property.array(PushNotification, { required: true })
  notifications: PushNotification[];

  // TODO: Can we improve typings or do something else to make it less hacky?
  @property()
  tableResponse?: any;
}

export class ModelProcessRequest<TModel extends EmptyModel> extends BaseModelProcessRequest {
  baseModel: TModel;
}

export class ModelProcessResponse<TModel extends EmptyModel> extends BaseModelProcessResponse {
  baseModel: TModel;
  workModel: TModel;
}
