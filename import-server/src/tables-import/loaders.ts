import * as google from 'googleapis';
let sheets = google.sheets('v4');

const spreadsheetId = '1703sXU-akDfn9dsnt19zQjvRrSs7kePPGDkcX0Zz-bY';

function defaultParams(mergeParams) {
    const defaultParams = {
        spreadsheetId,
        range: 'Implants!A5:R1000',
        valueRenderOption: 'FORMATTED_VALUE',
        dateTimeRenderOption: 'SERIAL_NUMBER'
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

export function implantsDataLoad(authClient): Promise<any> {
    const request = defaultParams({ auth: authClient, range: 'Implants!A5:R1000' });
    return getValues(request);
}

export function illnessesDataLoad(authClient): Promise<any> {
    const request = defaultParams({ auth: authClient, range: "Illnesses!A4:T100" });
    return getValues(request);
}

export function conditionsDataLoad(authClient): Promise<any> {
    const request = defaultParams({ auth: authClient, range: "Conditions!A6:H250" });
    return getValues(request);
}

export function pillsDataLoad(authClient): Promise<any> {
    const request = defaultParams({ auth: authClient, range: "Pills!A4:G70" });
    return getValues(request);
}

export function firmwareDataLoad(authClient): Promise<any> {
    const request = defaultParams({ auth: authClient, range: "Firmware!A5:C37" });
    return getValues(request);
}
