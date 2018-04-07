import * as uuid from 'uuid/v4';

export function makeVisibleNotificationPayload(title: string, body?: string): any {
  return {
    notification: {
      title: title,
      body: body ? body : ' ',
      sound: 'default',
    },
    aps: {
      sound: 'default',
    },
    priority: "high"
  };
}

export function makeSilentRefreshNotificationPayload(): any {
  return {
    apps: {
      'content-available': 1,
    },
    content_available: true,
    notId: uuid(),
    data: {
      'refresh': true,
      'content-available': 1,
    },
    priority: "high"
  };
}