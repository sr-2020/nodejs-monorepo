import * as moment from 'moment';
import { ImportRunStats } from './import-run-stats';

export class ImportStats {

  public imports: ImportRunStats[] = [];

  public lastRefreshTime = moment([1900, 0, 1]);
  // public lastRefreshTime = moment().subtract(3,"hours");

  constructor() { }

  public toString(): string {
    return JSON.stringify(Array.from(this.imports).reverse(), null, 4);
  }

  public updateRefreshTime() {
    this.lastRefreshTime = moment.utc();
  }

  public addImportStats(s: ImportRunStats) {
    this.lastRefreshTime = s.importTime;

    if (s.imported.length === 0) {
      return;
    }

    if (this.imports.length > 100) {
      this.imports.shift();
    }

    this.imports.push(s);
  }

}
