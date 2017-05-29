import * as path from 'path';
import * as meow from 'meow';
import { Nano, NanoDatabase, NanoDocument } from 'nano';
import * as nano from 'nano';
import * as glob from 'glob';
import * as Path from 'path';
import { stdCallback } from '../utils';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config>
`);

if (!cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;

const config = require(CONFIG_PATH);

const connection = nano(config.db.url);

const dbs: { [key: string]: string } = {
    models: config.db.models,
    events: config.db.events
};

function deepToString(doc: any) {
    let result: any = {};

    for (let k in doc) {
        switch (typeof (doc[k])) {
            case 'function':
                result[k] = doc[k].toString();
            case 'object':
                result[k] = deepToString(doc[k]);
            default:
                result[k] = doc[k];
        }
    }

    return result;
}

const designDocs = glob.sync(Path.join(__dirname, 'design_docs', '*.js'))
    .map((f) => Path.basename(f, Path.extname(f)));

const createDbs = () => {
    return (Object as any).values(dbs).map((db: string) => {
        return new Promise((resolve, reject) => {
            connection.db.create(db, (err, res) => {
                if (!err) {
                    console.log('Db created:', db);
                } else if (err.statusCode != 412) {
                    console.log(err);
                }
                resolve();
            })
        })
    })
};

async function getOrNull(db: NanoDocument, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(id, {}, (err: any, data: any) => {
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
}

async function put(db: NanoDocument, doc: any) {
    return new Promise((resolve, reject) => {
        db.insert(doc, {}, stdCallback(resolve, reject));
    })
}

const createViews = () => {
    return designDocs.map(async (docName) => {
        let dd = deepToString(require('./design_docs/' + docName));
        dd._id = `_design/${docName}`;

        let dbNames = dd.dbs;
        delete (dd.dbs);

        if (typeof dd.version == 'undefined') console.log("Warning: no version in #{dd._id}");

        try {
            let pending = dbNames.map(async (dbName: string) => {
                let db = connection.use(dbs[dbName]);

                let stored = await getOrNull(db, dd._id);
                if (stored && stored.version >= dd.version) {
                    console.log('Not modified:', dbName, dd._id);
                    return;
                }

                if (stored) {
                    dd._rev = stored._rev;
                }

                await put(db, dd);

                delete dd._rev;

                console.log("Updated:", dbName, dd._id);
            });

            return Promise.all(pending);
        } catch (e) {
            console.log("Error:", e);
        }
    });
};

Promise.all(createDbs()).then(createViews);
