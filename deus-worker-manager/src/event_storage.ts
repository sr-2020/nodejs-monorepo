import { NanoDocument } from 'nano';
import { stdCallback } from './utils';

export default class EventStorage {
    constructor(private db: NanoDocument) { }

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

        console.log('>>> range');

        let result: any = await new Promise((resolve, reject) => {
            this.db.view('character', 'by-character-id', params, stdCallback(resolve, reject));
        });

        console.log('>>> range', result);

        return result.rows.map((r: any) => r.doc);
    }
}
