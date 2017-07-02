import { Inject } from './di';

import { Config } from './config';
import { ModelStorage } from './model_storage';
import { DBConnectorInterface } from './db/interface';

@Inject
export class ViewModelStorage {
    private aliases: {
        [alias: string]: ModelStorage
    };

    constructor(config: Config, dbConnector: DBConnectorInterface) {
        this.aliases = {};

        for (let alias in config.db) {
            if (['url', 'models', 'workingModels', 'events'].indexOf(alias) != -1) continue;

            let db = dbConnector.use(config.db[alias]);
            this.aliases[alias] = new ModelStorage(db);
        }
    }

    store(alias: string, model: any) {
        if (this.aliases[alias]) {
            return this.aliases[alias].store(model);
        }

        return Promise.resolve();
    }
}
