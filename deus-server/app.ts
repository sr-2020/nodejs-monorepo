import * as express from 'express'
import * as http from 'http'
import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert'
PouchDB.plugin(PouchDBUpsert);

import bodyparser = require('body-parser')
import { TSMap } from "typescript-map"

import { Connection, StatusAndBody } from "./connection";

class App {
  private app: express.Express = express();
  private server: http.Server;
  private connections = new TSMap<string, Connection>();

  constructor(private eventsDb: PouchDB.Database<{}>,
    private viewmodelDb: PouchDB.Database<any>,
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
      if (this.connections.has(id)) {
        res.status(429).send("Multiple connections from one client are not allowed");
        return;
      }

      const events = req.body.events;
      if (!(events instanceof Array)) {
        res.status(400).send("No events array in request");
        return;
      }

      this.connections.set(id, new Connection(this.eventsDb, this.viewmodelDb, this.timeout, this.latestExistingEventTimestamp()));
      this.connections.get(id).processEvents(id, events).then((s: StatusAndBody) => {
        res.status(s.status).send(s.body);
        this.connections.delete(id);
      });
    });

    this.viewmodelDb.putIfNotExists({
      _id: "_design/web_api_server",
      views: {
        by_character_id: {
          map: "function (doc) { if (doc.timestamp && doc.characterId) emit([doc.characterId, doc.timestamp]);  }"
        }
      }
    });

    this.viewmodelDb.changes({ since: 'now', live: true, include_docs: true }).on('change', change => {
      if (!change.doc)
        return;

      if (this.connections.has(change.doc._id))
        this.connections.get(change.doc._id).onViewModelUpdate(change.doc);
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