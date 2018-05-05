import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import { JsonController, Post, CurrentUser, Body, BadRequestError, Get, Param } from "routing-controllers";
import { Container } from "typedi";

import { DatabasesContainerToken, TransactionRequest, BalancesDocument, TransactionDocument } from "../services/db-container";
import { returnCharacterNotFoundOrRethrow, canonicalId, checkAccess, currentTimestamp } from "../utils";


@JsonController()
export class EconomyController {
  @Post("/economy/transfer")
  async transfer( @CurrentUser() user: string, @Body() body: TransactionRequest) {
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
      return {};
    }
    catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Get("/economy/:id")
  async get( @CurrentUser() user: string, @Param("id") id: string) {
    id = await canonicalId(id);
    await checkAccess(user, id);
    const db = Container.get(DatabasesContainerToken).economyDb();
    const doc = await db.get('balances') as BalancesDocument;

    const docs = await Container.get(DatabasesContainerToken).economyDb().query('economy/by-id', { key: id, include_docs: true });
    return {
      balance: doc[id],
      history: docs.rows.map((row: any) => {
        delete row.doc._id;
        delete row.doc._rev;
        return row.doc;
      }).sort((l: any, r: any) => r.timestamp - l.timestamp)
    };
  }
}
