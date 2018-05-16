import * as express from 'express';
import * as moment from 'moment';
import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import { DatabasesContainerToken, Account } from "./services/db-container";
import { NotFoundError, UnauthorizedError } from "routing-controllers";
import { Container } from "typedi";

class LoginNotFoundError extends Error { }

export function currentTimestamp(): number {
  return new Date().valueOf();
}

export async function canonicalId(idOrLogin: string): Promise<string> {
  if (/^[0-9]*$/.test(idOrLogin))
    return idOrLogin;

  const docs = await Container.get(DatabasesContainerToken).accountsDb().find({
    selector: { login: idOrLogin }
  });

  if (docs.docs.length == 0)
    throw new LoginNotFoundError('No user with such login found');
  if (docs.docs.length > 1)
    throw new LoginNotFoundError('Multiple users with such login found');

  return docs.docs[0]._id;
}

export async function canonicalIds(ids?: string[]): Promise<string[]> {
  return ids ? Promise.all(ids.map((id) => canonicalId(id))) : [];
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

export enum AccessPropagation {
  Default,
  AdminOnly,
  NoPropagation,
}

export async function checkAccess(from: Account, to: string, accessPropagation: AccessPropagation = AccessPropagation.Default) {
  if (from.roles && from.roles.includes('admin'))
    return;

  if (accessPropagation == AccessPropagation.AdminOnly)
    throw new UnauthorizedError('Only admins can access this method');

  if (from._id == to)
    return;

  if (accessPropagation == AccessPropagation.NoPropagation)
    throw new UnauthorizedError('Trying to access method of another user, but access propagation is not allowed');

  try {
    const allowedAccess = (await Container.get(DatabasesContainerToken).accountsDb().get(to)).access;
    if (allowedAccess && allowedAccess.some((access) => access.id == from._id && access.timestamp >= currentTimestamp()))
      return;
    else
      throw new UnauthorizedError('Trying to access user without proper access rights');
  }
  catch (e) {
    returnCharacterNotFoundOrRethrow(e);
  }
}
