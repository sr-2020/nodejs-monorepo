import { model, property } from '@loopback/repository';
import { EmptyModel, JsonColumn, rproperty } from '@sr2020/interface/models/alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';
import { Column, Entity } from 'typeorm';

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

@model()
export class LocationCreationRequest {}
