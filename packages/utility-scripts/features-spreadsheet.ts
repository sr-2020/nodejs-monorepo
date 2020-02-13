// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node features-spreadsheet.ts > out.txt
import { Firestore } from '@google-cloud/firestore';
import { google } from 'googleapis';
const sheets = google.sheets('v4');

interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  originalLine: number;
  gmDescription: string;
}

async function main() {
  const db = new Firestore();
  const passiveAbilitiesRef = db.collection('passive_abilities');

  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  // https://docs.google.com/spreadsheets/d/1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A
  const spreadsheetId = '1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A';
  const response = await sheets.spreadsheets.values.get({ auth, spreadsheetId, range: 'Фичи!A1:AE700' });
  const data = response.data.values;
  if (!data) {
    throw new Error('Failed to get spreadsheet range');
  }

  for (let r = 1; r < 600; ++r) {
    const row = data[r];
    const id = row[6];
    const kind = row[27];
    if (id && kind == 'Пассивная абилка') {
      const ability: PassiveAbility = {
        id,
        name: row[3],
        description: row[4],
        gmDescription: row[8],
        originalLine: r + 1,
      };
      const existingDoc = await passiveAbilitiesRef.doc(id).get();
      if (
        existingDoc.data()?.name != ability.name ||
        existingDoc.data()?.description != ability.description ||
        existingDoc.data()?.gmDescription != ability.gmDescription
      ) {
        console.log(`
          {
            id: '${ability.id}',
            name: '${ability.name}',
            description: '${ability.description.replace(/\n/g, '\\n')}',
            // ${ability.originalLine}
            // ${ability.gmDescription.replace(/\n/g, '\n          // ')}
            // TODO(aeremin): Implement and add modifier here
            modifier: [],
          },`);
      }
      await passiveAbilitiesRef.doc(id).set(ability);
    }
  }
}

main().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
