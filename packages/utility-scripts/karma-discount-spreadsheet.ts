// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/karma-discount-spreadsheet.ts

import { getDataFromSpreadsheet } from './spreadsheet_helper';

async function run() {
  // https://docs.google.com/spreadsheets/d/1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A
  const spreadsheetId = '1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A';

  // Parse level descriptions
  const data = await getDataFromSpreadsheet(spreadsheetId, 'скидосы!D8:F81');

  const items: { archetype: string; metarace: string; discount: number }[] = [];
  for (const row of data) {
    items.push({
      archetype: row[0],
      metarace: row[1],
      discount: Number(row[2]),
    });
  }

  console.log(`const kAllKarmaDiscounts: KarmaDiscount[] = ${JSON.stringify(items)};`);
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
