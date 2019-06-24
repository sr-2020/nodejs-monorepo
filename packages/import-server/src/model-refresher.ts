import { now } from 'moment';
import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import { ModelMetadata } from 'alice-model-engine-api';
import { config } from './config';
import { JoinCharacterDetail } from './join-importer';


export class ModelRefresher {
  private metadataCon: PouchDB.Database<ModelMetadata>;

  constructor() {
    const ajaxOpts = {
      auth: {
        username: config.username,
        password: config.password,
      },
    };

    this.metadataCon = new PouchDB(`${config.url}${config.metadataDbName}`, ajaxOpts);
  }

  // Вызывает пересчет экспортрованной модели, что бы сформировалась Work/ViewModel
  public async sentRefreshEvent(char: JoinCharacterDetail): Promise<any> {
    if (!char._id)
      return;

    let scheduledUpdateTimestamp = now();

    if (char.model && char.model.timestamp) {
      scheduledUpdateTimestamp = char.model.timestamp + 1000;
    }

    return this.metadataCon.upsert(char._id, (doc) => {
      return { ...doc, _id: char._id, scheduledUpdateTimestamp };
    });
  }
}
