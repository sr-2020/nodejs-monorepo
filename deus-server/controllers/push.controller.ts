import { JsonController, Get, Post, Req, Param, Body, UseBefore, CurrentUser } from "routing-controllers";
import { sendGenericPushNotificationThrowOnError, makeVisibleNotificationPayload, makeSilentRefreshNotificationPayload } from "../push-helpers";
import { canonicalId, AccessPropagation, checkAccess } from "../utils";
import { Account } from "../services/db-container";

interface Notification {
  title: string,
  body?: string,
}

@JsonController()
export class PushController {

  @Post("/push/visible/:id")
  async postVisible(@CurrentUser() user: Account, @Param("id") id: string, @Body() notification: Notification) {
    await checkAccess(user, id, AccessPropagation.AdminOnly);
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id),
      makeVisibleNotificationPayload(notification.title, notification.body));
  }

  @Post("/push/refresh/:id")
  async postRefresh(@CurrentUser() user: Account, @Param("id") id: string) {
    await checkAccess(user, id, AccessPropagation.AdminOnly);
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id),
      makeSilentRefreshNotificationPayload());
  }

  @Post("/push/:id")
  async postGeneric(@CurrentUser() user: Account, @Param("id") id: string, @Body() payload: any) {
    await checkAccess(user, id, AccessPropagation.AdminOnly);
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id), payload);
  }
}