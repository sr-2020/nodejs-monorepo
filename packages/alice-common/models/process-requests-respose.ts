import { model } from '@loopback/repository';
import { AquiredObjects, ArrayProperty, EmptyModel, Event, EventForModelType, NumberProperty, ObjectProperty } from './alice-model-engine';
import { PubSubNotification, PushNotification } from './push-notification.model';

@model()
export class BaseModelProcessRequest {
  @ArrayProperty(Event)
  events: Event[];

  @NumberProperty()
  timestamp: number;

  @ObjectProperty(Object)
  aquiredObjects: AquiredObjects;
}

@model()
export class BaseModelProcessResponse {
  @ArrayProperty(EventForModelType)
  outboundEvents: EventForModelType[];

  @ArrayProperty(PushNotification)
  notifications: PushNotification[];

  @ArrayProperty(PubSubNotification)
  pubSubNotifications: PubSubNotification[];

  // TODO: Can we improve typings or do something else to make it less hacky?
  @ObjectProperty(Object, { optional: true })
  tableResponse?: any;
}

export class ModelProcessRequest<TModel extends EmptyModel> extends BaseModelProcessRequest {
  baseModel: TModel;
}

export class ModelProcessResponse<TModel extends EmptyModel> extends BaseModelProcessResponse {
  baseModel: TModel;
  workModel: TModel;
}
