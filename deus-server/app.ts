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

  constructor(private eventsDb: PouchDB.Database<any>,
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

    this.app.post('/events/:id', async (req, res) => {
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

      try {
        const lastTimestamp = await this.latestTimestamp(id);
        this.connections.set(id, new Connection(this.eventsDb, this.viewmodelDb, this.timeout, lastTimestamp));
        this.connections.get(id).processEvents(id, events).then((s: StatusAndBody) => {
          res.status(s.status).send(s.body);
          this.connections.delete(id);
        });
      } catch (e) {
        if (e.status && e.status == 404 && e.reason && e.reason == "missing")
          res.status(404).send("Character with such id is not found");
        else
          throw e;
      }
    });

    this.app.get('/events/:id', async (req, res) => {
      const id: string = req.params.id;

      try {
        let response = {
          serverTime: this.currentTimestamp(),
          id: id,
          timestamp: await this.latestTimestamp(id)
        };
        res.status(200).send(response);
      } catch (e) {
        if (e.status && e.status == 404 && e.reason && e.reason == "missing")
          res.status(404).send("Character with such id is not found");
        else
          throw e;
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

  async latestTimestamp(id: string): Promise<number> {
    const currentViewmodel = await this.viewmodelDb.get(id);
    const lastEventTimeStamp = await this.latestExistingEventTimestamp(id);
    return Math.max(currentViewmodel.timestamp, lastEventTimeStamp);
  }

  async latestExistingEventTimestamp(id: string): Promise<number> {
    const docs = await this.eventsDb.query<any>('web_api_server_v2/characterId_timestamp_mobile',
      { include_docs: true, descending: true, endkey: [id], startkey: [id, {}], limit: 1 });
    return docs.rows.length ? docs.rows[0].doc.timestamp : 0;
  }

  async listen(port: number) {
    try {
      await this.eventsDb.putIfNotExists({
        _id: "_design/web_api_server_v2",
        views: {
          characterId_timestamp_mobile: {
            map: "function (doc) { if (doc.timestamp && doc.characterId && doc.mobile) emit([doc.characterId, doc.timestamp]);  }"
          }
        }
      })
    } catch (err) {
      console.error(err);
    }
    this.server = this.app.listen(port);
  }

  stop() {
    this.server.close();
  }
}


export default App;