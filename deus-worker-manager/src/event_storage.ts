import { DBInterface } from './db/interface';

export default class EventStorage {
    constructor(private db: DBInterface) { }

    async range(characterId: string, since: number, till: number) {
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
}
