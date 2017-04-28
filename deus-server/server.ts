import * as express from 'express'
const app = express()
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/', (req, res) => {
  const currentTimestamp = new Date().valueOf();
  res.send({time: currentTimestamp});
})
const server = app.listen(3000, () => {
  console.log(`server listening on port ${server.address().port}`)
})