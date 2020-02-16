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

const db = new Firestore();

class SpreadsheetProcessor {
  passiveAbilitiesRef = db.collection('passive_abilities');
  passiveAbilities: PassiveAbility[] = [];

  async processPassiveAbility(line: number, id: string, row: any[]) {
    const ability: PassiveAbility = {
      id,
      name: row[6],
      description: row[13],
      gmDescription: row[14],
      originalLine: line + 1,
    };
    const existingDoc = await this.passiveAbilitiesRef.doc(id).get();
    if (
      existingDoc.data()?.name != ability.name ||
      existingDoc.data()?.description != ability.description ||
      existingDoc.data()?.gmDescription != ability.gmDescription
    ) {
      this.passiveAbilities.push(ability);
    }
  }

  async printAndSavePassiveAbilities() {
    console.log('//*************************** Passive abilities ***************************//');
    for (const ability of this.passiveAbilities) {
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
      await this.passiveAbilitiesRef.doc(ability.id).set(ability);
    }
  }

  async run() {
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
      const id = row[5];
      const kind = row[0];

      if (kind == 'Пассивная абилка') {
        if (!id) throw new Error(`Entity in the line ${r + 1} has no ID`);
        await this.processPassiveAbility(r, id, row);
      }
    }
    this.printAndSavePassiveAbilities();
  }
}

new SpreadsheetProcessor().run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
