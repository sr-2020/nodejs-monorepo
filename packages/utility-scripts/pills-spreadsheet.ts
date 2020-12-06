// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/pills-spreadsheet.ts
import { Pill } from '@alice/sr2020-model-engine/scripts/character/chemo_library';
import { getDataFromSpreadsheet } from './spreadsheet_helper';

interface Component {
  id: string;
  name: string;
}

const kAllComponents: Component[] = [
  { id: 'teqgel', name: 'Текгель' },
  { id: 'iodine', name: 'Йод' },
  { id: 'argon', name: 'Аргон' },
  { id: 'radium', name: 'Радий' },
  { id: 'junius', name: 'Юний' },
  { id: 'custodium', name: 'Кустодий' },
  { id: 'polonium', name: 'Полоний' },
  { id: 'silicon', name: 'Силикон' },
  { id: 'magnium', name: 'Магний' },
  { id: 'chromium', name: 'Хром' },
  { id: 'opium', name: 'Опий' },
  { id: 'elba', name: 'Эльба' },
  { id: 'barium', name: 'Барий' },
  { id: 'uranium', name: 'Уранус' },
  { id: 'moscovium', name: 'Московий' },
  { id: 'iconium', name: 'Иконий' },
  { id: 'vampirium', name: 'Слюна вампира' },
];

async function run() {
  // https://docs.google.com/spreadsheets/d/1R_uL3lhJPPoyX_FdUtWd-FibPxpN73HREecEUXS14RA
  const spreadsheetId = '1R_uL3lhJPPoyX_FdUtWd-FibPxpN73HREecEUXS14RA';

  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'Препараты new!B2:O900');
  const header = data[0];
  if (
    header.slice(0, 9).join('  ') !=
    'комментарии  ID в IT  Название препарата  вещество  концентрация  вещество  концентрация  вещество  концентрация'
  ) {
    throw new Error('Header has changed! Exiting.');
  }

  const pills: Pill[] = [];
  for (let i = 1; i < data.length; ++i) {
    const row = data[i];
    if (!row[1]?.length) continue;

    const p: Pill = {
      id: row[1],
      name: row[2],
      content: {},
    };

    for (let j = 3; j < 30; j += 2) {
      if (!row[j]) break;
      const componentName: string = row[j];
      const amount = Number(row[j + 1]);
      const componentId = kAllComponents.find((it) => componentName.toLowerCase() == it.name.toLowerCase());
      if (!componentId) {
        throw new Error(`Неизвестное вещество в препарате ${p.name}`);
      }
      p.content[componentId.id] = amount;
    }

    pills.push(p);
  }

  console.log(`Parsed ${pills.length} items!`);
  console.log(`export const kAllPills: Pill[] = ${JSON.stringify(pills)}`);
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
