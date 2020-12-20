import { NumberProperty, StringProperty } from '@alice/alice-common/models/alice-model-engine';

export class PushResult {
  @StringProperty({ optional: true })
  token_used?: string;

  @NumberProperty()
  success: number;

  @NumberProperty()
  failure: number;
}
