import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('General character events', function () {
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
    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'scanQr', data: { qrCode: '0' } });
    expect(message).to.equal('Этот QR-код - пустышка, его нельзя использовать');
  });
});
