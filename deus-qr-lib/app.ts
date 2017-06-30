import * as express from 'express'
import * as http from 'http'

import bodyparser = require('body-parser')
import { TSMap } from "typescript-map"
import { QrData, encode, decode } from "./qr";
import { QrType } from "./qr.type";


function QrDataFromQuery(query: any): QrData {
  if (typeof query.type == 'string')
    query.type = QrType[query.type];
  return query;
}

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
        const data = QrDataFromQuery(req.query);
        res.send({ content: encode(data) });
      }
      catch (e) {
        console.warn('exception in /encode: ', e);
        res.status(400).send('Wrong data format');
      }
    })

    this.app.get('/encode_to_image', (req, res) => {
      try {
        const data = QrDataFromQuery(req.query);
        console.log(JSON.stringify(data));
        if (!data.validUntil)
          data.validUntil = new Date().valueOf() / 1000 + 300 /* valid for 5 minutes from now */;
        res.redirect(
          `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${encode(data)}&qzone=10&margin=3&size=400x400&ecc=L`
        );
      }
      catch (e) {
        console.warn('exception in /encode: ', e);
        res.status(400).send('Wrong data format');
      }
    })

    this.app.get('/decode', (req, res) => {
      try {
        const decoded: any = decode(req.query.content)
        decoded.type = QrType[decoded.type];
        res.send(decoded);
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