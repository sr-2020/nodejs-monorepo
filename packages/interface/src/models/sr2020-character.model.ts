import { model, property } from '@loopback/repository';
import { EmptyModel, ModelApiInterface, Event } from './alice-model-engine';

@model()
export class Sr2020Character extends EmptyModel {
  @property({ required: true })
  spellsCasted: number;
}

export type Sr2020CharacterApi = ModelApiInterface<Sr2020Character>;

@model()
export class Sr2020CharacterProcessRequest {
  @property({ required: true })
  baseModel: Sr2020Character;

  @property.array(Event, { required: true })
  events: Event[];

  @property({ required: true })
  timestamp: number;
}

@model()
export class Sr2020CharacterProcessResponse {
  @property({ required: true })
  baseModel: Sr2020Character;

  @property({ required: true })
  workModel: Sr2020Character;
}
