import { getDataFromSpreadsheet } from './spreadsheet_helper';
import { Drone } from '@alice/sr2020-model-engine/scripts/qr/drone_library';

// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/drones-spreadsheet.ts

async function run() {
  // https://docs.google.com/spreadsheets/d/1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc
  const spreadsheetId = '1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc';

  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'Дроны!B7:L31');
  const header = data[0];
  if (
    header.slice(0, 11).join('  ') !=
    'ID  название  Класс дрона  Тип дрона  Корпорация  Слоты  Разгон  Sensor-Drone  хиты  Описание для игрока  Выдать абилки при входе в дрон'
  ) {
    throw new Error('Header has changed! Exiting.');
  }

  const drones: Drone[] = [];
  for (let r = 1; r < 25; ++r) {
    const row = data[r];
    if (!row?.[0]) continue;

    drones.push({
      id: row[0],
      name: row[1],
      type: row[2],
      modSlots: Number(row[5]),
      moddingCapacity: Number(row[6]),
      sensor: Number(row[7]),
      hitpoints: Number(row[8]),
      description: row[9],
      abilityIds: (row[10] as string).split('\n'),
    });
  }

  console.log(JSON.stringify(drones));
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
