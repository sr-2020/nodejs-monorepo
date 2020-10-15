// Running:
//   npx ts-node packages/utility-scripts/generate-qr-codes.ts

import * as QRCode from 'qrcode-svg';
import { encode } from 'alice-qr-lib/qr';

async function run() {
  for (let i = 1; i < 1000; ++i) {
    const content = encode({ type: 1, kind: 0, validUntil: 1802790262, payload: i.toString() });
    const qrcode = new QRCode(content);
    await new Promise((resolve, reject) => {
      qrcode.save(`output/qrcode_${i}.svg`, (error) => {
        if (error) reject(error);
        resolve();
      });
    });
  }
}

run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
