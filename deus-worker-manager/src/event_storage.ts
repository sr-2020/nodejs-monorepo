import { pick, merge } from 'lodash';
import { Event, SyncEvent } from 'deus-engine-manager-api';

import { DBInterface, Document } from './db/interface';

export class EventStorage {
    constructor(private db: DBInterface) { }

    async range(characterId: string, since: number, till: number): Promise<Document[]> {
        if (since >= till) return [];

        const startkey = [characterId, Number(since)];
        const endkey = [characterId, Number(till)];
        const params = {
            startkey,
            endkey,
            reduce: false,
            include_docs: true,
            inclusive_end: true
        };

        let result = await this.db.view('character', 'by-character-id', params);

        return result.rows.map((r: any) => r.doc);
    }

    async lastRefresh(characterId: string): Promise<SyncEvent | null> {
        let result = await this.db.view('character', 'last-refresh-event', { key: characterId, reduce: true });

        if (result.rows.length) {
            return result.rows[0].value;
        } else {
            return null;
        }
    }

    async listLastRefresh(params?: any): Promise<SyncEvent[]> {
        params = merge({}, params, { reduce: true, group: true });
        let result = await this.db.view('character', 'last-refresh-event', params);
        console.log('>>>', result, params);
        return result.rows.map((r) => r.value);
    }

    store(event: any) {
        event.timestamp = Number(event.timestamp);
        return this.db.put(event);
    }
}
