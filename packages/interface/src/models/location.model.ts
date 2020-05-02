import { model, property } from '@loopback/repository';
import { EmptyModel, rproperty, JsonColumn } from './alice-model-engine';
import { BaseModelProcessResponse, BaseModelProcessRequest } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

@model()
export class SpellTrace {
  @rproperty() timestamp: number;
  @rproperty() spellName: string;
  @rproperty() casterAura: string;
  @rproperty() metarace: string;
  @rproperty() power: number;
  @rproperty() magicFeedback: number;
}

@model()
@Entity({
  name: 'location',
})
export class Location extends EmptyModel {
  @rproperty()
  @Column()
  manaDensity: number;

  @property.array(SpellTrace, { required: true })
  @JsonColumn()
  spellTraces: SpellTrace[];

  @property()
  @Column({ default: 'aaaaabbbbbcccccddddd' })
  aura: string;
}

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
