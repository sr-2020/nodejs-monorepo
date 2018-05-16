import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(PouchDBFind);

import { JsonController, Post, CurrentUser, Body, BadRequestError, Get, Param } from "routing-controllers";
import { Container } from "typedi";

import { DatabasesContainerToken, TransactionRequest, BalancesDocument, TransactionDocument, Account } from "../services/db-container";
import { returnCharacterNotFoundOrRethrow, canonicalId, checkAccess, currentTimestamp } from "../utils";
import { sendGenericPushNotification, makeVisibleNotificationPayload } from "../push-helpers";


@JsonController()
export class EconomyController {
  @Post("/economy/transfer")
  async transfer( @CurrentUser() user: Account, @Body() body: TransactionRequest) {
    try {
      body.sender = await canonicalId(body.sender);
      await checkAccess(user, body.sender);
      body.receiver = await canonicalId(body.receiver);
      if (body.amount <= 0)
        throw new BadRequestError("Величина транзакции должна быть положительной.")
      if (body.sender == body.receiver)
        throw new BadRequestError("Нельзя переводить деньги самому себе.")

      const db = Container.get(DatabasesContainerToken).economyDb();
      await db.upsert("balances", (doc) => {
        if (doc[body.sender] < body.amount)
          throw new BadRequestError("Недостаточно денег.")
        doc[body.sender] -= body.amount;
        doc[body.receiver] += body.amount;
        return doc;
      });
      await db.post({
        sender: body.sender,
        receiver: body.receiver,
        amount: body.amount,
        timestamp: currentTimestamp(),
        description: body.description
      });
      await sendGenericPushNotification(body.receiver,
        makeVisibleNotificationPayload(`Получен платеж: ${body.amount}`, `Отправитель платежа: ${body.sender}`));
      return {};
    }
    catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Get("/economy/:id")
  async get( @CurrentUser() user: Account, @Param("id") id: string) {
    id = await canonicalId(id);
    await checkAccess(user, id);
    const db = Container.get(DatabasesContainerToken).economyDb();
    const doc = await db.get('balances') as BalancesDocument;

    // For whatever reason, Mongo query $or fails to use indices,
    // so we do concatenation manually.
    const docs =
      (await Container.get(DatabasesContainerToken).economyDb().find({
        selector: {
          sender: id
        }
      })).docs.concat(
        (await Container.get(DatabasesContainerToken).economyDb().find({
          selector: {
            receiver: id
          }
        })).docs)

    return {
      balance: doc[id],
      history: docs.map((document) => {
        delete document._id;
        delete (document as any)._rev;
        return document;
      }).sort((l: any, r: any) => r.timestamp - l.timestamp)
    };
  }
}
