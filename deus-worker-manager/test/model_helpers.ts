import { merge } from 'lodash';
import { DIInterface } from '../src/di';
import { Document } from '../src/db/interface';

export async function createModel(di: DIInterface, id?: string, fields?: any): Promise<Document> {
    let modelsDb = di.dbConnector.use(di.config.db.models);

    if (!fields) {
        fields = { value: '' };
    }

    if (!id) {
        id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    let model = merge({
        _id: id,
        timestamp: Date.now(),
    }, fields);

    await modelsDb.put(model);

    return model;
}

export function getModel(di: DIInterface, id: string, dbAlias: string = 'models') {
    let modelsDb = di.dbConnector.use(di.config.db[dbAlias]);
    return modelsDb.getOrNull(id);
}

export function getModelVariants(di: DIInterface, id: string, aliases: string[] = ['models', 'workingModels', 'viewModels']) {
    let pending = aliases.map((alias) => getModel(di, id, alias));
    return Promise.all(pending);
}

export function pushEvent(di: DIInterface, event: any) {
    let eventsDb = di.dbConnector.use(di.config.db.events);
    return eventsDb.put(event);
}
