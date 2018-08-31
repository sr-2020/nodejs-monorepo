import { Event } from 'alice-model-engine-api';
import { merge } from 'lodash';
import Container from 'typedi';
import { Document } from '../src/db/interface';
import { dbName } from '../src/db_init/util';
import { ConfigToken, DBConnectorToken } from '../src/di_tokens';
import { delay } from '../src/utils';

function testDbName(alias: string): string {
    return dbName(Container.get(ConfigToken), alias);
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

export function saveModel(model: any) {
    const modelsDb = Container.get(DBConnectorToken).use(testDbName('models'));
    return modelsDb.put(model);
}

export async function createModel(id?: string, fields?: any): Promise<Document> {
    const model = createModelObj(id, fields);
    await saveModel(model);
    return model;
}

export function getModel(id: string, dbAlias: string = 'models') {
    const modelsDb = Container.get(DBConnectorToken).use(testDbName(dbAlias));
    return modelsDb.getOrNull(id);
}

// Waits until model with given timestamp will be generated
export async function getModelAtTimestamp(id: string,
                                          timestamp: number, dbAlias: string = 'models') {
    while (true) {
        const model = await getModel(id, dbAlias);
        if (model && 'timestamp' in model && model.timestamp == timestamp)
            return model;
        await delay(10);
    }
}

export function getModelVariants(id: string,
                                 aliases: string[] = ['models', 'workingModels', 'defaultViewModels']) {
    const pending = aliases.map((alias) => getModel(id, alias));
    return Promise.all(pending);
}

export function getModelVariantsAtTimestamp(id: string, timestamp: number,
                                            aliases: string[] = ['models', 'workingModels', 'defaultViewModels']) {
    const pending = aliases.map((alias) => getModelAtTimestamp(id, timestamp, alias));
    return Promise.all(pending);
}

export function pushEvent(event: Event) {
    const eventsDb = Container.get(DBConnectorToken).use(testDbName('events'));
    return eventsDb.put(event);
}

export async function pushRefreshEvent(characterId: string, timestamp: number) {
    const metadataDb = Container.get(ConfigToken).db.metadata;
    if (metadataDb) {
        const metadata: any = await Container.get(DBConnectorToken).use(metadataDb).getOrNull(characterId)
            || { _id: characterId };
        metadata.scheduledUpdateTimestamp = timestamp;
        await Container.get(DBConnectorToken).use(metadataDb).put(metadata);
    } else {
        await pushEvent({
            characterId,
            timestamp,
            eventType: '_RefreshModel',
        });
    }
}

export function saveObject(dbAlias: string, doc: any) {
    const db = Container.get(DBConnectorToken).use(testDbName(dbAlias));
    return db.put(doc);
}

export function getObject(dbAlias: string, id: string) {
    const db = Container.get(DBConnectorToken).use(testDbName(dbAlias));
    return db.getOrNull(id);
}
