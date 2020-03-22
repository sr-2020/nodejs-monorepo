// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/merchandise-spreadsheet.ts

import * as request from 'request-promise-native';

import { Implant as LibraryImplant } from '@sr2020/sr2020-models/scripts/character/implants_library';
import { getDataFromSpreadsheet } from './spreadsheet_helper';

interface Implant extends LibraryImplant {
  cost: number;
}

async function run() {
  // https://docs.google.com/spreadsheets/d/1R_uL3lhJPPoyX_FdUtWd-FibPxpN73HREecEUXS14RA
  const spreadsheetId = '1R_uL3lhJPPoyX_FdUtWd-FibPxpN73HREecEUXS14RA';

  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'Список имплантов!A1:I900');
  const header = data[0];
  if (
    header.slice(0, 9).join('  ') !=
    'ID  название  слот  описание для игрока  эффект  грейд  стоимость эссенс  сложность установки  стоимость'
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
        'слот под биомонитор': 'biomonitor',
        голова: 'head',
        'слот под RCC': 'rcc',
        'слот под коммлинк': 'commlink',
      }[(row[2] as string).trim()],
      description: row[3],
      grade: { альфа: 'alpha', бета: 'beta', гамма: 'gamma', дельта: 'delta', био: 'bio' }[(row[5] as string).trim()],
      essenceCost: Number(row[6]),
      installDifficulty: Number(row[7]),
      cost: Number(row[8]),
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
