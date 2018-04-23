import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

export async function createViews(
  accountsDb: PouchDB.Database<any>,
  mobileViewmodelDb: PouchDB.Database<any>,
  eventsDb: PouchDB.Database<any>) {
  await eventsDb.put({
    _id: '_design/character',
    views: {
      'refresh-events': {
        // tslint:disable-next-line:max-line-length
        map: "function (doc) { if (doc.timestamp && doc.characterId && doc.eventType == '_RefreshModel') emit([doc.characterId, doc.timestamp]);  }",
      },
    },
  });

  await accountsDb.upsert('_design/account', () => {
    return {
      _id: '_design/account',
      views: {
        'by-login': {
          // tslint:disable-next-line:max-line-length
          map: 'function (doc) { if (doc.login) emit(doc.login);  }',
        },
        'by-push-token': {
          // tslint:disable-next-line:max-line-length
          map: 'function (doc) { if (doc.pushToken) emit(doc.pushToken);  }',
        },
      },
    };
  });

  await mobileViewmodelDb.upsert('_design/viewmodel', () => {
    return {
      _id: '_design/viewmodel',
      views: {
        'by-timestamp': {
          map: 'function (doc) { if (doc.timestamp) emit(doc.timestamp);  }',
        },
      },
    };
  });
}
