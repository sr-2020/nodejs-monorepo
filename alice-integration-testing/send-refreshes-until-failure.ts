import * as commandLineArgs from 'command-line-args';
import * as rp from 'request-promise';

const address = 'https://api.alice.aerem.in';

const optionDefinitions = [
  { name: 'id', type: String },
  { name: 'password', type: String },
];

const usernamePrefix = commandLineArgs(optionDefinitions).id;
const password = commandLineArgs(optionDefinitions).password;

console.info('Your ID is ' + usernamePrefix);

let minLatency = 100000;
let maxLatency = 0;
let totalLatency = 0;
let totalRequests = 0;

let totalShipLatency = 0;
let totalShipRequests = 0;

function suffix(n: number) {
  n = (n % 90) + 1;
  if (n < 10) return '0' + n.toString();
  return n.toString();
}

async function prepare() {
  for (let i = 0; i < 50; ++i) {
    const ship = i % 5;
    const username = usernamePrefix + suffix(i);
    const response = await rp.post(address + '/events/' + username,
      {
        resolveWithFullResponse: true, simple: false,
        json: { events: [{ eventType: 'enter-ship', timestamp: new Date().valueOf(), data: ship }] },
        auth: { username: 'admin', password: 'admin' },
      }).promise();
      if (response.statusCode != 202) {
        console.error('Get non-success response: ' + JSON.stringify(response));
        process.exit(1);
      }
  }
}

async function sendEvent() {
  const tsBefore = new Date().valueOf();
  totalRequests += 1;
  const username = usernamePrefix + suffix(totalRequests);
  const response = await rp.post(address + '/events/' + username,
    {
      resolveWithFullResponse: true, simple: false,
      json: { events: [{ eventType: '_RefreshModel', timestamp: new Date().valueOf() }] },
      auth: { username, password },
    }).promise();
  const tsAfter = new Date().valueOf();
  if (response.statusCode != 200) {
    console.error('Get non-success response: ' + JSON.stringify(response));
    process.exit(1);
  } else {
    const latency = tsAfter - tsBefore;
    console.info(`Request took ${latency} ms`);
    maxLatency = Math.max(maxLatency, latency);
    minLatency = Math.min(minLatency, latency);
    totalLatency += latency;
    console.info(
      `Current latency stats: min = ${minLatency}, max = ${maxLatency}, avg = ${totalLatency / totalRequests}`);
  }
}

async function sendEventToShip() {
  const tsBefore = new Date().valueOf();
  totalShipRequests += 1;
  const ship = totalShipRequests % 5;
  const data = [1, 0, 0, 0, 0, 0, 0];
  data.slice(ship, data.length).concat(data.slice(0, ship));
  const response = await rp.post(`${address}/location_events/ship_${ship}`,
    {
      resolveWithFullResponse: true, simple: false,
      json: { events: [{ eventType: 'modify-systems-instant', data }] },
      auth: { username: 'admin', password: 'admin' },
    }).promise();
  const tsAfter = new Date().valueOf();
  if (response.statusCode != 200) {
    console.error('Get non-success response: ' + JSON.stringify(response));
    process.exit(1);
  } else {
    const latency = tsAfter - tsBefore;
    console.info(`Ship Request took ${latency} ms`);
    totalShipLatency += latency;
    console.info(
      `Current latency stats: min = ${minLatency}, max = ${maxLatency}, avg = ${totalShipLatency / totalShipRequests}`);
  }
}

prepare().then(() => {
  setInterval(sendEvent, 500);
  setInterval(sendEventToShip, 12000);
});
