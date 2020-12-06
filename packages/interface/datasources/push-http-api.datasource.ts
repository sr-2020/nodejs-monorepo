import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

const baseURL: string = process.env.PUSH_URL ?? 'http://push';

const config = {
  name: 'PushHttpApi',
  connector: 'rest',
  baseURL,
  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  },
  crud: false,
  operations: [
    {
      template: {
        method: 'POST',
        url: `${baseURL}/send_notification/{recipient}`,
        body: '{notification}',
      },
      functions: {
        send: ['recipient', 'notification'],
      },
    },
  ],
};

export class PushHttpApiDataSource extends juggler.DataSource {
  static dataSourceName = 'PushHttpApi';

  constructor(
    @inject('datasources.config.PushHttpApi', { optional: true })
    dsConfig = config,
  ) {
    super(dsConfig);
  }
}
