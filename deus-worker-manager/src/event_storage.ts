import { pick } from 'lodash';
import { Event } from 'deus-engine-manager-api';

import { DBInterface, Document } from './db/interface';

export class EventStorage {
    constructor(private db: DBInterface) { }

    async range(characterId: string, since: number, till: number): Promise<Document[]> {
        if (since >= till) return [];

        const startkey = [characterId, since];
        const endkey = [characterId, till];
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

    store(event: any) {
        return this.db.put(event);
    }
}
