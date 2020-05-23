// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/merchandise-spreadsheet.ts

import * as request from 'request-promise-native';

import { Implant as LibraryImplant } from '@sr2020/sr2020-model-engine/scripts/character/implants_library';
import { getDataFromSpreadsheet } from './spreadsheet_helper';

interface Implant extends LibraryImplant {
  cost: number;
}

async function run() {
  // https://docs.google.com/spreadsheets/d/1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc
  const spreadsheetId = '1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc';

  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'Импланты!A1:J900');
  const header = data[0];
  if (
    header.slice(0, 10).join('  ') !=
    'ID  название  Корпорация-производитель  слот  описание для игрока  эффект  грейд  стоимость эссенс  сложность установки  стоимость'
  ) {
    throw new Error('Header has changed! Exiting.');
  }

  const implants: Implant[] = [];
  for (let i = 1; i < data.length; ++i) {
    const row = data[i];
    if (!row[0]?.length) continue;

    const m: Implant = {
      id: row[0],
      name: row[1],
      slot: {
        корпус: 'body',
        рука: 'arm',
        голова: 'head',
        'слот под RCC': 'rcc',
        'слот под коммлинк': 'commlink',
      }[(row[3] as string).trim()],
      description: row[4],
      grade: { альфа: 'alpha', бета: 'beta', гамма: 'gamma', дельта: 'delta', био: 'bio' }[(row[6] as string).trim()],
      essenceCost: Number(row[7]),
      installDifficulty: Number(row[8]),
      cost: Number(row[9]),
      modifiers: [],
    };
    implants.push(m);
  }

  console.log(`Parsed ${implants.length} items!`);

  for (const m of implants) {
    await request
      .put('http://billing.evarun.ru/api/Billing/admin/createorupdateproduct', {
        qs: {
          code: m.id,
          name: m.name,
          description: m.description,
          lifestyle: 1,
          basePrice: m.cost,
        },
        json: {},
        resolveWithFullResponse: true,
      })
      .promise();
  }
  console.log(
    `export const kAllImplants: Implant[] = ${JSON.stringify(
      implants.map((x) => {
        delete x.cost;
        return x;
      }),
    )};`,
  );
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
