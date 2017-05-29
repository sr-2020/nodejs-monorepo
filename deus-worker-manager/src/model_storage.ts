import { NanoDocument } from 'nano';
import { stdCallback } from './utils';

export default class ModelStorage {
    constructor(private db: NanoDocument) { };

    async find(id: number | string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(String(id), {}, stdCallback(resolve, reject))
        });
    }

    async store(doc: any, id?: number | string) {
        if (id) {
            doc._id = id;
        }

        if (!doc._rev) {
            try {
                let stored: any = await new Promise((resolve, reject) => this.db.get(doc._id, {}, stdCallback(resolve, reject)));
                if (stored) {
                    doc._rev = stored._rev;
                }
            } catch (e) { }
        }

        return new Promise((resolve, reject) => {
            this.db.insert(doc, {}, stdCallback(resolve, reject));
        });
    }
}
