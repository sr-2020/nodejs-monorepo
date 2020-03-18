// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node packages/utility-scripts/merchandise-spreadsheet.ts
import * as request from 'request-promise-native';

import { getDataFromSpreadsheet } from './spreadsheet_helper';

interface Implant {
  id: string;
  name: string;
  slot: string;
  description: string;
  effect: string;
  grade: string;
  essence: number;
  complexity: number;
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
      slot: row[2],
      description: row[3],
      effect: row[4],
      grade: row[5],
      essence: row[6],
      complexity: row[7],
      cost: row[8],
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
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
