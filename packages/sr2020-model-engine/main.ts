import { Logger } from '@nestjs/common';
import { createApp } from '@alice/sr2020-model-engine/application';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
const config = { port: Number(process.env.PORT ?? 3000) };

async function main() {
  await createApp(config);
}

main()
  .then(() => {
    Logger.log('Listening at http://localhost:' + config.port + '/');
  })
  .catch((err) => {
    Logger.error('Failed to start:' + err);
  });
