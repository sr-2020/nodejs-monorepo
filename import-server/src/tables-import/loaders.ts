import * as google from 'googleapis';
let sheets = google.sheets('v4');

const spreadsheetId = '1HpNnkNHhJaryi8hBhElwuvB-8ooaoGS7f4IrY-Z0bQY';

function defaultParams(mergeParams) {
    const defaultParams = {
        spreadsheetId,
        //valueRenderOption: 'FORMATTED_VALUE',
        //dateTimeRenderOption: 'SERIAL_NUMBER'
    };

    return { ...defaultParams, ...mergeParams };
}

function promisify<T>(fn: Function): (...params: any[]) => Promise<T> {
    return (...params: any[]) => {
        return new Promise((resolve, reject) => {
            const callback = (err, value) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            }

            fn(...params, callback);
        });
    }
}

const getValues = promisify<any>(sheets.spreadsheets.values.get);
const setValues = promisify<any>(sheets.spreadsheets.values.update);

export function xenomorphsDataLoad(authClient): Promise<any> {
    const request = defaultParams({ auth: authClient, range: 'Xenomorphs!A3:CC1000' });
    return getValues(request);
}

export function testDataSave(auth): Promise<any> {
    const request = defaultParams({
        auth, range: 'Test!A3:C5', valueInputOption: 'RAW', resource: {
            values: [
                [1, 5, 3],
                [2, 7, 54],
                [254, 767, 454],
            ]
        }
    });
    return setValues(request);
}
