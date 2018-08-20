import * as rp from 'request-promise';

import { expect } from 'chai';
import 'mocha';

import App from './app';

const port = 3001;
const address = 'http://localhost:' + port;

describe('API Server', () => {
  let app: App;

  beforeEach(async () => {
    app = new App('some_user', 'qwerty');
    await app.listen(port);
  });

  afterEach(() => {
    app.stop();
  });

  it('Decodes encoded code', async () => {
    const encodeResponse = await rp.get(address + '/encode?type=10&kind=26&validUntil=1697919090&payload=UUID',
      { json: {}, auth: { username: 'some_user', password: 'qwerty' } }).promise();
    expect(encodeResponse).to.have.property('content');
    const decodeResponse = await rp.get(address + `/decode?content=${encodeResponse.content}`, { json: {} }).promise();
    expect(decodeResponse).to.deep.equal({ type: 10, kind: 26, validUntil: 1697919090, payload: 'UUID' });
  });

  it('Decodes encoded code if type provided by string', async () => {
    const encodeResponse = await rp.get(address + '/encode?type=Pill&kind=26&validUntil=1697919090&payload=UUID',
      { json: {}, auth: { username: 'some_user', password: 'qwerty' } }).promise();
    expect(encodeResponse).to.have.property('content');
    const decodeResponse = await rp.get(address + `/decode?content=${encodeResponse.content}`, { json: {} }).promise();
    expect(decodeResponse).to.deep.equal({ type: 1, kind: 26, validUntil: 1697919090, payload: 'UUID' });
  });

  it('Encode bill', async () => {
    const encodeResponse = await rp.get(address + encodeURI('/encode_bill?receiver=vasya&amount=100&comment=Рыба'),
      { json: {}, followAllRedirects: true, resolveWithFullResponse: true, simple: false }).promise();
    const finalUrl = encodeResponse.request.href;
    const match = /&data=([^&]*)&/.exec(finalUrl);
    expect(match).not.to.be.null;
    const data = decodeURI((match as RegExpExecArray)[1]);
    const decodeResponse = await rp.get(address + encodeURI(`/decode?content=${data}`), { json: {} }).promise();
    expect(decodeResponse).to.deep.equal({ type: 101, kind: 0, validUntil: 1700000000, payload: 'vasya,100,Рыба' });
  });

  it('Encode fails without credentials', async () => {
    const response = await rp.get(address + '/encode?type=10&kind=26&validUntil=1697919090&payload=UUID',
      { json: {}, resolveWithFullResponse: true, simple: false }).promise();
    expect(response.statusCode).to.equal(401);
  });

  it('Encode fails with credentials for wrong user', async () => {
    const response = await rp.get(address + '/encode?type=10&kind=26&validUntil=1697919090&payload=UUID',
      { json: {}, auth: { username: 'not_user', password: 'qwerty' }, resolveWithFullResponse: true, simple: false }).promise();
    expect(response.statusCode).to.equal(401);
  });

  it('Encode fails with credentials with wrong password', async () => {
    const response = await rp.get(address + '/encode?type=10&kind=26&validUntil=1697919090&payload=UUID',
      { json: {}, auth: { username: 'some_user', password: 'asdfg' }, resolveWithFullResponse: true, simple: false }).promise();
    expect(response.statusCode).to.equal(401);
  });
})

