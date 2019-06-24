import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { ModelStorageBase } from './model_storage';

export class ViewModelStorage {
  private aliases: {
    [alias: string]: ModelStorageBase;
  };

  constructor(config: Config, dbConnector: DBConnectorInterface) {
    this.aliases = {};

    // tslint:disable-next-line:forin
    for (const alias in config.viewModels) {
      let dbName = config.viewModels[alias];
      if (config.db[dbName]) dbName = config.db[dbName];

      const db = dbConnector.use(dbName);
      this.aliases[alias] = new ModelStorageBase(db);
    }
  }

  public store(alias: string, model: any) {
    if (this.aliases[alias]) {
      return this.aliases[alias].store(model);
    }

    return Promise.resolve();
  }
}
