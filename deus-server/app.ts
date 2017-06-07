import * as express from 'express'
import * as http from 'http'
import * as PouchDB from 'pouchdb';
import bodyparser = require('body-parser')
import * as Promise from 'promise'

class StatusAndBody {
  public status: number;
  public body: any;
}

const race = (...promises) =>
  new Promise((res, rej) => {
    promises.forEach(p => p.then(v => res(v)).catch(err => rej(err)));
  });

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor(private eventsDb: PouchDB.Database<{}>,
    private viewmodelDb: PouchDB.Database<{ timestamp: number }>,
    private timeout: number) {
    this.app.use(bodyparser.json());
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    this.app.get('/time', (req, res) => {
      res.send({ serverTime: this.currentTimestamp() });
    })

    this.app.get('/viewmodel/:id', (req, res) => {
      const id: string = req.params.id;
      this.viewmodelDb.get(id)
        .then(doc => {
          delete doc._id;
          delete doc._rev;
          res.send({
            serverTime: this.currentTimestamp(),
            id: id,
            viewModel: doc
          })
        })
        .catch(err => res.status(404).send("Character with such id is not found"));
    })

    this.app.post('/events/:id', (req, res) => {
      const id: string = req.params.id;
      this.viewmodelDb.get(id)
        .then(() => {
          const events = req.body.events;
          if (!(events instanceof Array)) {
            res.status(400).send("No events array in request");
            return;
          }

          const filterTimestamp = this.latestAcceptedEventTimestamp();
          events.filter((value: any) => value.timestamp > filterTimestamp);

          if (events.length == 0) {
            res.status(202).send({
              serverTime: this.currentTimestamp(),
              id: id,
            });
          }
          else {
            const lastEventTimestamp = events[events.length - 1].timestamp;
            let timeoutResponse = this.putEventsInDb(id, events)
              .then(() => this.refreshModelTimeoutResponse(lastEventTimestamp));
            let successRefreshResponse = this.refreshModelUpdatedResponse(id, lastEventTimestamp);
            race(timeoutResponse, successRefreshResponse).then((statusAndBody: any) => {
              statusAndBody.body.id = id;
              statusAndBody.body.serverTime = this.currentTimestamp();
              res.status(statusAndBody.status).send(statusAndBody.body)
            })
          }
        })
        .catch(err => res.status(404).send("Character with such id is not found"));
    });
  }

  refreshModelTimeoutResponse(lastEventTimestamp: number): Promise<StatusAndBody> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ status: 202, body: { timestamp: lastEventTimestamp } });
      }, this.timeout);
    });
  }

  putEventsInDb(id: string, events: Array<any>): Promise<any> {
    return events.reduce((p, event) => {
      return p.then(() => {
        let eventWithCharId = event;
        eventWithCharId.characterId = id;
        return this.eventsDb.post(eventWithCharId);
      });
    }, Promise.resolve({}));
  }

  refreshModelUpdatedResponse(id: string, lastEventTimestamp: number): Promise<StatusAndBody> {
    return new Promise((resolve, reject) => {
      this.viewmodelDb.changes({ since: 'now', live: true, include_docs: true, doc_ids: [id] }).on('change', change => {
        if (change.doc && change.doc.timestamp == lastEventTimestamp) {
          delete change.doc._id;
          delete change.doc._rev;
          resolve({ status: 200, body: { viewModel: change.doc } });
        }
      });
    });
  }

  currentTimestamp(): number {
    return new Date().valueOf();
  }

  latestAcceptedEventTimestamp(): number {
    return 0;
  }

  listen(port: number) {
    this.server = this.app.listen(port);
  }

  stop() {
    this.server.close();
  }
}


export default App;