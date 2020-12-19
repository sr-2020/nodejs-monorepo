import { PushNotification } from '../models/push-notification.model';
import { PushResult } from '../models/push-result.model';
import { HttpService, Injectable } from '@nestjs/common';

export interface PushService {
  send(recipient: string, notification: PushNotification): Promise<PushResult>;
}

@Injectable()
export class PushServiceImpl implements PushService {
  constructor(private httpService: HttpService) {}

  async send(recipient: string, notification: PushNotification): Promise<PushResult> {
    const baseURL: string = process.env.PUSH_URL ?? 'http://push';
    const response = await this.httpService.post<PushResult>(`${baseURL}/send_notification/${recipient}`, notification).toPromise();
    return response.data;
  }
}
