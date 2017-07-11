import * as express from 'express';
import * as addRequestId from 'express-request-id';
import * as http from 'http';
import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import bodyparser = require('body-parser');
import { TSMap } from 'typescript-map';
import * as winston from 'winston';

import * as basic_auth from 'basic-auth';

import { Connection, StatusAndBody } from './connection';

function IsDocumentNotFoundError(e): boolean {
  return e.status && e.status == 404 && e.reason && e.reason == 'missing';
}

function RequestId(req: express.Request): string {
  return (req as any).id;
}

class App {
  private app: express.Express = express();
  private server: http.Server;
  private connections = new TSMap<string, Connection>();

  constructor(private logger: winston.LoggerInstance,
              private eventsDb: PouchDB.Database<any>,
              private viewmodelDbs: TSMap<string, PouchDB.Database<{ timestamp: number }>>,
              private accountsDb: PouchDB.Database<{ password: string }>,
              private timeout: number) {
    this.app.use(bodyparser.json());
    this.app.use(addRequestId());

    this.app.use((req, res, next) => {
      this.logger.info('Accepted new request', {
        id: RequestId(req),
        timestamp: this.currentTimestamp(),
        url: req.url,
        method: req.method,
        ip: req.ip,
      });
      this.logger.debug('Request body', { id: RequestId(req), body: req.body });

      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    this.app.get('/time', (_req, res) => {
      res.send({ serverTime: this.currentTimestamp() });
    });

    this.app.use((_req, res, next) => {
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
            this.logger.info(`Authorised user: ${id}`, {id: RequestId(req)});
            return next();
          }
        } catch (e) {
          if (IsDocumentNotFoundError(e)) {
            this.logAndSendResponse(req, res, 404, 'Character with such id is not found');
            return;
          }
        }
      }
      res.header('WWW-Authentificate', 'Basic');
      this.logAndSendResponse(req, res, 401, 'Access denied');
    };

    this.app.get('/viewmodel/:id', auth, async (req, res) => {
      const id: string = req.params.id;
      const type = req.query.type ? req.query.type : 'default';
      const db = this.viewmodelDbs.get(type);
      if (!db) {
        this.logAndSendResponse(req, res, 404, 'Viewmodel type is not found');
      } else {
        try {
          const doc = (await db.get(id));
          delete doc._id;
          delete doc._rev;
          res.send({
            serverTime: this.currentTimestamp(),
            // tslint:disable-next-line:object-literal-shorthand
            id: id,
            viewModel: doc,
          });
        } catch (e) {
          this.returnCharacterNotFoundOrRethrow(e, req, res);
        }
      }
    });

    this.app.post('/events/:id', auth, async (req, res) => {
      const id: string = req.params.id;
      if (this.connections.has(id)) {
        this.logAndSendResponse(req, res, 429, 'Multiple connections from one client are not allowed');
        return;
      }

      let events = req.body.events;
      if (!(events instanceof Array)) {
        this.logAndSendResponse(req, res, 400, 'No events array in request');
        return;
      }

      const eventTypes: string[] = events.map((event) => event.eventType);
      this.logger.info('Received events with types', {id: RequestId(req), eventTypes });

      const isMobileClient = eventTypes.some((eventType) => eventType == '_RefreshModel');
      if (isMobileClient)
        events.forEach((event) => event.mobile = true);

      try {
        const cutTimestamp = await this.cutTimestamp(id);
        if (!isMobileClient && events.some((event) => event.timestamp <= cutTimestamp)) {
          this.logAndSendResponse(req, res, 409, "Can't accept event with timestamp earlier than cut timestamp");
          return;
        }
        events = events.filter((value: any) => value.timestamp > cutTimestamp);

        if (isMobileClient) {
          this.connections.set(id, new Connection(this.eventsDb, this.timeout));
          this.connections.get(id).processEvents(id, events).then((s: StatusAndBody) => {
            this.logStatus(req, s.status);
            res.status(s.status).send(s.body);
            this.connections.delete(id);
          });
        } else {
          // In this case we don't need to subscribe for viewmodel updates or
          // block other clients from connecting.
          // So we don't add Connection to this.connections.
          const connection = new Connection(this.eventsDb, 0);
          connection.processEvents(id, events).then((s: StatusAndBody) => {
            this.logStatus(req, s.status);
            res.status(s.status).send(s.body);
          });
        }
      } catch (e) {
        this.returnCharacterNotFoundOrRethrow(e, req, res);
      }
    });

    this.app.get('/events/:id', auth, async (req, res) => {
      const id: string = req.params.id;

      try {
        const response = {
          serverTime: this.currentTimestamp(),
          id,
          timestamp: await this.cutTimestamp(id),
        };
        res.status(200).send(response);
      } catch (e) {
        this.returnCharacterNotFoundOrRethrow(e, req, res);
      }
    });

    this.mobileViewmodelDb().changes({ since: 'now', live: true, include_docs: true })
      .on('change', (change) => {
        if (!change.doc)
          return;

        if (this.connections.has(change.doc._id))
          this.connections.get(change.doc._id).onViewModelUpdate(change.doc);
      });
  }

  public async listen(port: number) {
    try {
      await this.eventsDb.putIfNotExists({
        _id: '_design/web_api_server_v2',
        views: {
          characterId_timestamp_mobile: {
            // tslint:disable-next-line:max-line-length
            map: 'function (doc) { if (doc.timestamp && doc.characterId && doc.mobile) emit([doc.characterId, doc.timestamp]);  }',
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
    this.server = this.app.listen(port);
  }

  public stop() {
    this.server.close();
  }

  private currentTimestamp(): number {
    return new Date().valueOf();
  }

  private mobileViewmodelDb() { return this.viewmodelDbs.get('mobile'); }

  private async cutTimestamp(id: string): Promise<number> {
    const currentViewmodel = await this.mobileViewmodelDb().get(id);
    const lastEventTimeStamp = await this.latestExistingMobileEventTimestamp(id);
    return Math.max(currentViewmodel.timestamp, lastEventTimeStamp);
  }

  private async latestExistingMobileEventTimestamp(id: string): Promise<number> {
    const docs = await this.eventsDb.query<any>('web_api_server_v2/characterId_timestamp_mobile',
      { include_docs: true, descending: true, endkey: [id], startkey: [id, {}], limit: 1 });
    return docs.rows.length ? docs.rows[0].doc.timestamp : 0;
  }

  private returnCharacterNotFoundOrRethrow(e: any, req: express.Request, res: express.Response) {
  if (IsDocumentNotFoundError(e))
    this.logAndSendResponse(req, res, 404, 'Character with such id is not found');
  else
    throw e;
  }

  private logAndSendResponse(req: express.Request, res: express.Response, status: number, msg: string) {
    this.logger.info(`Sending response with status ${status} and message ${msg}`,
      { id: RequestId(req), status, msg, timestamp: this.currentTimestamp() });
    res.status(status).send(msg);
  }

  private logStatus(req: express.Request, status: number) {
    this.logger.info(`Sending response with status ${status}`,
      { id: RequestId(req), status, timestamp: this.currentTimestamp() });
  }

}

export default App;
