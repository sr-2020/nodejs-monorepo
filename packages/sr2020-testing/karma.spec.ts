import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
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

    expect(baseModel.karma).to.containDeep({
      available: 30,
      cycleLimit: 270,
    });
  });

  it('Can earn karma from QR', async () => {
    await fixture.saveCharacter();

    await fixture.saveQrCode();
    await fixture.sendQrCodeEvent({ eventType: 'writeKarmaSource', data: { amount: 40 } });

    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'scanQr',
      data: { qrCode: '0' },
    });

    expect(baseModel.karma).to.containDeep({
      available: 40,
      cycleLimit: 260,
    });
  });

  it('Using abilities gives karma', async () => {
    await fixture.saveCharacter();
    await fixture.saveLocation({ modelId: '7' });
    await fixture.addCharacterFeature('trollton');
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'useAbility',
      data: { id: 'trollton', location: { id: '7', manaLevel: 0 } },
    });

    expect(baseModel.karma.available).to.equal(5);
  });

  it('Casting spells gives karma', async () => {
    await fixture.saveCharacter();
    await fixture.saveLocation({ modelId: '7' });
    await fixture.addCharacterFeature('ground-heal');
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'ground-heal', power: 1, location: { id: '7', manaLevel: 0 } },
    });

    expect(baseModel.karma.available).to.equal(4);
  });

  it('Can not earn more karma than cycle cap', async () => {
    await fixture.saveCharacter();

    await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });
    const { baseModel } = await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 255 } });

    expect(baseModel.karma).to.containDeep({
      available: 300,
      cycleLimit: 0,
    });
  });

  it('Can continue earning after cycle reset', async () => {
    await fixture.saveCharacter();

    await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });
    await fixture.sendCharacterEvent({ eventType: 'newLargeCycle', data: {} });
    const { baseModel } = await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 255 } });

    expect(baseModel.karma).to.containDeep({
      available: 310,
      cycleLimit: 45,
    });
  });

  it('Can not earn more than game limit', async () => {
    await fixture.saveCharacter();

    for (let i = 0; i < 10; ++i) {
      await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 90 } });
      await fixture.sendCharacterEvent({ eventType: 'newLargeCycle', data: {} });
    }

    expect((await fixture.getCharacter()).baseModel.karma).to.containDeep({
      available: 800,
    });
  });

  it('Can buy feature for karma', async () => {
    await fixture.saveCharacter({ karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'buyFeatureForKarma', data: { id: 'arch-rigger' } });
    const riggerFeature = getAllFeatures().find((f) => f.id == 'arch-rigger')!;
    expect(workModel.karma.available).to.equal(1000 - riggerFeature.karmaCost);
    expect(workModel.karma.spent).to.equal(riggerFeature.karmaCost);
    expect(workModel.karma.spentOnPassives).to.equal(riggerFeature.karmaCost);
    expect(workModel.passiveAbilities).to.containDeep([{ id: 'arch-rigger' }]);
  });

  it('Can get feature discount', async () => {
    await fixture.saveCharacter({ metarace: 'meta-norm', karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    await fixture.addCharacterFeature('arch-rigger-medic');
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'buyFeatureForKarma', data: { id: 'auto-doc-1' } });
    const feature = getAllFeatures().find((f) => f.id == 'auto-doc-1')!;
    expect(workModel.karma.available).to.equal(1000 - 0.9 * feature.karmaCost);
    expect(workModel.karma.spent).to.equal(0.9 * feature.karmaCost);
    expect(workModel.karma.spentOnPassives).to.equal(0.9 * feature.karmaCost);
    expect(workModel.passiveAbilities).to.containDeep([{ id: 'auto-doc-1' }]);
  });

  it('Can buy feature for karma from QR', async () => {
    await fixture.saveCharacter({ karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    await fixture.saveQrCode();
    await fixture.sendQrCodeEvent({ eventType: 'writeBuyableFeature', data: { id: 'arch-rigger' } });

    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '0' } });
    const riggerFeature = getAllFeatures().find((f) => f.id == 'arch-rigger')!;
    expect(workModel.karma.available).to.equal(1000 - riggerFeature.karmaCost);
    expect(workModel.karma.spent).to.equal(riggerFeature.karmaCost);
    expect(workModel.karma.spentOnPassives).to.equal(riggerFeature.karmaCost);
    expect(workModel.passiveAbilities).to.containDeep([{ id: 'arch-rigger' }]);
  });

  it('Can not buy feature if not enough karma', async () => {
    await fixture.saveCharacter({ karma: { available: 10, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'buyFeatureForKarma', data: { id: 'arch-rigger' } });
    expect(message).to.containEql('Недостаточно кармы');
  });

  it('Can not buy feature if already have it', async () => {
    await fixture.saveCharacter({ karma: { available: 1000, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    await fixture.addCharacterFeature('arch-rigger');
    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'buyFeatureForKarma', data: { id: 'arch-rigger' } });
    expect(message).to.containEql('уже есть');
  });

  it('Can not buy feature if no such feature', async () => {
    await fixture.saveCharacter({ karma: { available: 10, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const message = await fixture.sendCharacterEventExpectingError({
      eventType: 'buyFeatureForKarma',
      data: { id: 'super-awesome-feature' },
    });
    expect(message).to.containEql('не существует');
  });

  it('Can not buy feature if prerequisites not satisfied', async () => {
    await fixture.saveCharacter({ karma: { available: 10, spent: 0, spentOnPassives: 0, cycleLimit: 0 } });
    const message = await fixture.sendCharacterEventExpectingError({
      eventType: 'buyFeatureForKarma',
      data: { id: 'arch-rigger-pilot' },
    });
    expect(message).to.containEql('Не удовлетворены пререквизиты');
  });
});
