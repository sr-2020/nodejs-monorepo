import { getDataFromSpreadsheet } from './spreadsheet_helper';

// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/ethic-groups-spreadsheet.ts

type EthicScale = 'violence' | 'control' | 'individualism' | 'mind';

interface EthicCondition {
  scale: EthicScale;
  conditionMin: number;
  conditionMax: number;
}

export interface EthicGroup {
  id: string; // Identifier of the group
  name: string; // Human-readable name of the group.
  ethicStyle: EthicCondition[]; // Member of the group must meet those conditions to get abilities.
  abilityIds: string[];
}

async function run() {
  // https://docs.google.com/spreadsheets/d/13ndrZSM5AUvPpyMB7WYN6uDX8_-Hlx-67_j3FMsLlYM
  const spreadsheetId = '13ndrZSM5AUvPpyMB7WYN6uDX8_-Hlx-67_j3FMsLlYM';

  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'Основное!A2:Q100');

  const ethicGroups: EthicGroup[] = [];

  for (let r = 0; r < 50; ++r) {
    const row = data[r];
    if (!row?.[0]) continue;

    ethicGroups.push({
      id: row[1],
      name: row[0],
      abilityIds: (row[16] as string).split('\n'),
      ethicStyle: [
        {
          scale: 'violence',
          conditionMin: Number(row[4]),
          conditionMax: Number(row[5]),
        },
        {
          scale: 'control',
          conditionMin: Number(row[6]),
          conditionMax: Number(row[7]),
        },
        {
          scale: 'individualism',
          conditionMin: Number(row[8]),
          conditionMax: Number(row[9]),
        },
        {
          scale: 'mind',
          conditionMin: Number(row[10]),
          conditionMax: Number(row[11]),
        },
      ],
    });
  }

  console.log(JSON.stringify(ethicGroups));
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
