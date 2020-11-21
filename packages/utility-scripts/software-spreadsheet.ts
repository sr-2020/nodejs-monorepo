import { getDataFromSpreadsheet } from './spreadsheet_helper';
import { Software } from '@sr2020/sr2020-model-engine/scripts/qr/software_library';

// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/software-spreadsheet.ts

async function run() {
  // https://docs.google.com/spreadsheets/d/1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc
  const spreadsheetId = '1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc';
  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'Софт!B8:H50');
  const header = data[0];
  if (header.join('  ') != 'ID  название  описание для игрока  Корпорация производитель  память  kind  charges') {
    console.log(header.join('  '));
    throw new Error('Header has changed! Exiting.');
  }

  const software: Software[] = [];
  for (let r = 1; r < 50; ++r) {
    const row = data[r];
    if (!row?.[0]) continue;

    software.push({
      id: row[0],
      name: row[1],
      description: row[2],
      ram: Number(row[4]),
      kind: row[5],
      charges: Number(row[6]),
    });
  }

  console.log(JSON.stringify(software));
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
