import { PubSub } from '@google-cloud/pubsub';
import { Provider } from '@loopback/core';

export interface PubSubService {
  publish(topic: string, message: any): Promise<string>;
}

export class PubSubServiceImpl implements PubSubService {
  static readonly pubsub = new PubSub();

  publish(topic: string, message: any): Promise<string> {
    return PubSubServiceImpl.pubsub.topic(topic).publishJSON(message);
  }
}

export class PubSubServiceProvider implements Provider<PubSubService> {
  value(): PubSubService {
    return new PubSubServiceImpl();
  }
}
