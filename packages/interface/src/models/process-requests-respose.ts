import { model, property } from '@loopback/repository';
import { Event, EventForModelType } from './alice-model-engine';

@model()
export class BaseModelProcessRequest {
  @property.array(Event, { required: true })
  events: Event[];

  @property({ required: true })
  timestamp: number;
}

@model()
export class BaseModelProcessResponse {
  @property.array(EventForModelType, { required: true })
  outboundEvents: EventForModelType[];
}
