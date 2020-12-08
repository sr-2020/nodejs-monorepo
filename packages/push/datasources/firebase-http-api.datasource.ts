import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

const config = {
  name: 'FirebaseHttpApi',
  connector: 'rest',
  baseURL: 'https://fcm.googleapis.com/fcm/send',
  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'key=<...>',
    },
  },
  crud: false,
  operations: [
    {
      template: {
        method: 'POST',
        url: 'https://fcm.googleapis.com/fcm/send',
        body: {
          to: '{recipient}',
          notification: {
            body: '{body}',
            title: '{title}',
          },
        },
      },
      functions: {
        send: ['recipient', 'title', 'body'],
      },
    },
  ],
};

// See https://firebase.google.com/docs/cloud-messaging/http-server-ref
// for more examples of payloads that can be send via push notification.
export class FirebaseHttpApiDataSource extends juggler.DataSource {
  static dataSourceName = 'FirebaseHttpApi';

  constructor(
    @inject('datasources.config.FirebaseHttpApi', { optional: true })
    dsConfig = config,
  ) {
    dsConfig.options.headers.authorization = 'key=' + process.env.FIREBASE_SERVER_TOKEN;
    super(dsConfig);
  }
}
