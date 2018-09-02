import * as PouchDB from 'pouchdb';
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

  public async export(): Promise<ExportResult | void> {

    if (!this.model) {
      winston.warn(`Character(${this.character.characterId}) not converted. ` +
        `Reasons: ${this.conversionProblems.join('; ')}`);
      return Promise.resolve();
    }

    winston.info(`Will export converted Character(${this.model._id})`);

    const existingModel = await this.getExistingModel();
    if (existingModel && existingModel.inGame) {
      winston.info(`Character model ${existingModel._id} already in game!`);
      return { account: 'ok', model: 'ok' };
    }

    await this.clearEvents(this.model._id);
    const savedModel = await saveObject(this.con, this.model, this.isUpdate);
    let savedAccount: any;
    if (this.account) {
      winston.debug(`Providing account for character ${this.model._id}`);
      savedAccount = await saveObject(this.accCon, this.account, this.isUpdate);
    } else {
      winston.warn(`Cannot provide account for Character(${this.model._id})`);
      savedAccount = false;
    }

    return {
      account: savedAccount ? 'ok' : 'error',
      model: savedModel ? 'ok' : 'error',
    };
  }

  private async getExistingModel(): Promise<DeusModel | null> {
    if (!this.model) return null;
    if (this.ignoreInGame) {
      winston.info(`Overriding inGame flag for id=${this.model._id}`);
      return null;
    }

    try {
      return this.con.get(this.model._id);
    } catch (err) {
      winston.info(`Model doesnt exist`, err);
      return null;
    }
  }

  /**
   * Очистка очереди события для данного персонажа (если они были)
   */
  private async clearEvents(characterId: string) {
    const selector = {
      selector: { characterId },
      limit: 10000,
    };

    const events = await this.eventsCon.find(selector);
    this.eventsCon.bulkDocs(
      events.docs.map((x) => ({ ...x, _deleted: true })),
    );
  }

  private createModel() {
    const result = convertAliceModel(this.character);
    this.model = result.model;
    this.account = result.account;
    this.conversionProblems = result.problems;
  }
}
