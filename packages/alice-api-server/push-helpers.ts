import * as rp from 'request-promise';
import { HttpError } from 'routing-controllers';
import { Container } from 'typedi';
import * as uuid from 'uuid/v4';
import { StatusAndBody } from './connection';
import { DatabasesContainerToken } from './services/db-container';
import { LoggerToken } from './services/logger';
import { ApplicationSettingsToken } from './services/settings';
import { IsNotFoundError } from './utils';

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
    priority: 'high',
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
    priority: 'high',
  };
}

export async function sendGenericPushNotification(id: string, payload: any): Promise<StatusAndBody> {
  try {
    const pushToken = (await Container.get(DatabasesContainerToken).accountsDb().get(id)).pushToken;
    if (!pushToken)
      return { status: 404, body: 'No push token for this character' };

    payload.to = pushToken;

    const fcmResponse = await rp.post('https://fcm.googleapis.com/fcm/send', {
      resolveWithFullResponse: true, simple: false,
      headers: { Authorization: 'key=' +  Container.get(ApplicationSettingsToken).pushSettings.serverKey },
      json: payload,
    });
    return { status: fcmResponse.statusCode, body: fcmResponse.body };
  } catch (e) {
    if (IsNotFoundError(e))
      return { status: 404, body: 'Character with such id or login is not found' };
    Container.get(LoggerToken).error(
      `Error while sending push notification via FCM: ${e}`, {characterId: id, source: 'api'});
    throw e;
  }
}

export async function sendGenericPushNotificationThrowOnError(id: string, payload: any): Promise<string> {
  const statusAndBody = await sendGenericPushNotification(id, payload);
  if (statusAndBody.status != 200)
    throw new HttpError(statusAndBody.status, statusAndBody.body);
  return statusAndBody.body;
}
