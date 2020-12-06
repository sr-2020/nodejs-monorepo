import * as request from 'request-promise-native';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { getDataFromSpreadsheet } from './spreadsheet_helper';

// Run with
//   npx ts-node -r tsconfig-paths/register packages/utility-scripts/beta-testers-creator.ts

interface User {
  email: string;
  name: string;
}

const gatewayAddress = 'https://gateway.evarun.ru/api/v1/';
const kQrsToRecreate = 1000;
const kLocationsToRecreate = 100;

interface LoginResponse {
  id: number;
  api_key: string;
}

async function loginOrRegister(email: string, name: string, password: string): Promise<LoginResponse> {
  try {
    return (
      await request.post(gatewayAddress + 'auth/register', { json: { email, password, name }, resolveWithFullResponse: true }).promise()
    ).body;
  } catch (e) {
    return (await request.post(gatewayAddress + 'auth/login', { json: { email, password }, resolveWithFullResponse: true }).promise()).body;
  }
}

async function provideCharacter(login: LoginResponse) {
  await request
    .put(`https://models-manager.evarun.ru/character/default/${login.id}`, { json: {}, resolveWithFullResponse: true })
    .promise();
}

async function provideLocation(id: number) {
  await request.put(`https://models-manager.evarun.ru/location/default/${id}`, { json: {}, resolveWithFullResponse: true }).promise();
}

async function provideBilling(login: LoginResponse) {
  await request.get(`https://billing.evarun.ru/api/Billing/admin/createphysicalwallet?character=${login.id}&balance=1000`).promise();
}

async function providePlayer(user: User) {
  console.log(`Generating data for ${user.email}`);
  const login = await loginOrRegister(user.email, user.name, '1');
  await provideCharacter(login);
  await provideBilling(login);
}

async function provideEmptyQr(modelId: string) {
  const qrData: QrCode = {
    modelId,
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

async function main() {
  // https://docs.google.com/spreadsheets/d/1yvH46R28hIGnwRkqD0MUKUr23AQUb07Kdw6AgUfLyjs
  const data = await getDataFromSpreadsheet('1yvH46R28hIGnwRkqD0MUKUr23AQUb07Kdw6AgUfLyjs', 'МГ!A2:B50');
  const users: User[] = [];
  for (const r of data) {
    if (r[0]?.length && r[1]?.length) {
      users.push({ email: r[0], name: r[1] });
    }
  }

  for (let i = 0; i < 100; ++i) {
    users.push({ email: `t${i}@foo.bar`, name: `Tester #${i}` });
  }

  for (const user of users) {
    await providePlayer(user);
  }

  for (let i = 1; i < kQrsToRecreate; ++i) {
    await provideEmptyQr(i.toString());
  }

  for (let i = 1; i < kLocationsToRecreate; ++i) {
    await provideLocation(i);
  }
}

main()
  .then(() => console.log('Success'))
  .catch((e) => console.log(`Error: ${e}`));
