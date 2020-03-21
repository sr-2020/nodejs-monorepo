import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Mentalistic events', function() {
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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'luke-i-am-your-father' } }, 1);
    const attacker = (await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: 'luke-i-am-your-father' } }, 1)).workModel;

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId } }, 2);

    expect(fixture.getCharacterNotifications(1)).to.deepEqual([{ title: 'Успех!', body: 'Ваша способность подействовала.' }]);
    expect(fixture.getCharacterNotifications(2)).to.deepEqual([
      {
        title: 'Провал!',
        body: 'Ментальная атака подействовала, выполняйте написанное.',
      },
    ]);
  });

  it('Use mental ability - attacker fail', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3 });
    await fixture.saveCharacter({ modelId: '2', charisma: 0, mentalDefenceBonus: 100 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'luke-i-am-your-father' } }, 1);
    const attacker = (await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: 'luke-i-am-your-father' } }, 1)).workModel;

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId } }, 2);

    expect(fixture.getCharacterNotifications(1)).to.deepEqual([{ title: 'Провал!', body: 'Цель защитилась от вашего воздействия.' }]);
    expect(fixture.getCharacterNotifications(2)).to.deepEqual([
      {
        title: 'Успех!',
        body: 'Вы заблокировали ментальную атаку.',
      },
    ]);
  });

  it('Use mental ability twice', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3 });
    await fixture.saveCharacter({ modelId: '2', charisma: 0 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'luke-i-am-your-father' } }, 1);
    const attacker = (await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: 'luke-i-am-your-father' } }, 1)).workModel;

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId } }, 2);

    const resp = await fixture.client
      .post(`/character/model/2`)
      .send({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId } })
      .expect(400);
    expect(resp.body.error.message).containEql('пустышка');
  });

  it('Use mental ability too late', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 3 });
    await fixture.saveCharacter({ modelId: '2', charisma: 0 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'luke-i-am-your-father' } }, 1);
    const attacker = (await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: 'luke-i-am-your-father' } }, 1)).workModel;

    fixture.advanceTime(1000);

    const resp = await fixture.client
      .post(`/character/model/2`)
      .send({ eventType: 'scanQr', data: { qrCode: attacker.mentalQrId } })
      .expect(400);
    expect(resp.body.error.message).containEql('уже закончилось');
  });
});
