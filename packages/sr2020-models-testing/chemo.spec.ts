import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

describe('Chemo events', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Elements expiration', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'iodomarin' } });
      expect(workModel.chemo.concentration).to.containDeep({ argon: 0, iodine: 200, junius: 100, custodium: 100 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'argo' } });
      expect(workModel.chemo.concentration).to.containDeep({ argon: 200, iodine: 300, junius: 200, custodium: 100 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      // It was just 30 minutes from the last iodine, junius and custodium intake, but 1h from the first - so they will be removed.
      // But argon must stay.
      const { workModel } = await fixture.getCharacter();
      expect(workModel.chemo.concentration).to.containDeep({ argon: 200, iodine: 0, junius: 0, custodium: 0 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      // Now argon also goes away.
      const { workModel } = await fixture.getCharacter();
      expect(workModel.chemo.concentration).to.containDeep({ argon: 0, iodine: 0, junius: 0, custodium: 0 });
    }
  });
});
