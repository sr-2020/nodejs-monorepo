import { PubSub } from '@google-cloud/pubsub';

const kEnablePubSub: boolean = process.env.ENABLE_PUBSUB != 'false';
const kPubSubTopicPrefix: string = process.env.PUBSUB_TOPIC_PREFIX ?? '';

export interface PubSubService {
  publish(topic: string, message: any): Promise<string>;
}

export class PubSubServiceImpl implements PubSubService {
  static readonly pubsub = new PubSub();

  publish(topic: string, message: any): Promise<string> {
    return PubSubServiceImpl.pubsub.topic(kPubSubTopicPrefix + topic).publishJSON(message);
  }
}

export class NoOpPubSubServiceImpl implements PubSubService {
  publish(topic: string, message: any): Promise<string> {
    return Promise.resolve('');
  }
}

export function getPubSubService(): PubSubService {
  return kEnablePubSub ? new PubSubServiceImpl() : new NoOpPubSubServiceImpl();
}
