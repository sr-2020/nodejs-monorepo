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
        return new Promise((resolve, reject) => {
            if (id) {
                doc._id = id;
            }

            this.db.insert(doc, {}, stdCallback(resolve, reject));
        });
    }
}
