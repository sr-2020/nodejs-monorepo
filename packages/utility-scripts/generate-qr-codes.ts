// Running:
//   npx ts-node packages/utility-scripts/generate-qr-codes.ts

import * as QRCode from 'qrcode-svg';
import { encode } from 'alice-qr-lib/qr';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import * as request from 'request-promise-native';

async function run() {
  for (let i = 2000; i < 3000; ++i) {
    const content = encode({ type: 1, kind: 0, validUntil: 1802790262, payload: i.toString() });
    const qrcode = new QRCode(content);
    await new Promise((resolve, reject) => {
      qrcode.save(`output/qrcode_${i}.svg`, (error) => {
        if (error) reject(error);
        resolve();
      });
    });

    const qrData: QrCode = {
      modelId: i.toString(),
      usesLeft: 0,
      type: 'empty',
      name: 'Пустышка',
      description: 'Не записанный QR-код. На него можно записать что угодно',
      eventType: '',
      data: {},
      timestamp: 0,
      modifiers: [],
      timers: [],
    };

    await request.put('https://models-manager.evarun.ru/qr/model', { json: qrData, resolveWithFullResponse: true }).promise();
  }
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
