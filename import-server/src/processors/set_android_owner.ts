import * as Pouch from 'pouchdb';
import { MapperInterface } from './mapper';
import { config } from '../config';

async function findModel(db: any, id: string): Promise<any> {
    if (id && id.match(/^\d+$/)) {
        try {
            return db.get(id);
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log('non-number id: ', id);
    }

    return null;
}

export default class SetAndroidOwner implements MapperInterface {
    private db: PouchDB.Database;

    constructor() {
        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password
            }
        };

        this.db = new Pouch(`${config.url}${config.modelDBName}`, ajaxOpts);
    }

    filter(doc) {
        return doc.inGame && doc.profileType == 'robot';
    }

    async map(doc) {
        try {
            const owner = await findModel(this.db, doc.owner);
            const creator = await findModel(this.db, doc.creator);

            if (owner) {
                doc.ownerId = owner._id;
                doc.owner = owner.firstName + ' ' + owner.lastName;
            }

            if (creator) {
                doc.creatorId = creator._id;
                doc.creator = creator.firstName + ' ' + creator.lastName;
            }

            await this.db.put(doc);
        } catch (e) {
            console.log(e);
        }

        console.log('--', doc._id, doc.ownerId, doc.owner, doc.creatorId, doc.creator);
    }
}
