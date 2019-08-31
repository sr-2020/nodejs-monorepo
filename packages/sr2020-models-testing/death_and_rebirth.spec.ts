import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Death & Rebirth', function() {
  // tslint:disable-next-line: no-invalid-this
  this.timeout(15000);
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Healthy -> Wounded -> Clinically dead -> Healthy', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ healthState: 'wounded' });
    await fixture.advanceTime(300);
    await fixture.refreshCharacter();
    expect(await fixture.getCharacter()).containDeep({ healthState: 'clinically_dead' });
    await fixture.sendCharacterEvent({ eventType: 'revive' });
    expect(await fixture.getCharacter()).containDeep({ healthState: 'healthy' });
  });

  it('Revive cancels death timer', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ healthState: 'wounded' });
    await fixture.advanceTime(150);
    await fixture.sendCharacterEvent({ eventType: 'revive' });
    await fixture.advanceTime(150);
    await fixture.refreshCharacter();
    expect(await fixture.getCharacter()).containDeep({ healthState: 'healthy' });
  });
});
