import * as express from 'express'
import * as http from 'http'
import * as PouchDB from 'pouchdb';
import bodyparser = require('body-parser')
import { Connection, StatusAndBody } from "./connection";


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
      const events = req.body.events;
      if (!(events instanceof Array)) {
        res.status(400).send("No events array in request");
        return;
      }

      let connection = new Connection(this.eventsDb, this.viewmodelDb, this.timeout, this.latestExistingEventTimestamp());
      connection.processEvents(id, events).then((s: StatusAndBody) => {
        res.status(s.status).send(s.body);
      });
    });
  }

  refreshModelTimeoutResponse(lastEventTimestamp: number): Promise<StatusAndBody> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ status: 202, body: { timestamp: lastEventTimestamp } });
      }, this.timeout);
    });
  }

  currentTimestamp(): number {
    return new Date().valueOf();
  }

  latestExistingEventTimestamp(): number {
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