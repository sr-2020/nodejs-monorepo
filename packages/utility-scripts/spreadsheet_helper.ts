import { google } from 'googleapis';

export async function getDataFromSpreadsheet(spreadsheetId: string, range: string) {
  const auth = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const response = await google.sheets('v4').spreadsheets.values.get({ auth, spreadsheetId, range });
  const data = response.data.values;
  if (!data) {
    throw new Error('Failed to get spreadsheet range');
  }
  return data;
}
