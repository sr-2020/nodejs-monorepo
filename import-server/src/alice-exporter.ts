import * as PouchDB from 'pouchdb';
import { Observable } from 'rxjs/Rx';
import * as winston from 'winston';

import { convertAliceModel } from './alice-model-converter';
import { CharacterParser } from './character-parser';
import { config } from './config';
import { saveObject } from './helpers';
import { AliceAccount } from './interfaces/alice-account';
import { DeusModel } from './interfaces/deus-model';
import { JoinCharacterDetail } from './join-importer';
import { JoinMetadata } from './join-importer';

export interface INameParts {
  firstName: string;
  nicName: string;
  lastName: string;
  fullName: string;
}

export interface ExportResult {
  account: 'ok' | 'error';
  model: 'ok' | 'error';
}

export class AliceExporter {

  public model: DeusModel | undefined;
  public account: AliceAccount | undefined;

  public conversionProblems: string[] = [];

  private con: PouchDB.Database<DeusModel>;
  private accCon: PouchDB.Database;
  private eventsCon: PouchDB.Database;

  private character: CharacterParser;

  constructor(character: JoinCharacterDetail,
              metadata: JoinMetadata,
              private isUpdate: boolean = true,
              private ignoreInGame: boolean = false) {

    const ajaxOpts = {
      auth: {
        username: config.username,
        password: config.password,
      },

      timeout: 6000 * 1000,
    };

    this.con = new PouchDB(`${config.url}${config.modelDBName}`, ajaxOpts);
    this.accCon = new PouchDB(`${config.url}${config.accountDBName}`, ajaxOpts);
    this.eventsCon = new PouchDB(`${config.url}${config.eventsDBName}`, ajaxOpts);

    this.character = new CharacterParser(character, metadata);

    this.createModel();
  }

  public export(): Promise<ExportResult | void> {

    if (!this.model) {
      winston.warn(`Character(${this.character.characterId}) not converted. ` +
        `Reasons: ${this.conversionProblems.join('; ')}`);
      return Promise.resolve();
    }

    winston.info(`Will export converted Character(${this.model._id})`);

    const results: ExportResult = {
      account: 'error',
      model: 'error',
    };

    let oldModel = Observable
      .fromPromise(this.con.get(this.model._id))
      .catch((err) => {
        winston.info(`Model doesnt exist`, err);
        return Observable.of(null);
      });

    if (this.ignoreInGame) {
      winston.info(`Ovveride inGame flag for id=${this.model._id}`);
      oldModel = Observable.of(null);
    }

    const model = this.model;

    return oldModel
      // ===== Проверка InGame для для случая обновления ==============================
      .filter((o) => {
        if (o && o.inGame) {
          winston.info(`Character model ${o._id} already in game!`);
          return false;
        }
        return true;
      })

      .do(() => this.clearEvents(model._id))
      .flatMap(() => saveObject(this.con, this.model, this.isUpdate))
      .do((result) => results.model = result.ok ? 'ok' : 'error')

      .flatMap(() => {
        if (this.account) {
          winston.debug(`Providing account for character ${model._id}`);
          return saveObject(this.accCon, this.account, this.isUpdate);
        } else {
          winston.warn(`Cannot provide account for Character(${model._id})`);
          return Promise.resolve(false);
        }
      })
      .do((result) => results.account = result.ok ? 'ok' : 'error')

      .map(() => results)
      .toPromise();

  }

  /**
   * Очистка очереди события для данного персонажа (если они были)
   */
  public clearEvents(characterId: string) {
    const selector = {
      selector: { characterId },
      limit: 10000,
    };

    return Observable.from(this.eventsCon.find(selector))
      .flatMap((result) => {
        return this.eventsCon.bulkDocs(
          result.docs.map((x) => ({ ...x, _deleted: true })),
        );
      });
  }

  private createModel() {
    const result = convertAliceModel(this.character);
    this.model = result.model;
    this.account = result.account;
    this.conversionProblems = result.problems;
  }
}
