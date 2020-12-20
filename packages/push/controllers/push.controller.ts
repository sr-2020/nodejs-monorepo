import { PushNotification } from '@alice/alice-common/models/push-notification.model';
import { PushResult } from '@alice/alice-common/models/push-result.model';
import { Empty } from '@alice/alice-common/models/empty.model';
import { FirebaseToken } from '@alice/alice-common/models/firebase-token.model';
import { FirebaseMessagingService } from '@alice/push/services/firebase-messaging.service';
import { getRepository } from 'typeorm';
import { Body, Controller, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PushService } from '@alice/alice-common/services/push.service';

@Controller()
@ApiTags('Push')
export class PushController implements PushService {
  constructor(@Inject('FirebaseMessagingService') private firebaseService: FirebaseMessagingService) {}

  @Put('/save_token')
  @ApiResponse({ status: 200, type: Empty, description: 'Token was successfully saved' })
  async saveToken(@Body() firebaseToken: FirebaseToken): Promise<Empty> {
    await getRepository(FirebaseToken).save(firebaseToken);
    return new Empty();
  }

  @Post('/send_notification/:id')
  @ApiResponse({ status: 200, type: PushResult, description: 'Successfully send notification' })
  async send(@Param('id') id: string, @Body() notification: PushNotification): Promise<PushResult> {
    const receiverToken = await getRepository(FirebaseToken).findOne(Number(id));

    if (!receiverToken) {
      return { success: 0, failure: 1 };
    }
    const sendResult = await this.firebaseService.send(receiverToken.token, notification.title, notification.body);
    return { ...sendResult, token_used: receiverToken.token };
  }
}
