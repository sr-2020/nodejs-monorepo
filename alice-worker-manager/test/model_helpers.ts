import { merge } from 'lodash';
import { Document } from '../src/db/interface';
import { dbName } from '../src/db_init/util';
import { ConfigToken, DBConnectorToken } from '../src/di_tokens';
import { delay } from '../src/utils';

function testDbName(di: any, alias: string): string {
    return dbName(di.get(ConfigToken), alias);
}

export function createModelObj(id?: string, fields?: any) {
    if (!fields) {
        fields = { value: '' };
    }

    if (!id) {
        id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    const model = merge({
        _id: id,
        timestamp: Date.now(),
    }, fields);

    return model;
}

export function saveModel(di: any, model: any) {
    const modelsDb = di.get(DBConnectorToken).use(testDbName(di, 'models'));
    return modelsDb.put(model);
}

export async function createModel(di: any, id?: string, fields?: any): Promise<Document> {
    const model = createModelObj(id, fields);
    await saveModel(di, model);
    return model;
}

export function getModel(di: any, id: string, dbAlias: string = 'models') {
    const modelsDb = di.get(DBConnectorToken).use(testDbName(di, dbAlias));
    return modelsDb.getOrNull(id);
}

// Waits until model with given timestamp will be generated
export async function getModelAtTimestamp(di: any, id: string, timestamp: number, dbAlias: string = 'models') {
    while (true) {
        const model = await getModel(di, id, dbAlias);
        if (model && 'timestamp' in model && model.timestamp == timestamp)
            return model;
        await delay(10);
    }
}

export function getModelVariants(di: any, id: string,
                                 aliases: string[] = ['models', 'workingModels', 'defaultViewModels']) {
    const pending = aliases.map((alias) => getModel(di, id, alias));
    return Promise.all(pending);
}

export function getModelVariantsAtTimestamp(di: any, id: string, timestamp: number,
                                            aliases: string[] = ['models', 'workingModels', 'defaultViewModels']) {
    const pending = aliases.map((alias) => getModelAtTimestamp(di, id, timestamp, alias));
    return Promise.all(pending);
}

export function pushEvent(di: any, event: any) {
    const eventsDb = di.get(DBConnectorToken).use(testDbName(di, 'events'));
    return eventsDb.put(event);
}

export function saveObject(di: any, dbAlias: string, doc: any) {
    const db = di.get(DBConnectorToken).use(testDbName(di, dbAlias));
    return db.put(doc);
}

export function getObject(di: any, dbAlias: string, id: string) {
    const db = di.get(DBConnectorToken).use(testDbName(di, dbAlias));
    return db.getOrNull(id);
}
