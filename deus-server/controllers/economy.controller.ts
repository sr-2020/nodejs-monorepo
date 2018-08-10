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
  BalancesDocument, DatabasesContainerToken, ProvisionRequest, SetBonusRequest, TransactionRequest,
} from '../services/db-container';
import {
   AccessPropagation, canonicalId, checkAccess, currentTimestamp, returnCharacterNotFoundOrRethrow,
} from '../utils';

import { AliceAccount } from '../models/alice-account';
import { EconomyConstants } from '../models/economy-constants';
import { calculateSalary } from '../services/salary-calculator';

@JsonController()
export class EconomyController {
  @Post('/economy/transfer')
  public async transfer(
    @CurrentUser() user: AliceAccount, @Body() body: TransactionRequest,
  ) {
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

  @Post('/economy/set_bonus')
  public async setBonus(
    @CurrentUser() user: AliceAccount, @Body() body: SetBonusRequest,
  ) {
    try {
      const bonuses = user.companyAccess.filter(((x) => x.isTopManager)).map((access) => access.companyName);

      if (bonuses.length == 0) {
        throw new BadRequestError('Только топ-менеджеры могут устанавливать премии');
      }

      body.userId = await canonicalId(body.userId);

      const db = Container.get(DatabasesContainerToken).accountsDb();

      await db.upsert(body.userId, (doc) => {
        if (body.bonusSet) {
          bonuses.forEach( (bonus) => doc.jobs.companyBonus.push(bonus));
        } else {
          doc.jobs.companyBonus = doc.jobs.companyBonus.filter((bonus) => !bonuses.includes(bonus));
        }
        return doc;
      });

      const action = body.bonusSet ? 'Установлена' : 'Снята';
      await sendGenericPushNotification(body.userId,
        makeVisibleNotificationPayload(`${action} премия от компании: ${bonuses.join(', ')}`));
      return {};
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Post('/economy/provision')
  public async provision( @CurrentUser() user: AliceAccount, @Body() body: ProvisionRequest) {
    try {
      let { userId } = body;

      userId = await canonicalId(userId);

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
  public async paySalary( @CurrentUser() user: AliceAccount) {
    try {
      await checkAccess(user, user._id, AccessPropagation.AdminOnly);

      const accounts = await Container.get(DatabasesContainerToken).accountsDb().allDocs({ include_docs: true });

      const db = Container.get(DatabasesContainerToken).economyDb();

      const economyConstants = await db.get('constants') as EconomyConstants;

      // TODO non-human or dead accounts

      await db.upsert('balances', (doc) => {
        accounts.rows.forEach((account) => {
          if (account.doc && doc[account.doc._id]) {

            doc[account.doc._id] += calculateSalary(account.doc, economyConstants);
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
  public async get( @CurrentUser() user: AliceAccount, @Param('id') id: string) {
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
