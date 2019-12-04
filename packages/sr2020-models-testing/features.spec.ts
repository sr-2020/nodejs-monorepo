import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Features-related events', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Add and remove magic-3 feature', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.features).length(1);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'magic-3' } });
    c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 2 });
    expect(c.workModel.features).length(0);
  });

  it('Removing non-present feature does nothing', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.features).length(1);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'magic-2' } });
    c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.features).length(1);
  });

  it('Adding feature twice has no effect', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.features).length(1);

    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.features).length(1);
  });
});
