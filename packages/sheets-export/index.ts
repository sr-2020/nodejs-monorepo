import { google } from 'googleapis';
import * as moment from 'moment';

/* Can be deployed by
     gcloud functions deploy healthStateToSheet --source=packages/sheets-export --runtime=nodejs10 --trigger-topic=health_state --region=europe-west3 --no-allow-unauthenticated
*/

export async function healthStateToSheet(event: { data: string }) {
  const payload: { characterId: string; stateFrom: string; stateTo: string } = JSON.parse(Buffer.from(event.data, 'base64').toString());
  console.log(payload);

  // https://docs.google.com/spreadsheets/d/10R6KETp2B4JYnPoryQZHATqwBxFbLYwNZ_lDgWpWwRo
  const spreadsheetId = '10R6KETp2B4JYnPoryQZHATqwBxFbLYwNZ_lDgWpWwRo';

  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  await google.sheets('v4').spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: 'Здоровье!A1:D1',
    requestBody: {
      values: [
        [
          moment(new Date())
            .utcOffset('+0300')
            .format('DD.MM HH:mm:ss'),
          payload.characterId,
          payload.stateFrom,
          payload.stateTo,
        ],
      ],
    },
    valueInputOption: 'RAW',
  });
}
