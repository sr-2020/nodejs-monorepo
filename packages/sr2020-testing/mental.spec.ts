import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

describe('Mentalistic events', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Use mental ability - attacker success', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3, mentalAttackBonus: 100 });
    await fixture.saveCharacter({ modelId: '2', charisma: 0 });
    await fixture.addCharacterFeature('luke-i-am-your-father', 1);
    const attacker = (await fixture.useAbility({ id: 'luke-i-am-your-father' }, 1)).workModel;

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId.toString() } }, 2);

    expect(fixture.getCharacterNotifications(1)).to.deepEqual([{ title: 'Успех!', body: 'Ваша способность подействовала.' }]);
    expect(fixture.getCharacterNotifications(2)).to.deepEqual([
      {
        title: 'Ментальное воздействие',
        body: 'Ты выполняешь любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.',
      },
    ]);
  });

  it('Use mental ability - attacker success - disables active abilities', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3, mentalAttackBonus: 100 });
    await fixture.addCharacterFeature('fly-you-fool', 1);

    await fixture.saveCharacter({ modelId: '2', charisma: 0 });
    await fixture.addCharacterFeature('kokkoro-backup', 2);

    const attacker = (await fixture.useAbility({ id: 'fly-you-fool' }, 1)).workModel;
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId.toString() } }, 2);

    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'useAbility', data: { id: 'kokkoro-backup' } }, '2');
    expect(message).to.containEql('Сейчас вы не можете пользоваться активными способностями!');
  });

  it('Use mental ability - attacker fail', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3 });
    await fixture.saveCharacter({ modelId: '2', charisma: 0, mentalDefenceBonus: 100 });
    await fixture.addCharacterFeature('luke-i-am-your-father', 1);
    const attacker = (await fixture.useAbility({ id: 'luke-i-am-your-father' }, 1)).workModel;

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId.toString() } }, 2);

    expect(fixture.getCharacterNotifications(1)).to.deepEqual([{ title: 'Провал!', body: 'Цель защитилась от вашего воздействия.' }]);
    expect(fixture.getCharacterNotifications(2)).to.deepEqual([
      {
        title: 'Головная боль',
        body: 'У вас болит голова, но, наверное, это скоро пройдет.',
      },
    ]);
  });

  it('Use mental ability twice', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3 });
    await fixture.saveCharacter({ modelId: '2', charisma: 0 });
    await fixture.addCharacterFeature('luke-i-am-your-father', 1);
    const attacker = (await fixture.useAbility({ id: 'luke-i-am-your-father' }, 1)).workModel;

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId.toString() } }, 2);

    const message = await fixture.sendCharacterEventExpectingError(
      {
        eventType: 'scanQr',
        data: { qrCode: attacker.mentalQrId.toString() },
      },
      '2',
    );
    expect(message).containEql('пустышка');
  });

  it('Use mental ability too late', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3 });
    await fixture.saveCharacter({ modelId: '2', charisma: 0 });
    await fixture.addCharacterFeature('luke-i-am-your-father', 1);
    const attacker = (await fixture.useAbility({ id: 'luke-i-am-your-father' }, 1)).workModel;

    await fixture.advanceTime(duration(1000, 'seconds'));

    const message = await fixture.sendCharacterEventExpectingError(
      {
        eventType: 'scanQr',
        data: { qrCode: attacker.mentalQrId.toString() },
      },
      '2',
    );
    expect(message).containEql('уже закончилось');
  });

  it('I do not trust anybody', async () => {
    await fixture.saveCharacter({ mentalDefenceBonus: 3 });
    await fixture.addCharacterFeature('i-dont-trust-anybody');
    let { workModel } = await fixture.useAbility({ id: 'i-dont-trust-anybody' });
    expect(workModel.mentalDefenceBonus).to.equal(11);
    expect(workModel.activeAbilities[0].cooldownUntil).to.equal(40 * 60 * 1000);
    await fixture.advanceTime(duration(29, 'minutes'));
    expect((await fixture.getCharacter()).workModel.mentalDefenceBonus).to.equal(11);
    await fixture.advanceTime(duration(1, 'minute'));
    expect((await fixture.getCharacter()).workModel.mentalDefenceBonus).to.equal(3);

    // Check on-cooldown behaviour
    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'useAbility', data: { id: 'i-dont-trust-anybody' } });
    expect(message).containEql('кулдаун');

    await fixture.advanceTime(duration(30, 'minutes'));

    workModel = (await fixture.useAbility({ id: 'i-dont-trust-anybody' })).workModel;
    expect(workModel.activeAbilities[0].cooldownUntil).to.equal((29 + 1 + 30 + 40) * 60 * 1000);
  });

  it('You do not trust anybody', async () => {
    await fixture.saveCharacter({ modelId: '1', mentalDefenceBonus: 3 });
    await fixture.saveCharacter({ modelId: '2', mentalDefenceBonus: 2 });
    await fixture.addCharacterFeature('you-dont-trust-anybody', 1);
    const { workModel } = await fixture.useAbility({ id: 'you-dont-trust-anybody', targetCharacterId: '2' }, 1);
    expect(workModel.mentalDefenceBonus).to.equal(3);
    expect((await fixture.getCharacter(2)).workModel.mentalDefenceBonus).to.equal(10);
    await fixture.advanceTime(duration(29, 'minutes'));
    expect((await fixture.getCharacter(2)).workModel.mentalDefenceBonus).to.equal(10);
    await fixture.advanceTime(duration(1, 'minute'));
    expect((await fixture.getCharacter(2)).workModel.mentalDefenceBonus).to.equal(2);
  });
});
