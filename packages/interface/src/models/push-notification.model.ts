import { model, property } from '@loopback/repository';

@model()
export class PushNotification {
  @property({ type: 'string', required: true })
  title: string;

  @property({ type: 'string', required: true })
  body: string;
}
