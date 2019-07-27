import { model, property } from '@loopback/repository';
import { EmptyModel, ModelApiInterface } from './alice-model-engine';
import { BaseModelProcessResponse, BaseModelProcessRequest } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

@model()
@Entity({
  name: 'location',
})
export class Location extends EmptyModel {
  @property({ required: true })
  @Column()
  manaDensity: number;
}

export type LocationApi = ModelApiInterface<Location>;

@model()
export class LocationProcessRequest extends BaseModelProcessRequest {
  @property({ required: true })
  baseModel: Location;
}

@model()
export class LocationProcessResponse extends BaseModelProcessResponse {
  @property({ required: true })
  baseModel: Location;

  @property({ required: true })
  workModel: Location;
}
