import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(PouchDBFind);

import { BadRequestError, Body, CurrentUser, Get, JsonController, Param, Post, NotFoundError } from 'routing-controllers';
import { Container } from 'typedi';

import { makeVisibleNotificationPayload, sendGenericPushNotification } from '../push-helpers';
import { Account, BalancesDocument, DatabasesContainerToken, TransactionRequest } from '../services/db-container';
import { canonicalId, checkAccess, currentTimestamp, returnCharacterNotFoundOrRethrow } from '../utils';

@JsonController()
export class EconomyController {
  @Post('/economy/transfer')
  public async transfer( @CurrentUser() user: Account, @Body() body: TransactionRequest) {
    try {
      body.sender = await canonicalId(body.sender);
      await checkAccess(user, body.sender);
      body.receiver = await canonicalId(body.receiver);
      if (body.amount <= 0)
        throw new BadRequestError('Величина транзакции должна быть положительной.');
      if (body.sender == body.receiver)
        throw new BadRequestError('Нельзя переводить деньги самому себе.');

      const db = Container.get(DatabasesContainerToken).economyDb();
      await db.upsert('balances', (doc) => {
        if (doc[body.sender] < body.amount)
          throw new BadRequestError('Недостаточно денег.');
        if (doc[body.receiver] == undefined)
          throw new NotFoundError('Получатель не найден');

        doc[body.sender] -= body.amount;
        doc[body.receiver] += body.amount;
        return doc;
      });
      await db.post({
        sender: body.sender,
        receiver: body.receiver,
        amount: body.amount,
        timestamp: currentTimestamp(),
        description: body.description,
      });
      await sendGenericPushNotification(body.receiver,
        makeVisibleNotificationPayload(`Получен платеж: ${body.amount}`, `Отправитель платежа: ${body.sender}`));
      return {};
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Get('/economy/:id')
  public async get( @CurrentUser() user: Account, @Param('id') id: string) {
    id = await canonicalId(id);
    await checkAccess(user, id);
    const db = Container.get(DatabasesContainerToken).economyDb();
    const doc = await db.get('balances') as BalancesDocument;

    // For whatever reason, Mongo query $or fails to use indices,
    // so we do concatenation manually.
    const docs =
      (await Container.get(DatabasesContainerToken).economyDb().find({
        selector: {
          sender: id,
        },
      })).docs.concat(
        (await Container.get(DatabasesContainerToken).economyDb().find({
          selector: {
            receiver: id,
          },
        })).docs);

    return {
      balance: doc[id],
      history: docs.map((document) => {
        delete document._id;
        delete (document as any)._rev;
        return document;
      }).sort((l: any, r: any) => r.timestamp - l.timestamp),
    };
  }
}
