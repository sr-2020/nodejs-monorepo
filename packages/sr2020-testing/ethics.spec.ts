import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Ethic events', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Go to the next level with side-effect', async () => {
    await fixture.saveCharacter();
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'ethicTrigger',
      data: { id: '30df06cb-5d9e-11ea-b518-e5c6714f0b78' },
    });
    expect(baseModel).containDeep({
      ethic: {
        state: [
          { scale: 'violence', value: 1 },
          { scale: 'control', value: 0 },
          { scale: 'individualism', value: 0 },
          { scale: 'mind', value: 1 },
        ],
      },
    });
  });

  it('Go to the previous level without side-effect', async () => {
    await fixture.saveCharacter();
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'ethicTrigger',
      data: { id: '30df06cc-5d9e-11ea-b518-e5c6714f0b78' },
    });
    expect(baseModel).containDeep({
      ethic: {
        state: [
          { scale: 'violence', value: -1 },
          { scale: 'control', value: 0 },
          { scale: 'individualism', value: 0 },
          { scale: 'mind', value: 0 },
        ],
      },
    });
  });

  it('Get a crysis and resolve it', async () => {
    await fixture.saveCharacter();
    {
      // Break a principle, get a crysis
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df06ca-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 0 },
            { scale: 'control', value: 0 },
            { scale: 'individualism', value: 0 },
            { scale: 'mind', value: 0 },
          ],
          trigger: [{ id: '3104de44-5d9e-11ea-b518-e5c6714f0b78', kind: 'crysis' }],
        },
      });
    }
    {
      // Do an action, shift to another level, but crysis stays with you
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df06cc-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: -1 },
            { scale: 'control', value: 0 },
            { scale: 'individualism', value: 0 },
            { scale: 'mind', value: 0 },
          ],
          trigger: [{ id: '3104de44-5d9e-11ea-b518-e5c6714f0b78', kind: 'crysis' }],
        },
      });
    }
    {
      // Resolve it crysis, it changes stats and goes away
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '3104de44-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: -1 },
            { scale: 'control', value: -1 },
            { scale: 'individualism', value: 0 },
            { scale: 'mind', value: -1 },
          ],
        },
      });
      expect(baseModel).not.containDeep({
        ethic: { trigger: [{ id: '3104de44-5d9e-11ea-b518-e5c6714f0b78', kind: 'crysis' }] },
      });
    }
  });

  it('Can not have max on many scales', async () => {
    await fixture.saveCharacter();
    {
      // Set to pre-max value
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicSet',
        data: { violence: 3, control: -3, individualism: 2, mind: -3 },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 3 },
            { scale: 'control', value: -3 },
            { scale: 'individualism', value: 2 },
            { scale: 'mind', value: -3 },
          ],
        },
      });
    }
    {
      // Get to max (ok, min) on mind
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df070e-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 3 },
            { scale: 'control', value: -3 },
            { scale: 'individualism', value: 2 },
            { scale: 'mind', value: -4 },
          ],
        },
      });
    }
    {
      // Get to max on violence
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df06d4-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 4 },
            { scale: 'control', value: -3 },
            { scale: 'individualism', value: 2 },
            { scale: 'mind', value: -3 },
          ],
        },
      });
    }
  });

  it('Add and remove from ethic group', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // Discourse monger
    await fixture.addCharacterFeature('dgroup-add', 1);
    await fixture.addCharacterFeature('dgroup-exclude', 1);

    await fixture.saveCharacter({ modelId: '2' }); // Acolyte

    // Prepare locus
    {
      await fixture.saveQrCode({ modelId: '3' }); // Locus
      const { baseModel } = await fixture.sendQrCodeEvent(
        { eventType: 'createLocusQr', data: { groupId: 'russian-orthodox-church', numberOfUses: 1 } },
        3,
      );
      expect(baseModel.usesLeft).to.equal(1);
      expect(baseModel.type).to.equal('locus');
    }

    // Add to the group
    {
      await fixture.useAbility({ id: 'dgroup-add', locusId: '3', targetCharacterId: '2' }, 1);
      const acolyte = await fixture.getCharacter(2);
      expect(acolyte.baseModel.ethic.groups).to.deepEqual(['russian-orthodox-church']);
      expect(acolyte.baseModel.passiveAbilities).to.containDeep([{ id: 'churched' }, { id: 'russian-orthodox-church' }]);

      const locus = await fixture.getQrCode(3);
      expect(locus.baseModel.usesLeft).to.equal(0);
      expect(locus.baseModel.type).to.equal('locus');
    }

    // Change ethic values - loses ability
    {
      await fixture.sendCharacterEvent({ eventType: 'ethicSet', data: { violence: 0, control: 0, individualism: 3, mind: 0 } }, 2);
      const acolyte = await fixture.getCharacter(2);
      expect(acolyte.baseModel.ethic.groups).to.deepEqual(['russian-orthodox-church']);
      expect(acolyte.baseModel.passiveAbilities).not.to.containDeep([{ id: 'churched' }]);
      expect(acolyte.baseModel.passiveAbilities).to.containDeep([{ id: 'russian-orthodox-church' }]);
    }

    // Remove from the group
    {
      await fixture.useAbility({ id: 'dgroup-exclude', locusId: '3', targetCharacterId: '2' }, 1);
      const acolyte = await fixture.getCharacter(2);
      expect(acolyte.baseModel.ethic.groups).to.be.empty();
      expect(acolyte.baseModel.passiveAbilities).to.be.empty();

      const locus = await fixture.getQrCode(3);
      expect(locus.baseModel.usesLeft).to.equal(0);
      expect(locus.baseModel.type).to.equal('locus');
    }
  });

  it('Add and remove from ethic group - Guru + Inquisitor', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // Discourse monger
    await fixture.addCharacterFeature('dm-add-guru', 1);
    await fixture.addCharacterFeature('dm-exclude-inq-2', 1);

    await fixture.saveCharacter({ modelId: '2' }); // Acolyte

    // Prepare locus
    {
      await fixture.saveQrCode({ modelId: '3' }); // Locus
      const { baseModel } = await fixture.sendQrCodeEvent(
        { eventType: 'createLocusQr', data: { groupId: 'russian-orthodox-church', numberOfUses: 1 } },
        3,
      );
      expect(baseModel.usesLeft).to.equal(1);
      expect(baseModel.type).to.equal('locus');
    }

    // Add to the group
    {
      await fixture.useAbility({ id: 'dm-add-guru', locusId: '3', targetCharacterId: '2' }, 1);
      const locus = await fixture.getQrCode(3);
      expect(locus.baseModel.usesLeft).to.equal(1);
      expect(locus.baseModel.type).to.equal('locus');
    }

    // Remove from the group
    {
      await fixture.useAbility({ id: 'dm-exclude-inq-2', locusId: '3', targetCharacterId: '2' }, 1);
      const locus = await fixture.getQrCode(3);
      expect(locus.baseModel.usesLeft).to.equal(3);
      expect(locus.baseModel.type).to.equal('locus');
    }
  });

  it('Charge locus', async () => {
    await fixture.saveCharacter(); // Discourse monger
    await fixture.addCharacterFeature('dm-inc-counter');

    await fixture.saveQrCode({ modelId: '3' }); // Locus
    await fixture.sendQrCodeEvent({ eventType: 'createLocusQr', data: { groupId: 'russian-orthodox-church', numberOfUses: 8 } }, 3);

    await fixture.saveQrCode({ modelId: '5' }); // Charge
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'locus-charge' } }, 5);

    await fixture.useAbility({ id: 'dm-inc-counter', locusId: '3', qrCode: '5' });

    const locus = await fixture.getQrCode(3);
    expect(locus.baseModel.type).equal('locus');
    expect(locus.baseModel.usesLeft).equal(9);

    const emptyCharge = await fixture.getQrCode(5);
    expect(emptyCharge.baseModel.type).equal('box');
    expect(emptyCharge.baseModel.usesLeft).equal(0);
  });
});
