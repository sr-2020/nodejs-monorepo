import { Event, ModelMetadata } from 'alice-model-engine-api';
import { merge } from 'lodash';
import { ContainerInstance } from '../node_modules/typedi';
import { Config } from '../src/config';
import { Document } from '../src/db/interface';
import { dbName } from '../src/db_init/util';
import { ConfigToken, DBConnectorToken } from '../src/di_tokens';
import { delay } from '../src/utils';

function testDbName(di: ContainerInstance, alias: string): string {
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

export function saveModel(di: ContainerInstance, model: any) {
    const modelsDb = di.get(DBConnectorToken).use(testDbName(di, 'models'));
    return modelsDb.put(model);
}

export async function createModel(di: ContainerInstance, id?: string, fields?: any): Promise<Document> {
    const model = createModelObj(id, fields);
    await saveModel(di, model);
    return model;
}

export function getModel(di: ContainerInstance, id: string, dbAlias: string = 'models') {
    const modelsDb = di.get(DBConnectorToken).use(testDbName(di, dbAlias));
    return modelsDb.getOrNull(id);
}

// Waits until model with given timestamp will be generated
export async function getModelAtTimestamp(di: ContainerInstance, id: string,
                                          timestamp: number, dbAlias: string = 'models') {
    while (true) {
        const model = await getModel(di, id, dbAlias);
        if (model && 'timestamp' in model && model.timestamp == timestamp)
            return model;
        await delay(10);
    }
}

export function getModelVariants(di: ContainerInstance, id: string,
                                 aliases: string[] = ['models', 'workingModels', 'defaultViewModels']) {
    const pending = aliases.map((alias) => getModel(di, id, alias));
    return Promise.all(pending);
}

export function getModelVariantsAtTimestamp(di: ContainerInstance, id: string, timestamp: number,
                                            aliases: string[] = ['models', 'workingModels', 'defaultViewModels']) {
    const pending = aliases.map((alias) => getModelAtTimestamp(di, id, timestamp, alias));
    return Promise.all(pending);
}

export function pushEvent(di: ContainerInstance, event: Event) {
    const eventsDb = di.get(DBConnectorToken).use(testDbName(di, 'events'));
    return eventsDb.put(event);
}

export async function pushRefreshEvent(di: ContainerInstance, characterId: string, timestamp: number) {
    const metadataDb = di.get(ConfigToken).db.metadata;
    if (metadataDb) {
        const metadata: any = await di.get(DBConnectorToken).use(metadataDb).getOrNull(characterId)
            || { _id: characterId };
        metadata.scheduledUpdateTimestamp = timestamp;
        await di.get(DBConnectorToken).use(metadataDb).put(metadata);
    } else {
        await pushEvent(di, {
            characterId,
            timestamp,
            eventType: '_RefreshModel',
        });
    }
}

export function saveObject(di: ContainerInstance, dbAlias: string, doc: any) {
    const db = di.get(DBConnectorToken).use(testDbName(di, dbAlias));
    return db.put(doc);
}

export function getObject(di: ContainerInstance, dbAlias: string, id: string) {
    const db = di.get(DBConnectorToken).use(testDbName(di, dbAlias));
    return db.getOrNull(id);
}
