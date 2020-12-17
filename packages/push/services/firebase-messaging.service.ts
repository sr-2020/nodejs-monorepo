import { PushResult } from '@alice/alice-common/models/push-result.model';
import { HttpService, Injectable } from '@nestjs/common';

export interface FirebaseMessagingService {
  send(recipient: string, title: string, body: string): Promise<PushResult>;
}

@Injectable()
export class FirebaseMessagingServiceImpl implements FirebaseMessagingService {
  constructor(private httpService: HttpService) {}

  async send(recipient: string, title: string, body: string): Promise<PushResult> {
    const response = await this.httpService
      .post<PushResult>(
        'https://fcm.googleapis.com/fcm/send',
        {
          to: recipient,
          notification: {
            body,
            title,
          },
        },
        {
          headers: {
            authorization: `key=${process.env.FIREBASE_SERVER_TOKEN}`,
          },
        },
      )
      .toPromise();
    return response.data;
  }
}
