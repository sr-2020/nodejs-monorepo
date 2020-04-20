import { google } from 'googleapis';
import * as moment from 'moment';

/* Can be deployed by
     yarn --cwd packages/sheets-export build
     gcloud functions deploy healthStateToSheet --source=packages/sheets-export --runtime=nodejs10 --trigger-topic=health_state --region=europe-west3 --no-allow-unauthenticated
     gcloud functions deploy abilityUsedToSheet --source=packages/sheets-export --runtime=nodejs10 --trigger-topic=ability_used --region=europe-west3 --no-allow-unauthenticated
*/

function currentMoscowDateTime() {
  return moment(new Date())
    .utcOffset('+0300')
    .format('DD.MM HH:mm:ss');
}

async function appendToSpreadsheet(range: string, row: any[]) {
  // https://docs.google.com/spreadsheets/d/10R6KETp2B4JYnPoryQZHATqwBxFbLYwNZ_lDgWpWwRo
  const spreadsheetId = '10R6KETp2B4JYnPoryQZHATqwBxFbLYwNZ_lDgWpWwRo';
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  await google.sheets('v4').spreadsheets.values.append({
    auth,
    spreadsheetId,
    range,
    requestBody: {
      values: [row],
    },
    valueInputOption: 'RAW',
  });
}

export async function healthStateToSheet(event: { data: string }) {
  const payload: { characterId: string; stateFrom: string; stateTo: string } = JSON.parse(Buffer.from(event.data, 'base64').toString());
  console.log(payload);

  await appendToSpreadsheet('Здоровье!A1:D1', [currentMoscowDateTime(), payload.characterId, payload.stateFrom, payload.stateTo]);
}

export async function abilityUsedToSheet(event: { data: string }) {
  const payload: { id: string; name: string; characterId: string; location: { id: string }; targetCharacterId?: string } = JSON.parse(
    Buffer.from(event.data, 'base64').toString(),
  );
  console.log(payload);

  await appendToSpreadsheet('Применения способностей!A1:F1', [
    currentMoscowDateTime(),
    payload.location.id,
    payload.characterId,
    payload.id,
    payload.name,
    payload.targetCharacterId ?? '',
  ]);
}
