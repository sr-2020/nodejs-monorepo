import { model, property } from '@loopback/repository';
import { EmptyModel, ModelApiInterface } from './alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from './process-requests-respose';

@model()
export class Sr2020Character extends EmptyModel {
  @property({ required: true })
  spellsCasted: number;
}

export type Sr2020CharacterApi = ModelApiInterface<Sr2020Character>;

@model()
export class Sr2020CharacterProcessRequest extends BaseModelProcessRequest {
  @property({ required: true })
  baseModel: Sr2020Character;
}

@model()
export class Sr2020CharacterProcessResponse extends BaseModelProcessResponse {
  @property({ required: true })
  baseModel: Sr2020Character;

  @property({ required: true })
  workModel: Sr2020Character;
}
