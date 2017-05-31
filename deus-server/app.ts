import * as express from 'express'
const app = express()
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/time', (req, res) => {
  const currentTimestamp = new Date().valueOf();
  res.send({time: currentTimestamp});
})

export default app;