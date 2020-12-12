import { model, property } from '@loopback/repository';
import { rproperty } from './alice-model-engine';

@model()
export class PushNotification {
  @property({ type: 'string', required: true })
  title: string;

  @property({ type: 'string', required: true })
  body: string;
}

@model()
export class PubSubNotification {
  @rproperty()
  topic: string;

  @rproperty()
  body: any;
}
