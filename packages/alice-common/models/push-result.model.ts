import { Model, model } from '@loopback/repository';
import { NumberProperty, StringProperty } from '@alice/alice-common/models/alice-model-engine';

@model()
export class PushResult extends Model {
  @StringProperty({ optional: true })
  token_used?: string;

  @NumberProperty()
  success: number;

  @NumberProperty()
  failure: number;

  constructor(data?: Partial<PushResult>) {
    super(data);
  }
}
