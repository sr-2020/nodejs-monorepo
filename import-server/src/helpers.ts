import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs/Rx';
import * as winston from 'winston';

/**
 * Сохранить в БД (connection) переданный объект (doc)
 * Перед сохранением проверяется есть ли там уже такой думент,
 * если задан update == true, то этот документ обновляется
 *
 */
export async function saveObject(connection: PouchDB.Database, doc: any, update: boolean = true): Promise<any> {

  doc = cloneDeep(doc);

  // Если в объекте не установлен _id => то его можно просто сохранять, проставится автоматически
  if (!doc._id) {
    return connection.post(doc);
  }

  try {
    const oldDoc = await connection.get(doc._id);
    winston.debug(`try to save: ${doc._id}`);
    if (update) {
      doc._rev = oldDoc._rev;
      return connection.put(doc);
    } else {
      return { status: 'exist', oldDoc: oldDoc };
    }
  } catch (err) {
    if (err.status && err.status == 404) {
      return connection.put(doc);
    } else {
      winston.error('Error in saveObject: ', err, doc);
    }
  }
}
