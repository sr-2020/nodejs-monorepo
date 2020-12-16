import { model } from '@loopback/repository';
import { ObjectProperty, StringProperty } from './alice-model-engine';

@model()
export class PushNotification {
  @StringProperty()
  title: string;

  @StringProperty()
  body: string;
}

@model()
export class PubSubNotification {
  @StringProperty()
  topic: string;

  @ObjectProperty(Object)
  body: any;
}
