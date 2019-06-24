import { Model, model, property } from '@loopback/repository';

@model()
export class PushNotification extends Model {
  @property({ type: 'string', required: true })
  title: string;

  @property({ type: 'string', required: true })
  body: string;

  constructor(data?: Partial<PushNotification>) {
    super(data);
  }
}
