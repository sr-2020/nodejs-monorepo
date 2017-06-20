import * as express from 'express'
import * as http from 'http'

import bodyparser = require('body-parser')
import { TSMap } from "typescript-map"
import { QrData, encode, decode } from "./qr";

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor() {
    this.app.use(bodyparser.json());
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    this.app.get('/encode', (req, res) => {
      try {
        const data: QrData = req.query;
        res.send({ content: encode(data) });
      }
      catch (e) {
        console.warn('exception in /encode: ', e);
        res.status(400).send('Wrong data format');
      }
    })

    this.app.get('/encode_to_image', (req, res) => {
      try {
        const data: QrData = req.query;
        res.redirect(
          `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${encode(data)}&qzone=1&margin=3&size=400x400&ecc=L`
        );
      }
      catch (e) {
        console.warn('exception in /encode: ', e);
        res.status(400).send('Wrong data format');
      }
    })

    this.app.get('/decode', (req, res) => {
      try {
        res.send(decode(req.query.content));
      }
      catch (e) {
        console.warn('exception in /decode: ', e);
        res.status(400).send('Wrong data format');
      }
    })
  }

  listen(port: number) {
    this.server = this.app.listen(port);
  }
}

export default App;