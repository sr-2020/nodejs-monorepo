import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Rigger abilities', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Connect and disconnect to body', async () => {
    await fixture.saveCharacter({ modelId: '1' });

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });
    await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'rcc-beta' } }, 2);

    {
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.analyzedBody).not.ok();
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'analyzeBody', data: { targetCharacterId: '2' } }, 1);
      expect(workModel.analyzedBody).ok();
      // TODO(aeremin): Implement
      expect(workModel.analyzedBody?.essence).to.equal(666);
      expect(workModel.analyzedBody?.implants).to.containDeep([{ id: 'rcc-beta' }]);
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'disconnectFromBody', data: {} }, 1);
      expect(workModel.analyzedBody).not.ok();
    }
  });
});
