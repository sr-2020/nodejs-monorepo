import * as basic_auth from 'basic-auth';
import * as express from 'express'
import * as http from 'http'

import bodyparser = require('body-parser')
import { TSMap } from "typescript-map"
import { QrData, encode, decode } from "./qr";
import { QrType } from "./qr.type";


function QrDataFromQuery(query: any): QrData {
  if (/^[0-9]*$/.test(query.type)) {
    query.type = Number(query.type);
  }
  else {
    query.type = QrType[query.type];
  }
  return query;
}

class App {
  private app: express.Express = express();
  private server: http.Server;

  constructor(private _user: string, private _password: string) {
    this.app.use(bodyparser.json());
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });

    this.app.get('/decode', (req, res) => {
      try {
        const decoded: any = decode(req.query.content)
        res.send(decoded);
      }
      catch (e) {
        console.warn('exception in /decode: ', e);
        res.status(400).send('Wrong data format');
      }
    })

    this.app.get('/encode_bill', (req, res) => {
      try {
        const receiver: string = req.query.receiver;
        const amount: string = req.query.amount;
        const comment: string = req.query.comment;
        const content = encode({type: QrType.Bill, kind: 0, validUntil: 1700000000,
          payload: [receiver, amount, comment].join(',')});
        res.redirect(
          `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${content}&qzone=10&margin=1&size=300x300&ecc=L`
        );
      }
      catch (e) {
        console.warn('exception in /encode_bill: ', e);
        res.status(400).send('Wrong data format');
      }
    });

    const auth = (req: express.Request, res: express.Response, next: any) => {
      if (!this._user)
        return next();
      const credentials = basic_auth(req);
      if (credentials && credentials.name == this._user && credentials.pass == this._password) {
        return next();
      }
      res.header('WWW-Authentificate', 'Basic');
      res.status(401).send('Access denied');
    }

    this.app.get('/encode', auth, (req, res) => {
      try {
        const data = QrDataFromQuery(req.query);
        res.send({ content: encode(data) });
      }
      catch (e) {
        console.warn('exception in /encode: ', e);
        res.status(400).send('Wrong data format');
      }
    })

    this.app.get('/encode_to_image', auth, (req, res) => {
      try {
        const data = QrDataFromQuery(req.query);
        console.log(JSON.stringify(data));
        if (!data.validUntil)
          data.validUntil = new Date().valueOf() / 1000 + 300 /* valid for 5 minutes from now */;
        res.redirect(
          `http://api.qrserver.com/v1/create-qr-code/?color=000000&bgcolor=FFFFFF&data=${encode(data)}&qzone=10&margin=0&size=300x300&ecc=L&format=svg`
        );
      }
      catch (e) {
        console.warn('exception in /encode: ', e);
        res.status(400).send('Wrong data format');
      }
    })

    this.app.get('/', (req, res) => {
      res.send(`
<!DOCTYPE html>
<html>

<head>
  <title>
    Генератор ценников
  </title>
</head>

<body>

  <form target="_blank" action="http://magellan2018.aerem.in:8159/encode_bill">
    Продавец (получатель платежа)<br>
    <input type="text" name="receiver" value="">
    <br> Цена:
    <br>
    <input type="text" name="amount" value="">
    <br> Комментарий:
    <br>
    <input type="text" name="comment" value="">
    <br><br>
    <input type="submit" value="Сгенерировать QR-код">
  </form>

</body>

</html>
      `);
    });
  }

  listen(port: number) {
    this.server = this.app.listen(port);
  }

  stop() {
    this.server.close();
  }
}

export default App;