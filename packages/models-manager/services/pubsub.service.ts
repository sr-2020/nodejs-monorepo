import { PubSub } from '@google-cloud/pubsub';
import { Provider } from '@loopback/core';

export interface PubSubService {
  publish(topic: string, message: any): Promise<string>;
}

export class PubSubServiceImpl implements PubSubService {
  readonly pubsub = new PubSub();

  publish(topic: string, message: any): Promise<string> {
    return this.pubsub.topic(`projects/imposing-elixir-249711/topics/${topic}`).publish(Buffer.from(JSON.stringify(message)));
  }
}

export class PubSubServiceProvider implements Provider<PubSubService> {
  value(): PubSubService {
    return new PubSubServiceImpl();
  }
}
