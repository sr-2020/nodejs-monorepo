import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Fixture', function() {
  // tslint:disable-next-line: no-invalid-this
  this.timeout(15000);

  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Ping', async () => {
    await fixture.client.get('/ping').expect(200);
  });

  it('Save and get location partial', async () => {
    await fixture.saveLocation({ manaDensity: 15 });
    const m = await fixture.getLocation();
    expect(m).to.containDeep({ manaDensity: 15 });
  });

  it('Send character event', async () => {
    await fixture.saveCharacter({ spellsCasted: 12 });
    await fixture.sendCharacterEvent({ eventType: 'dummy-spell', data: {} });
    expect(await fixture.getCharacter()).containDeep({ spellsCasted: 13 });
  });

  it('Send location event', async () => {
    await fixture.saveLocation({ manaDensity: 5 });
    await fixture.sendLocationEvent({ eventType: 'reduce-mana-density', data: { amount: 3 } });
    expect(await fixture.getLocation()).containDeep({ manaDensity: 2 });
  });

  it('Send scheduled event', async () => {
    await fixture.saveLocation({ manaDensity: 5 });
    await fixture.sendLocationEvent({
      eventType: 'schedule-event',
      data: { delayInSeconds: 10, event: { eventType: 'reduce-mana-density', data: { amount: 3 } } },
    });
    expect(await fixture.getLocation()).containDeep({ manaDensity: 5 });
    fixture.advanceTime(5);
    await fixture.refreshLocation();
    expect(await fixture.getLocation()).containDeep({ manaDensity: 5 });
    fixture.advanceTime(5);
    await fixture.refreshLocation();
    expect(await fixture.getLocation()).containDeep({ manaDensity: 2 });
  });

  it('Send character event with location event as side-effect', async () => {
    await fixture.saveCharacter({ spellsCasted: 5 });
    await fixture.saveLocation({ manaDensity: 10 });
    await fixture.sendCharacterEvent({ eventType: 'density-drain-spell', data: { locationId: '0', amount: 3 } });
    expect(await fixture.getCharacter()).containDeep({ spellsCasted: 6 });
    expect(await fixture.getLocation()).containDeep({ manaDensity: 7 });
  });

  it('Send character event which aquires location', async () => {
    await fixture.saveCharacter();
    await fixture.saveLocation({ manaDensity: 100 });
    await fixture.sendCharacterEvent({ eventType: 'density-halve-spell', data: { locationId: '0' } });
    expect(await fixture.getLocation()).containDeep({ manaDensity: 50 });
  });

  it('Location is actualized before putting in context', async () => {
    await fixture.saveCharacter();
    await fixture.saveLocation({ manaDensity: 100 });
    await fixture.sendLocationEvent({
      eventType: 'schedule-event',
      data: { delayInSeconds: 10, event: { eventType: 'reduce-mana-density', data: { amount: 20 } } },
    });
    fixture.advanceTime(10);
    await fixture.sendCharacterEvent({ eventType: 'density-halve-spell', data: { locationId: '0' } });
    expect(await fixture.getLocation()).containDeep({ manaDensity: 40 });
  });

  // TODO(aeremin): add more tests demonstrating fixture interaction
});
