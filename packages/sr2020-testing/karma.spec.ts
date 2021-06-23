import { TestFixture } from './fixture';

import { getAllFeatures } from '@alice/sr2020-model-engine/scripts/character/features';

describe('Karma events', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Can earn karma', async () => {
    await fixture.saveCharacter();
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'earnKarma',
      data: { amount: 30 },
    });

    expect(baseModel.karma).toMatchObject({
      available: 30,
      cycleLimit: 4970,
    });
  });

  it('Can earn karma from QR', async () => {
    await fixture.saveCharacter();

    await fixture.saveQrCode();
    await fixture.sendQrCodeEvent({ eventType: 'writeKarmaSource', data: { amount: 40, charges: 10 } });

    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'scanQr',
      data: { qrCode: '0' },
    });

    expect(baseModel.karma).toMatchObject({
      available: 40,
      cycleLimit: 4960,
    });

    {
      const { baseModel } = await fixture.getQrCode();
      expect(baseModel.usesLeft).toEqual(9);
    }
  });

  it('Using abilities gives karma', async () => {
    await fixture.saveCharacter();
    await fixture.saveLocation({ modelId: '7' });
    await fixture.addCharacterFeature('trollton');
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'useAbility',
      data: { id: 'trollton', location: { id: '7', manaLevel: 0 } },
    });

    expect(baseModel.karma.available).toBe(2.5);
  });

  it('Casting spells gives karma', async () => {
    await fixture.saveCharacter();
    await fixture.saveLocation({ modelId: '7' });
    await fixture.addCharacterFeature('ground-heal');
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'ground-heal', power: 1, location: { id: '7', manaLevel: 0 } },
    });

    expect(baseModel.karma.available).toBe(1.5);
  });

  it('Can not earn more karma than cycle cap', async () => {
    await fixture.saveCharacter();

    await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });
    const { baseModel } = await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 4999 } });

    expect(baseModel.karma).toMatchObject({
      available: 5000,
      cycleLimit: 0,
    });
  });

  it('Can continue earning after cycle reset', async () => {
    await fixture.saveCharacter();

    await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });
    await fixture.sendCharacterEvent({ eventType: 'newLargeCycle', data: {} });
    const { baseModel } = await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 4999 } });

    expect(baseModel.karma).toMatchObject({
      available: 5000,
      cycleLimit: 0,
    });
  });

  it('Can not earn more than game limit', async () => {
    await fixture.saveCharacter();

    for (let i = 0; i < 10; ++i) {
      await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 900 } });
      await fixture.sendCharacterEvent({ eventType: 'newLargeCycle', data: {} });
    }

    expect((await fixture.getCharacter()).baseModel.karma).toMatchObject({
      available: 5000,
    });
  });

  it('Can buy feature for karma', async () => {
    await fixture.saveCharacter({ karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'buyFeatureForKarma', data: { id: 'arch-rigger' } });
    const riggerFeature = getAllFeatures().find((f) => f.id == 'arch-rigger')!;
    expect(workModel.karma.available).toBe(1000 - riggerFeature.karmaCost);
    expect(workModel.karma.spent).toBe(riggerFeature.karmaCost);
    expect(workModel.karma.spentOnPassives).toBe(riggerFeature.karmaCost);
    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'arch-rigger' }));
  });

  it('Can get feature discount', async () => {
    await fixture.saveCharacter({ metarace: 'meta-dwarf', karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    await fixture.addCharacterFeature('arch-rigger');
    await fixture.addCharacterFeature('implant-install');
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'buyFeatureForKarma', data: { id: 'auto-doc-1' } });
    const feature = getAllFeatures().find((f) => f.id == 'auto-doc-1')!;
    expect(workModel.karma.available).toBe(1000 - 0.9 * feature.karmaCost);
    expect(workModel.karma.spent).toBe(0.9 * feature.karmaCost);
    expect(workModel.karma.spentOnPassives).toBe(0.9 * feature.karmaCost);
    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'auto-doc-1' }));
  });

  it('Can buy feature for karma from QR', async () => {
    await fixture.saveCharacter({ karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    await fixture.saveQrCode();
    await fixture.sendQrCodeEvent({ eventType: 'writeBuyableFeature', data: { id: 'arch-rigger' } });

    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '0' } });
    const riggerFeature = getAllFeatures().find((f) => f.id == 'arch-rigger')!;
    expect(workModel.karma.available).toBe(1000 - riggerFeature.karmaCost);
    expect(workModel.karma.spent).toBe(riggerFeature.karmaCost);
    expect(workModel.karma.spentOnPassives).toBe(riggerFeature.karmaCost);
    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'arch-rigger' }));
  });

  it('Can not buy feature if not enough karma', async () => {
    await fixture.saveCharacter({ karma: { available: 10, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'buyFeatureForKarma', data: { id: 'arch-rigger' } });
    expect(message).toContain('Недостаточно кармы');
  });

  it('Can not buy feature if already have it', async () => {
    await fixture.saveCharacter({ karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    await fixture.addCharacterFeature('arch-rigger');
    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'buyFeatureForKarma', data: { id: 'arch-rigger' } });
    expect(message).toContain('уже есть');
  });

  it('Can not buy feature if no such feature', async () => {
    await fixture.saveCharacter({ karma: { available: 10, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const message = await fixture.sendCharacterEventExpectingError({
      eventType: 'buyFeatureForKarma',
      data: { id: 'super-awesome-feature' },
    });
    expect(message).toContain('не существует');
  });

  it('Can not buy feature if prerequisites not satisfied', async () => {
    await fixture.saveCharacter({ karma: { available: 10, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const message = await fixture.sendCharacterEventExpectingError({
      eventType: 'buyFeatureForKarma',
      data: { id: 'arch-hackerman-technomancer-boost' },
    });
    expect(message).toContain('Не удовлетворены пререквизиты');
  });
});
