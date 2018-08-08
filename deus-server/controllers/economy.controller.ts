import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(PouchDBFind);

import {
  BadRequestError, Body, CurrentUser, Get, JsonController, NotFoundError, Param, Post,
} from 'routing-controllers';

import { Container } from 'typedi';

import { makeVisibleNotificationPayload, sendGenericPushNotification } from '../push-helpers';
import {
  Account, BalancesDocument, DatabasesContainerToken, ProvisionRequest, TransactionRequest,
} from '../services/db-container';
import {
   AccessPropagation, canonicalId, checkAccess, currentTimestamp, returnCharacterNotFoundOrRethrow,
} from '../utils';

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
        if (doc[body.receiver] == undefined)
          throw new NotFoundError('Получатель не найден');
        if (doc[body.sender] == undefined)
          throw new NotFoundError('Отправитель не найден');

        if (doc[body.sender] < body.amount)
          throw new BadRequestError('Недостаточно денег.');

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
        makeVisibleNotificationPayload(`Получен платеж: ${body.amount}`,
          `Отправитель платежа: ${body.sender}`
            + ((body.description != undefined && body.description.length > 0)
              ? `, описание: "${body.description}"` : '')));
      return {};
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Post('/economy/provision')
  public async provision( @CurrentUser() user: Account, @Body() body: ProvisionRequest) {
    try {
      const { userId } = body;

      await checkAccess(user, userId, AccessPropagation.AdminOnly);

      if (body.initialBalance < 0)
        throw new BadRequestError('Начальный баланс не может быть отрицательным');

      const target = await Container.get(DatabasesContainerToken).accountsDb().get(userId);

      if (!target)
        throw new NotFoundError('Не удалось найти пользователя');

      const db = Container.get(DatabasesContainerToken).economyDb();
      await db.upsert('balances', (doc) => {
        doc[userId] = body.initialBalance;
        return doc;
      });

      // TODO: consider deleting all transactions for this user
      return {};
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Post('/economy/pay_salary')
  public async paySalary( @CurrentUser() user: Account) {
    try {
      await checkAccess(user, user._id, AccessPropagation.AdminOnly);

      const accounts = await Container.get(DatabasesContainerToken).accountsDb().allDocs({ include_docs: true });

      const db = Container.get(DatabasesContainerToken).economyDb();
      await db.upsert('balances', (doc) => {
        accounts.rows.forEach((account) => {
          if (account.doc && doc[account.doc._id]) {
            // TODO add salary formula
            doc[account.doc._id] += 1;
          }
        });
        return doc;
      });

      // TODO: add salary transaction
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
