import { model } from '@loopback/repository';
import {
  ArrayProperty,
  EmptyModel,
  JsonColumn,
  NumberProperty,
  ObjectProperty,
  StringProperty,
} from '@alice/alice-common/models/alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { Column, Entity } from 'typeorm';

@model()
export class SpellTrace {
  @NumberProperty() timestamp: number;
  @StringProperty() spellName: string;
  @StringProperty() casterAura: string;
  @StringProperty() metarace: string;
  @NumberProperty() power: number;
  @NumberProperty() magicFeedback: number;
}

@model()
@Entity({
  name: 'location',
})
export class Location extends EmptyModel {
  @ArrayProperty(SpellTrace)
  @JsonColumn()
  spellTraces: SpellTrace[];

  @StringProperty()
  @Column({ default: 'aaaaabbbbbcccccddddd' })
  aura: string;
}

@model()
export class LocationProcessRequest extends BaseModelProcessRequest {
  @ObjectProperty(Location)
  baseModel: Location;
}

@model()
export class LocationProcessResponse extends BaseModelProcessResponse {
  @ObjectProperty(Location)
  baseModel: Location;

  @ObjectProperty(Location)
  workModel: Location;
}

@model()
export class LocationCreationRequest {}
