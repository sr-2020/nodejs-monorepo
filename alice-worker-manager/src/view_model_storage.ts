import { Inject } from './di';

import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { ModelStorage } from './model_storage';

@Inject
export class ViewModelStorage {
    private aliases: {
        [alias: string]: ModelStorage;
    };

    constructor(config: Config, dbConnector: DBConnectorInterface) {
        this.aliases = {};

        // tslint:disable-next-line:forin
        for (const alias in config.viewModels) {
            let dbName = config.viewModels[alias];
            if (config.db[dbName]) dbName = config.db[dbName];

            const db = dbConnector.use(dbName);
            this.aliases[alias] = new ModelStorage(db);
        }
    }

    public store(alias: string, model: any) {
        if (this.aliases[alias]) {
            return this.aliases[alias].store(model);
        }

        return Promise.resolve();
    }
}
