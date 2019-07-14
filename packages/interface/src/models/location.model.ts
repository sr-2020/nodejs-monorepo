import { model, property } from '@loopback/repository';
import { EmptyModel, ModelApiInterface, Event } from './alice-model-engine';

@model()
export class Location extends EmptyModel {
  @property({ required: true })
  manaDensity: number;
}

export type LocationApi = ModelApiInterface<Location>;

@model()
export class LocationProcessRequest {
  @property({ required: true })
  baseModel: Location;

  @property.array(Event, { required: true })
  events: Event[];

  @property({ required: true })
  timestamp: number;
}

@model()
export class LocationProcessResponse {
  @property({ required: true })
  baseModel: Location;

  @property({ required: true })
  workModel: Location;
}
