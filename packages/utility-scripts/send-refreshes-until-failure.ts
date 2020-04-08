import * as commandLineArgs from 'command-line-args';
import * as rp from 'request-promise';

// Run with
//   npx ts-node packages/utility-scripts/send-refreshes-until-failure.ts --id=130

const address = 'http://models-manager.evarun.ru/character/model';

const optionDefinitions = [{ name: 'id', type: String }];

const username = commandLineArgs(optionDefinitions).id;
console.info('Your ID is ' + username);

async function refresh() {
  const tsBefore = new Date().valueOf();
  const response = await rp
    .get(`${address}/${username}`, {
      resolveWithFullResponse: true,
      simple: false,
    })
    .promise();
  const tsAfter = new Date().valueOf();
  if (response.statusCode != 200) {
    console.error('Get non-success response: ' + JSON.stringify(response));
    //process.exit(1);
  } else {
    const latency = tsAfter - tsBefore;
    console.info(`Get Request took ${latency} ms`);
  }
}

setInterval(refresh, 2000);
