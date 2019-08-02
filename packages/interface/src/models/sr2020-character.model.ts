import { model } from '@loopback/repository';
import { EmptyModel, ModelApiInterface, rproperty } from './alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

@model()
@Entity({
  name: 'sr2020-character',
})
export class Sr2020Character extends EmptyModel {
  @rproperty()
  @Column()
  spellsCasted: number;
}

export type Sr2020CharacterApi = ModelApiInterface<Sr2020Character>;

@model()
export class Sr2020CharacterProcessRequest extends BaseModelProcessRequest {
  @rproperty()
  baseModel: Sr2020Character;
}

@model()
export class Sr2020CharacterProcessResponse extends BaseModelProcessResponse {
  @rproperty()
  baseModel: Sr2020Character;

  @rproperty()
  workModel: Sr2020Character;
}
