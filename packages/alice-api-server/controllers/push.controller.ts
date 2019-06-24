import { Body, CurrentUser, JsonController, Param, Post } from 'routing-controllers';
import { makeSilentRefreshNotificationPayload, makeVisibleNotificationPayload,
  sendGenericPushNotificationThrowOnError } from '../push-helpers';
import { AccessPropagation, canonicalId, checkAccess } from '../utils';

import { AliceAccount } from '../models/alice-account';

interface Notification {
  title: string;
  body?: string;
}

@JsonController()
export class PushController {

  @Post('/push/visible/:id')
  public async postVisible(
    @CurrentUser() user: AliceAccount,
    @Param('id') id: string,
    @Body() notification: Notification,
  ) {
    await checkAccess(user, id, AccessPropagation.AdminOnly);
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id),
      makeVisibleNotificationPayload(notification.title, notification.body));
  }

  @Post('/push/refresh/:id')
  public async postRefresh(@CurrentUser() user: AliceAccount, @Param('id') id: string) {
    await checkAccess(user, id, AccessPropagation.AdminOnly);
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id),
      makeSilentRefreshNotificationPayload());
  }

  @Post('/push/:id')
  public async postGeneric(@CurrentUser() user: AliceAccount, @Param('id') id: string, @Body() payload: any) {
    await checkAccess(user, id, AccessPropagation.AdminOnly);
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id), payload);
  }
}
