import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';
import { kAllChemoEffects } from '@sr2020/sr2020-models/scripts/character/chemo';

describe('Chemo events', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('All effects are present', () => {
    for (const element of ['opium', 'iodine', 'teqgel', 'argon', 'radium', 'junius', 'custodium', 'polonium']) {
      for (const level of ['base', 'super', 'uber', 'crysis']) {
        const entry = kAllChemoEffects.find((it) => it.level == level && it.element == element);
        expect(entry).not.undefined();
      }
    }
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

  it('Multi opium', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'watson' } });
      expect(workModel.mentalAttackBonus).to.equal(3);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam' } });
      expect(workModel.mentalAttackBonus).to.equal(5);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.mentalAttackBonus).to.equal(5);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.mentalAttackBonus).to.equal(0);
    }
  });
});
