import { getDataFromSpreadsheet } from './spreadsheet_helper';

export type DroneType = 'groundcraft' | 'aircraft' | 'medicart' | 'autodoc';

export interface Drone {
  id: string;
  name: string;
  description: string;
  type: DroneType;
  modSlots: number;
  moddingCapacity: number;
  sensor: number;
  hitpoints: number;
  abilityIds: string[];
}

// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/drones-spreadsheet.ts

async function run() {
  // https://docs.google.com/spreadsheets/d/1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc
  const spreadsheetId = '1Vm1nbS-Gs9H_5FZaJ_cnA5hnCaeDZLfNfwxayl70evc';

  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'Дроны v2!A3:K34');
  const header = data[0];
  if (
    header.slice(0, 11).join('  ') !=
    'ID  название  Класс дрона  Тип дрона  Корпорация  Стоимость  Доступность (О,З,М)  Sensor-Drone  хиты  Описание (Public)  Мастерское - Выдать абилки при входе в дрон'
  ) {
    throw new Error('Header has changed! Exiting.');
  }

  const drones: Drone[] = [];
  for (let r = 1; r < 31; ++r) {
    const row = data[r];
    if (!row?.[0]) continue;

    drones.push({
      id: row[0],
      name: row[1],
      type: row[2],
      modSlots: Number(0),
      moddingCapacity: Number(0),
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
