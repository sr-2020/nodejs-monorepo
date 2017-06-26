import * as express from 'express'
import * as http from 'http'
import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert'
PouchDB.plugin(PouchDBUpsert);

import bodyparser = require('body-parser')
import { TSMap } from "typescript-map"

import * as basic_auth from 'basic-auth';

import { Connection, StatusAndBody } from "./connection";

function IsDocumentNotFoundError(e): Boolean {
  return e.status && e.status == 404 && e.reason && e.reason == "missing";
}

class App {
  private app: express.Express = express();
  private server: http.Server;
  private connections = new TSMap<string, Connection>();

  constructor(private eventsDb: PouchDB.Database<any>,
    private viewmodelDbs: TSMap<string, PouchDB.Database<{ timestamp: number }>>,
    private accountsDb: PouchDB.Database<{ password: string }>,
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

    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Headers',
        res.getHeader('Access-Control-Allow-Headers') + ', Authorization');
      next();
    });

    const auth = async (req, res, next) => {
      const id: string = req.params.id;
      const credentials = basic_auth(req);
      if (credentials && credentials.name == id) {
        try {
          const password = (await this.accountsDb.get(id)).password;
          if (password == credentials.pass) {
            return next();
          }
        }
        catch (e) {
          if (IsDocumentNotFoundError(e)) {
            res.status(404).send("Character with such id is not found");
            return;
          }
        }
      }
      res.header('WWW-Authentificate', 'Basic');
      res.status(401).send('Access denied');
    };

    this.app.get('/viewmodel/:id', auth, async (req, res) => {
      const id: string = req.params.id;
      const type = req.query.type ? req.query.type : 'default';
      let db = this.viewmodelDbs.get(type);
      if (!db) {
        res.status(404).send('Viewmodel type is not found');
      }
      else {
        try {
          const doc = (await db.get(id));
          delete doc._id;
          delete doc._rev;
          res.send({
            serverTime: this.currentTimestamp(),
            id: id,
            viewModel: doc
          })
        } catch (e) {
        if (IsDocumentNotFoundError(e))
          res.status(404).send("Character with such id is not found");
        else
          throw e;
        }
      }
    })

    this.app.post('/events/:id', auth, async (req, res) => {
      const id: string = req.params.id;
      if (this.connections.has(id)) {
        res.status(429).send("Multiple connections from one client are not allowed");
        return;
      }

      let events = req.body.events;
      if (!(events instanceof Array)) {
        res.status(400).send("No events array in request");
        return;
      }

      const isMobileClient = events.some(event => event.eventType == '_RefreshModel');
      if (isMobileClient)
        events.forEach(event => event.mobile = true);

      try {
        const cutTimestamp = await this.cutTimestamp(id);
        if (!isMobileClient && events.some(event => event.timestamp <= cutTimestamp)) {
          res.status(409).send("Can't accept event with timestamp earlier than cut timestamp");
          return;
        }
        events = events.filter((value: any) => value.timestamp > cutTimestamp);

        if (isMobileClient) {
          this.connections.set(id, new Connection(this.eventsDb, this.timeout));
          this.connections.get(id).processEvents(id, events).then((s: StatusAndBody) => {
            res.status(s.status).send(s.body);
            this.connections.delete(id);
          });
        } else {
          // In this case we don't need to subscribe for viewmodel updates or
          // block other clients from connecting.
          // So we don't Connetion to this.connections.
          let connection = new Connection(this.eventsDb, 0);
          connection.processEvents(id, events).then((s: StatusAndBody) => {
            res.status(s.status).send(s.body);
          });
        }
      } catch (e) {
        if (IsDocumentNotFoundError(e))
          res.status(404).send("Character with such id is not found");
        else
          throw e;
      }
    });

    this.app.get('/events/:id', auth, async (req, res) => {
      const id: string = req.params.id;

      try {
        let response = {
          serverTime: this.currentTimestamp(),
          id: id,
          timestamp: await this.cutTimestamp(id)
        };
        res.status(200).send(response);
      } catch (e) {
        if (IsDocumentNotFoundError(e))
          res.status(404).send("Character with such id is not found");
        else
          throw e;
      }
    });

    this.mobileViewmodelDb().changes({ since: 'now', live: true, include_docs: true })
      .on('change', change => {
        if (!change.doc)
          return;

        if (this.connections.has(change.doc._id))
          this.connections.get(change.doc._id).onViewModelUpdate(change.doc);
      });
  }

  currentTimestamp(): number {
    return new Date().valueOf();
  }

  private mobileViewmodelDb() { return this.viewmodelDbs.get('mobile'); }

  async cutTimestamp(id: string): Promise<number> {
    const currentViewmodel = await this.mobileViewmodelDb().get(id);
    const lastEventTimeStamp = await this.latestExistingMobileEventTimestamp(id);
    return Math.max(currentViewmodel.timestamp, lastEventTimeStamp);
  }

  async latestExistingMobileEventTimestamp(id: string): Promise<number> {
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