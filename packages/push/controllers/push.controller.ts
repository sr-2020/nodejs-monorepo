import { param, post, put, requestBody } from '@loopback/rest';
import { PushNotification } from '@alice/alice-common/models/push-notification.model';
import { PushResult } from '@alice/alice-common/models/push-result.model';
import { Empty } from '@alice/alice-common/models/empty.model';
import { FirebaseToken } from '@alice/alice-common/models/firebase-token.model';
import { FirebaseMessagingService } from '@alice/push/services/firebase-messaging.service';
import { inject } from '@loopback/core';
import { getRepository } from 'typeorm';

export class PushController {
  constructor(
    @inject('services.FirebaseMessagingService')
    protected firebaseService: FirebaseMessagingService,
  ) {}

  @put('/save_token', {
    responses: {
      '200': {
        description: 'Token was successfully saved',
        content: { 'application/json': { schema: { 'x-ts-type': Empty } } },
      },
    },
  })
  async saveToken(@requestBody() firebaseToken: FirebaseToken): Promise<Empty> {
    await getRepository(FirebaseToken).save(firebaseToken);
    return new Empty();
  }

  @post('/send_notification/{id}', {
    responses: {
      '200': {
        description: 'Successfully send notification',
        content: { 'application/json': { schema: { 'x-ts-type': PushResult } } },
      },
    },
  })
  async sendNotification(@param.path.number('id') id: number, @requestBody() notification: PushNotification): Promise<PushResult> {
    const receiverToken = await getRepository(FirebaseToken).findOne(id);

    if (!receiverToken) {
      return new PushResult({ success: 0, failure: 1 });
    }
    const sendResult = await this.firebaseService.send(receiverToken.token, notification.title, notification.body);
    return new PushResult({ ...sendResult, token_used: receiverToken.token });
  }
}
