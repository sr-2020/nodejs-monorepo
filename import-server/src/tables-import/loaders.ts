import { google } from 'googleapis';
const sheets = google.sheets('v4');

const spreadsheetId = '1HpNnkNHhJaryi8hBhElwuvB-8ooaoGS7f4IrY-Z0bQY';

export async function xenomorphsDataLoad(authClient: any) {
  const request = { auth: authClient, spreadsheetId, range: 'Xenomorphs!A3:CM30' };
  const response = await sheets.spreadsheets.values.get(request);
  return response.data;
}
