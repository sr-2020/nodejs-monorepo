import * as request from 'request-promise-native';

const emails = [];

const gatewayAddress = 'http://gateway.evarun.ru/api/v1/';
const kQrsToRecreate = 0;

interface LoginResponse {
  id: number;
  api_key: string;
}

async function loginOrRegister(email: string, password: string): Promise<LoginResponse> {
  try {
    return (await request.post(gatewayAddress + 'auth/login', { json: { email, password }, resolveWithFullResponse: true }).promise()).body;
  } catch (e) {
    return (await request
      .post(gatewayAddress + 'auth/register', { json: { email, password, name: email }, resolveWithFullResponse: true })
      .promise()).body;
  }
}

async function provideCharacter(login: LoginResponse) {
  const characterData = {
    modelId: login.id.toString(),
    timestamp: 0,
    spells: [],
    modifiers: [],
    conditions: [],
    timers: {},
    spellsCasted: 0,
  };

  await request.put('http://models-manager.evarun.ru/character/model', { json: characterData, resolveWithFullResponse: true }).promise();
  await request
    .post(gatewayAddress + 'models-manager/character/model', {
      json: { eventType: 'learnSpell', data: { spellName: 'fullHealSpell' } },
      auth: { bearer: login.api_key },
      resolveWithFullResponse: true,
    })
    .promise();
}

async function provideBilling(login: LoginResponse) {
  const transaction = {
    created_at: new Date().toISOString(),
    sin_from: 0,
    sin_to: login.id,
    amount: 1000,
    comment: 'Тестирование',
  };

  await request.post('http://billing.evarun.ru/transactions', { json: transaction, resolveWithFullResponse: true }).promise();
}

async function providePlayer(email: string) {
  console.log(`Generating data for ${email}`);
  const login = await loginOrRegister(email, '1');
  await provideCharacter(login);
  await provideBilling(login);
}

async function provideEmptyQr(modelId: string) {
  const qrData = {
    modelId,
    usesLeft: 0,
    type: 'empty',
    description: '',
    eventType: '',
    data: {},
    timestamp: 0,
    modifiers: [],
    conditions: [],
    timers: {},
  };

  await request.put('http://models-manager.evarun.ru/qr/model', { json: qrData, resolveWithFullResponse: true }).promise();
}

async function main() {
  for (const email of emails) {
    await providePlayer(email);
  }

  for (let i = 1; i < kQrsToRecreate; ++i) {
    await provideEmptyQr(i.toString());
  }
}

main()
  .then(() => console.log('Success'))
  .catch((e) => console.log(`Error: ${e}`));