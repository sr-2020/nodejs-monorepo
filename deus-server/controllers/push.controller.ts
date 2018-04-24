import { JsonController, Get, Post, Req, Param, Body, UseBefore } from "routing-controllers";
import { sendGenericPushNotificationThrowOnError, makeVisibleNotificationPayload, makeSilentRefreshNotificationPayload } from "../push-helpers";
import { canonicalId } from "../utils";
import { PushAuthMiddleware } from "../middleware/push-auth";

interface Notification {
  title: string,
  body?: string,
}

@JsonController()
@UseBefore(PushAuthMiddleware)
export class PushController {

  @Post("/push/visible/:id")
  async postVisible(@Param("id") id: string, @Body() notification: Notification) {
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id),
      makeVisibleNotificationPayload(notification.title, notification.body));
  }

  @Post("/push/refresh/:id")
  async postRefresh(@Param("id") id: string) {
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id),
      makeSilentRefreshNotificationPayload());
  }

  @Post("/push/:id")
  async postGeneric(@Param("id") id: string, @Body() payload: any) {
    return await sendGenericPushNotificationThrowOnError(await canonicalId(id), payload);
  }
}