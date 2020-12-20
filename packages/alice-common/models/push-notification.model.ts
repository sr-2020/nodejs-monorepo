import { ObjectProperty, StringProperty } from './alice-model-engine';

export class PushNotification {
  @StringProperty()
  title: string;

  @StringProperty()
  body: string;
}

export class PubSubNotification {
  @StringProperty()
  topic: string;

  @ObjectProperty(Object)
  body: any;
}
