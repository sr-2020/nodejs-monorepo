import * as express from 'express';
import * as moment from 'moment';

import { DatabasesContainer } from "./services/db-container";
import { NotFoundError, UnauthorizedError } from "routing-controllers";

class LoginNotFoundError extends Error { }

export function currentTimestamp(): number {
  return new Date().valueOf();
}

export async function canonicalId(dbContainer: DatabasesContainer, idOrLogin: string): Promise<string> {
  if (/^[0-9]*$/.test(idOrLogin))
    return idOrLogin;

  const docs = await dbContainer.accountsDb().query('account/by-login', { key: idOrLogin });
  if (docs.rows.length == 0)
    throw new LoginNotFoundError('No user with such login found');
  if (docs.rows.length > 1)
    throw new LoginNotFoundError('Multiple users with such login found');

  return docs.rows[0].id;
}

export function IsNotFoundError(e): boolean {
  return (e.status && e.status == 404 && e.reason && e.reason == 'missing') ||
    (e instanceof LoginNotFoundError);
}

export function returnCharacterNotFoundOrRethrow(e: any) {
  if (IsNotFoundError(e))
    throw new NotFoundError('Character with such id or login is not found');
  else
    throw e;
}

export function RequestId(req: express.Request): string {
  return (req as any).id;
}

export function createLogData(req: express.Request, status: number): any {
  const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS';
  const responseStartMoment = (req as any).timestamp;
  return {
    requestId: RequestId(req),
    status,
    requestTime: responseStartMoment.format(dateFormat),
    responseTime: moment().format(dateFormat),
    processingTime: currentTimestamp() - responseStartMoment.valueOf(),
    url: req.url,
    method: req.method,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    characterId: req.params.id,
    query: req.query,
    source: 'api'
  };
}

export async function checkAccess(dbContainer: DatabasesContainer, from: string, to: string) {
  if (from == to)
    return;
  try {
    const allowedAccess = (await dbContainer.accountsDb().get(to)).access;
    if (allowedAccess.some((access) => access.id == from && access.timestamp >= currentTimestamp()))
      return;
    else
      throw new UnauthorizedError('Trying to access user without proper access rights');
  }
  catch (e) {
    returnCharacterNotFoundOrRethrow(e);
  }
}
