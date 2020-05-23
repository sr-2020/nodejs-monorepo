import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('General character events', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(15000);
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Scan empty QR', async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode();
    const resp = await fixture.client
      .post(`/character/model/0`)
      .send({ eventType: 'scanQr', data: { qrCode: '0' } })
      .expect(400);
    expect(resp.body).to.containDeep({ error: { message: 'Этот QR-код - пустышка, его нельзя использовать' } });
  });
});
