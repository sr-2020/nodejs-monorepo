import { repository } from '@loopback/repository';
import { param, post, put, requestBody } from '@loopback/rest';
import { FirebaseTokenRepository } from '../repositories/firebase-token.repository';
import { PushNotification } from '@alice/interface/models/push-notification.model';
import { PushResult } from '@alice/interface/models/push-result.model';
import { Empty } from '@alice/interface/models/empty.model';
import { FirebaseToken } from '@alice/interface/models/firebase-token.model';
import { FirebaseMessagingService } from '../services/firebase-messaging.service';
import { inject } from '@loopback/core';

export class PushController {
  constructor(
    @repository(FirebaseTokenRepository)
    public firebaseTokenRepository: FirebaseTokenRepository,
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
    try {
      await this.firebaseTokenRepository.replaceById(firebaseToken.id, firebaseToken);
    } catch {
      await this.firebaseTokenRepository.create(firebaseToken);
    }
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
    if (!(await this.firebaseTokenRepository.exists(id))) {
      return new PushResult({ success: 0, failure: 1 });
    }
    const receiverToken = (await this.firebaseTokenRepository.findById(id)).token!;
    const sendResult = await this.firebaseService.send(receiverToken, notification.title, notification.body);
    return new PushResult({ ...sendResult, token_used: receiverToken });
  }
}
