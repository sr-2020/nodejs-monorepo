import * as moment from 'moment';
import * as PouchDB from 'pouchdb';
import * as winston from 'winston';

import { config } from './config';
import { ImportRunStats } from './import-run-stats';
import { JoinCharacter, JoinCharacterDetail, JoinImporter, JoinMetadata } from './join-importer';

export class TempDbWriter {

  public lastStatsDocID = 'lastImportStats';

  public metadataDocID = 'JoinMetadata';

  private con: PouchDB.Database<JoinCharacterDetail | JoinMetadata>;

  private exceptionIds = ['JoinMetadata', 'lastImportStats'];

  constructor() {
    const ajaxOpts = {
      auth: {
        username: config.username,
        password: config.password,
      },
    };

    this.con = new PouchDB(`${config.url}${config.tempDbName}`, ajaxOpts);
  }

  public setFieldsNames(c: JoinCharacterDetail, metadata: JoinMetadata): JoinCharacterDetail {
    c.Fields.forEach((f) => {
      const fmeta = metadata.Fields.find((v) => v.ProjectFieldId == f.ProjectFieldId);
      f.FieldName = fmeta ? fmeta.FieldName : '';
    });

    return c;
  }

  public saveCharacter(c: JoinCharacterDetail): Promise<any> {
    c._id = c.CharacterId.toString();

    return this.con.get<JoinCharacterDetail>(c._id)
      .then((oldc: JoinCharacterDetail) => {
        c._rev = oldc._rev;
        return this.con.put(c);
      })
      .catch(() => this.con.put(c));
  }

  public saveLastStats(s: ImportRunStats): Promise<any> {

    const stats: any = {
      _id: this.lastStatsDocID,
      importTime: s.importTime.format('YYYY-MM-DDTHH:mm'),
      imported: s.imported,
      created: s.created,
      updated: s.updated,
    };

    return this.con.get<JoinCharacterDetail>(this.lastStatsDocID)
      .then((oldc: JoinCharacterDetail) => {
        stats._rev = oldc._rev;
        return this.con.put(stats);
      })
      .catch(() => this.con.put(stats));

  }

  public getLastStats(): Promise<ImportRunStats> {
    return this.con.get(this.lastStatsDocID).then((s: any) => {
      const ret = new ImportRunStats(moment(s.importTime, 'YYYY-MM-DDTHH:mm'));
      ret.created = s.created;
      ret.imported = s.imported;
      ret.updated = s.updated;
      return ret;
    })
      .catch(() => {
        return (new ImportRunStats(moment([1900, 0, 1])));
      });
  }

  public saveMetadata(s: JoinMetadata): Promise<any> {
    s._id = this.metadataDocID;

    return this.con.get<JoinMetadata>(this.metadataDocID)
      .then((oldc: JoinMetadata) => {
        s._rev = oldc._rev;
        winston.info('Metadata saved!');
        return this.con.put(s);
      })
      .catch(() => this.con.put(s));

  }

  public getMetadata(): Promise<JoinMetadata | null> {
    return this.con.get<JoinMetadata>(this.metadataDocID)
      .catch(() => Promise.resolve(null));

  }

  public getCacheCharactersList(): Promise<JoinCharacter[]> {
    return this.con.allDocs().then((docs) => {
      return docs.rows
        .filter((doc: any) => !this.exceptionIds.find((e) => e == doc.id))
        .map((doc) => JoinImporter.createJoinCharacter(Number(doc.id)));
    });
  }

  public getCacheCharacter(id: string): Promise<JoinCharacterDetail> {
    return this.con.get(id);
  }
}
