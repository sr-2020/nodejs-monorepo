import * as express from 'express'
import * as http from 'http'
import * as PouchDB from 'pouchdb';

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor() {
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    this.app.get('/time', (req, res) => {
      const currentTimestamp = new Date().valueOf();
      res.send({time: currentTimestamp});
    })
  }

  listen(port: number) {
    this.server = this.app.listen(port);
  }

  stop() {
    this.server.close();
  }
}


export default App;