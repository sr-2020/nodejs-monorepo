import * as rp from 'request-promise';

const url = 'http://instance.evarun.ru:7007/model/10';

function numberOfConditions(resp: any) {
  return resp.body.workModel.conditions.length;
}

async function main() {
  const p: Promise<any>[] = [];
  for (let i = 0; i < 20; ++i) {
    p.push(
      rp
        .post(url, {
          resolveWithFullResponse: true,
          json: { eventType: 'put-condition', data: { text: 'Concurrency', details: 'test', class: 'mind', duration: 60 } },
        })
        .promise(),
    );
  }
  await Promise.all(p);

  const result = await rp
    .get(url, {
      resolveWithFullResponse: true,
      json: {},
    })
    .promise();
  console.log(numberOfConditions(result));
}

main().then(() => {});
