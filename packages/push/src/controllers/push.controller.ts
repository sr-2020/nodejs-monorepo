import {repository} from '@loopback/repository';
import {put, requestBody, param, post} from '@loopback/rest';
import {FirebaseTokenRepository} from '../repositories';
import {
  Empty,
  FirebaseToken,
  PushResult,
  PushNotification,
} from '../../../interface/src/models';
import {FirebaseMessagingService} from '../services';
import {inject} from '@loopback/core';

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
        content: {'application/json': {schema: {'x-ts-type': Empty}}},
      },
    },
  })
  async saveToken(@requestBody() firebaseToken: FirebaseToken): Promise<Empty> {
    try {
      await this.firebaseTokenRepository.replaceById(
        firebaseToken.id,
        firebaseToken,
      );
    } catch {
      await this.firebaseTokenRepository.create(firebaseToken);
    }
    return new Empty();
  }

  @post('/send_notification/{id}', {
    responses: {
      '200': {
        description: 'Successfully send notification',
        content: {'application/json': {schema: {'x-ts-type': PushResult}}},
      },
    },
  })
  async test(
    @param.path.number('id') id: number,
    @requestBody() notification: PushNotification,
  ): Promise<PushResult> {
    if (!(await this.firebaseTokenRepository.exists(id))) {
      return new PushResult({success: 0, failure: 1});
    }
    const receiverToken = (await this.firebaseTokenRepository.findById(id))
      .token!!;
    return await this.firebaseService.send(
      receiverToken,
      notification.title,
      notification.body,
    );
  }
}
