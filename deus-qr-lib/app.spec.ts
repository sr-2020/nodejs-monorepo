import * as rp from 'request-promise';

import { expect } from 'chai';
import 'mocha';

import App from './app';

const port = 3001;
const address = 'http://localhost:' + port;

describe('API Server', () => {
  let app: App;

  beforeEach(async () => {
    app = new App();
    await app.listen(port);
  });

  afterEach(() => {
    app.stop();
  });

  it('Decodes encoded code', async () => {
    const encodeResponse = await rp.get(address + '/encode?type=10&kind=26&validUntil=1697919090&payload=UUID', {json: {}}).promise();
    expect(encodeResponse).to.have.property('content');
    const decodeResponse = await rp.get(address + `/decode?content=${encodeResponse.content}`, {json: {}}).promise();
    expect(decodeResponse).to.deep.equal({type: 10, kind: 26, validUntil: 1697919090, payload: 'UUID'});
  });

  it('Decodes encoded code if type provided by string', async () => {
    const encodeResponse = await rp.get(address + '/encode?type=Pill&kind=26&validUntil=1697919090&payload=UUID', {json: {}}).promise();
    expect(encodeResponse).to.have.property('content');
    const decodeResponse = await rp.get(address + `/decode?content=${encodeResponse.content}`, {json: {}}).promise();
    expect(decodeResponse).to.deep.equal({type: 1, kind: 26, validUntil: 1697919090, payload: 'UUID'});
  });


})

