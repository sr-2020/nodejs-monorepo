import { model } from '@loopback/repository';
import { EmptyModel, ModelApiInterface, rproperty } from './alice-model-engine';
import { BaseModelProcessResponse, BaseModelProcessRequest } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

@model()
@Entity({
  name: 'location',
})
export class Location extends EmptyModel {
  @rproperty()
  @Column()
  manaDensity: number;
}

export type LocationApi = ModelApiInterface<Location>;

@model()
export class LocationProcessRequest extends BaseModelProcessRequest {
  @rproperty()
  baseModel: Location;
}

@model()
export class LocationProcessResponse extends BaseModelProcessResponse {
  @rproperty()
  baseModel: Location;

  @rproperty()
  workModel: Location;
}
