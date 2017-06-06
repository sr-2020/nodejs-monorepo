import * as express from 'express'
import * as http from 'http'
import * as PouchDB from 'pouchdb';
import bodyparser = require('body-parser')
import * as Promise from 'promise'

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor(private eventsDb: PouchDB.Database<{}>,
    private viewmodelDb: PouchDB.Database<{}>) {
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

      const filterTimestamp = this.latestAcceptedEventTimestamp();
      events.filter((value: any) => value.timestamp > filterTimestamp);

      events.reduce((p, event) => {
        p.then(() => {
          let eventWithCharId = event;
          eventWithCharId.characterId = id;
          return eventsDb.post(eventWithCharId);
        });
      }, Promise.resolve({}));

      res.send({});
    })

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