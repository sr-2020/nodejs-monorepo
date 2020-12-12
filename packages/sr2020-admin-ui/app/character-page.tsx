import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { getCharacter } from '@alice/sr2020-admin-ui/app/models-manager-api';
import { Accordion, Button, Card, Table } from 'react-bootstrap';

export class WideButton extends React.Component {
  render() {
    return (
      <Button block variant="info" {...this.props}>
        {this.props.children}
      </Button>
    );
  }
}

export class CharacterPage extends React.Component<{ id: string }, Sr2020Character> {
  state: Sr2020Character;

  componentDidMount() {
    getCharacter(this.props.id).then((c) => {
      this.setState(c);
    });
  }

  render() {
    if (!this.state) return <div>Загрузка...</div>;
    return (
      <div>
        <Card>
          <Card.Body>
            Персонаж {this.state.name} (model ID = {this.state.modelId}), состояние на{' '}
            {new Date(this.state.timestamp).toLocaleString('ru-RU')}
            <Table size="sm">
              <tbody>
                <tr>
                  <th>Метараса</th>
                  <td>metarace</td>
                  <td> {this.state.metarace}</td>
                </tr>
                <tr>
                  <th>Состояние физического тела</th>
                  <td>healthState</td>
                  <td> {this.state.healthState}</td>
                </tr>
                <tr>
                  <th>Максимальные хиты</th>
                  <td>maxHp</td>
                  <td> {this.state.maxHp}</td>
                </tr>
                <tr>
                  <th>Магия</th>
                  <td>magic</td>
                  <td>{this.state.magic}</td>
                </tr>
                <tr>
                  <th>Strength</th>
                  <td>strength</td>
                  <td>{this.state.strength}</td>
                </tr>
                <tr>
                  <th>Body</th>
                  <td>body</td>
                  <td>{this.state.body}</td>
                </tr>
                <tr>
                  <th>Интеллект</th>
                  <td>intelligence</td>
                  <td>{this.state.intelligence}</td>
                </tr>
                <tr>
                  <th>Резонанс</th>
                  <td>resonance</td>
                  <td>{this.state.resonance}</td>
                </tr>
                <tr>
                  <th>Depth</th>
                  <td>depth</td>
                  <td>{this.state.depth}</td>
                </tr>
                <tr>
                  <th>Харизма</th>
                  <td>charisma</td>
                  <td>{this.state.charisma}</td>
                </tr>
                <tr>
                  <th>Бонус к ментальной атаке</th>
                  <td>mentalAttackBonus</td>
                  <td>{this.state.mentalAttackBonus}</td>
                </tr>
                <tr>
                  <th>Бонус к ментальной защите</th>
                  <td>mentalDefenceBonus</td>
                  <td>{this.state.mentalDefenceBonus}</td>
                </tr>
                <tr>
                  <th>Матричное состояние</th>
                  <td>matrixHp</td>
                  <td> {this.state.matrixHp}</td>
                </tr>
                <tr>
                  <th>Максимальное время в VR</th>
                  <td>maxTimeInVr</td>
                  <td>{this.state.maxTimeInVr}</td>
                </tr>
                <tr>
                  <th>Количество слотов под импланты в теле</th>
                  <td>implantsBodySlots</td>
                  <td> {this.state.implantsBodySlots}</td>
                </tr>
                <tr>
                  <th>Сопротивление вырезанию имплантов</th>
                  <td>implantsRemovalResistance</td>
                  <td> {this.state.implantsRemovalResistance}</td>
                </tr>
              </tbody>
            </Table>
            <Accordion>
              <Accordion.Toggle as={WideButton} eventKey="0">
                Магические характеристики
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <th>Коэффициент отката</th>
                      <td>magicStats.feedbackMultiplier</td>
                      <td> {this.state.magicStats.feedbackMultiplier}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент восстановления Магии</th>
                      <td>magicStats.recoverySpeedMultiplier</td>
                      <td>{this.state.magicStats.recoverySpeedMultiplier}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент Сопротивления Духов</th>
                      <td>magicStats.spiritResistanceMultiplier</td>
                      <td>{this.state.magicStats.spiritResistanceMultiplier}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент Чтения Астральных Следов</th>
                      <td>magicStats.auraReadingMultiplier</td>
                      <td>{this.state.magicStats.auraReadingMultiplier}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент Отчетливости Астральных Следов</th>
                      <td>magicStats.auraMarkMultiplier</td>
                      <td>{this.state.magicStats.auraMarkMultiplier}</td>
                    </tr>
                    <tr>
                      <th>Аура</th>
                      <td>magicStats.aura</td>
                      <td>{this.state.magicStats.aura}</td>
                    </tr>
                    <tr>
                      <th>Маска ауры</th>
                      <td>magicStats.auraMask</td>
                      <td>{this.state.magicStats.auraMask}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Collapse>
            </Accordion>
            <Accordion>
              <Accordion.Toggle as={WideButton} eventKey="0">
                Хакерские характеристики
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <th>Бонус к резонансу для контроля</th>
                      <td>hacking.resonanceForControlBonus</td>
                      <td>{this.state.hacking.resonanceForControlBonus}</td>
                    </tr>
                    <tr>
                      <th>Максимальное время на хосте</th>
                      <td>hacking.maxTimeAtHost</td>
                      <td>{this.state.hacking.maxTimeAtHost}</td>
                    </tr>
                    <tr>
                      <th>Скорость входа на хост</th>
                      <td>hacking.hostEntrySpeed</td>
                      <td>{this.state.hacking.hostEntrySpeed}</td>
                    </tr>
                    <tr>
                      <th>Конверсия атаки</th>
                      <td>hacking.conversionAttack</td>
                      <td>{this.state.hacking.conversionAttack}</td>
                    </tr>
                    <tr>
                      <th>Конверсия файрвола</th>
                      <td>hacking.conversionFirewall</td>
                      <td>{this.state.hacking.conversionFirewall}</td>
                    </tr>
                    <tr>
                      <th>Конверсия слизи</th>
                      <td>hacking.conversionSleaze</td>
                      <td>{this.state.hacking.conversionSleaze}</td>
                    </tr>
                    <tr>
                      <th>Конверсия датапроцессинга</th>
                      <td>hacking.conversionDataprocessing</td>
                      <td>{this.state.hacking.conversionDataprocessing}</td>
                    </tr>
                    <tr>
                      <th>Число администрируемых хостов</th>
                      <td>hacking.adminHostNumber</td>
                      <td>{this.state.hacking.adminHostNumber}</td>
                    </tr>
                    <tr>
                      <th>Уровень спрайтов</th>
                      <td>hacking.spriteLevel</td>
                      <td>{this.state.hacking.spriteLevel}</td>
                    </tr>
                    <tr>
                      <th>Дополнительные спрайты</th>
                      <td>hacking.additionalSprites</td>
                      <td>{this.state.hacking.additionalSprites}</td>
                    </tr>
                    <tr>
                      <th>Дополнительные бекдоры</th>
                      <td>hacking.additionalBackdoors</td>
                      <td>{this.state.hacking.additionalBackdoors}</td>
                    </tr>
                    <tr>
                      <th>Время жизни бекдоров</th>
                      <td>hacking.backdoorTtl</td>
                      <td>{this.state.hacking.backdoorTtl}</td>
                    </tr>
                    <tr>
                      <th>Дополнительные запросы к контролю</th>
                      <td>hacking.additionalRequests</td>
                      <td>{this.state.hacking.additionalRequests}</td>
                    </tr>
                    <tr>
                      <th>Сопротивление фейдингу</th>
                      <td>hacking.fadingResistance</td>
                      <td>{this.state.hacking.fadingResistance}</td>
                    </tr>
                    <tr>
                      <th>Сопротивление фейдингу для компиляции</th>
                      <td>hacking.compilationFadingResistance</td>
                      <td>{this.state.hacking.compilationFadingResistance}</td>
                    </tr>
                    <tr>
                      <th>Сопротивление биофидбеку</th>
                      <td>hacking.biofeedbackResistance</td>
                      <td>{this.state.hacking.biofeedbackResistance}</td>
                    </tr>
                    <tr>
                      <th>Сопротивление вэриансу</th>
                      <td>hacking.varianceResistance</td>
                      <td>{this.state.hacking.varianceResistance}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Collapse>
            </Accordion>
            <Accordion>
              <Accordion.Toggle as={WideButton} eventKey="0">
                Экономические характеристики
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <th>Безусловный доход в процентах от оборота</th>
                      <td>billing.stockGainPercentage</td>
                      <td>{this.state.billing.stockGainPercentage}</td>
                    </tr>
                    <tr>
                      <th>Переводы анонимны</th>
                      <td>billing.anonymous</td>
                      <td>{this.state.billing.anonymous}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на оружие и броню</th>
                      <td>discounts.weaponsArmor</td>
                      <td>{this.state.discounts.weaponsArmor}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на все</th>
                      <td>discounts.everything</td>
                      <td>{this.state.discounts.everything}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары ares</th>
                      <td>discounts.ares</td>
                      <td>{this.state.discounts.ares}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары aztechnology</th>
                      <td>discounts.aztechnology</td>
                      <td>{this.state.discounts.aztechnology}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары saederKrupp</th>
                      <td>discounts.saederKrupp</td>
                      <td>{this.state.discounts.saederKrupp}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары spinradGlobal</th>
                      <td>discounts.spinradGlobal</td>
                      <td>{this.state.discounts.spinradGlobal}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары neonet1</th>
                      <td>discounts.neonet1</td>
                      <td>{this.state.discounts.neonet1}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары evo</th>
                      <td>discounts.evo</td>
                      <td>{this.state.discounts.evo}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары horizon</th>
                      <td>discounts.horizon</td>
                      <td>{this.state.discounts.horizon}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары wuxing</th>
                      <td>discounts.wuxing</td>
                      <td>{this.state.discounts.wuxing}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары russia</th>
                      <td>discounts.russia</td>
                      <td>{this.state.discounts.russia}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары renraku</th>
                      <td>discounts.renraku</td>
                      <td>{this.state.discounts.renraku}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары mutsuhama</th>
                      <td>discounts.mutsuhama</td>
                      <td>{this.state.discounts.mutsuhama}</td>
                    </tr>
                    <tr>
                      <th>Коэффициент цены на товары shiavase</th>
                      <td>discounts.shiavase</td>
                      <td>{this.state.discounts.shiavase}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Collapse>
            </Accordion>
            <Accordion>
              <Accordion.Toggle as={WideButton} eventKey="0">
                Химота
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <th>Химота Базовый Эффект</th>
                      <td>chemo.baseEffectThreshold</td>
                      <td>{this.state.chemo.baseEffectThreshold}</td>
                    </tr>
                    <tr>
                      <th>Химота Убер Эффект</th>
                      <td>chemo.uberEffectThreshold</td>
                      <td>{this.state.chemo.uberEffectThreshold}</td>
                    </tr>
                    <tr>
                      <th>Химота Супер Эффект</th>
                      <td>chemo.superEffectThreshold</td>
                      <td>{this.state.chemo.superEffectThreshold}</td>
                    </tr>
                    <tr>
                      <th>Химота Кризис</th>
                      <td>chemo.crysisThreshold</td>
                      <td>{this.state.chemo.crysisThreshold}</td>
                    </tr>
                    <tr>
                      <th>Текгель</th>
                      <td>chemo.concentration.teqgel</td>
                      <td>{this.state.chemo.concentration.teqgel}</td>
                    </tr>
                    <tr>
                      <th>Йод</th>
                      <td>chemo.concentration.iodine</td>
                      <td>{this.state.chemo.concentration.iodine}</td>
                    </tr>
                    <tr>
                      <th>Аргон</th>
                      <td>chemo.concentration.argon</td>
                      <td>{this.state.chemo.concentration.argon}</td>
                    </tr>
                    <tr>
                      <th>Радий</th>
                      <td>chemo.concentration.radium</td>
                      <td>{this.state.chemo.concentration.radium}</td>
                    </tr>
                    <tr>
                      <th>Юний</th>
                      <td>chemo.concentration.junius</td>
                      <td>{this.state.chemo.concentration.junius}</td>
                    </tr>
                    <tr>
                      <th>Кустодий</th>
                      <td>chemo.concentration.custodium</td>
                      <td>{this.state.chemo.concentration.custodium}</td>
                    </tr>
                    <tr>
                      <th>Полоний</th>
                      <td>chemo.concentration.polonium</td>
                      <td>{this.state.chemo.concentration.polonium}</td>
                    </tr>
                    <tr>
                      <th>Силикон</th>
                      <td>chemo.concentration.silicon</td>
                      <td>{this.state.chemo.concentration.silicon}</td>
                    </tr>
                    <tr>
                      <th>Магний</th>
                      <td>chemo.concentration.magnium</td>
                      <td>{this.state.chemo.concentration.magnium}</td>
                    </tr>
                    <tr>
                      <th>Хром</th>
                      <td>chemo.concentration.chromium</td>
                      <td>{this.state.chemo.concentration.chromium}</td>
                    </tr>
                    <tr>
                      <th>Опий</th>
                      <td>chemo.concentration.opium</td>
                      <td>{this.state.chemo.concentration.opium}</td>
                    </tr>
                    <tr>
                      <th>Эльба</th>
                      <td>chemo.concentration.elba</td>
                      <td>{this.state.chemo.concentration.elba}</td>
                    </tr>
                    <tr>
                      <th>Барий</th>
                      <td>chemo.concentration.barium</td>
                      <td>{this.state.chemo.concentration.barium}</td>
                    </tr>
                    <tr>
                      <th>Уранус</th>
                      <td>chemo.concentration.uranium</td>
                      <td>{this.state.chemo.concentration.uranium}</td>
                    </tr>
                    <tr>
                      <th>Московий</th>
                      <td>chemo.concentration.moscovium</td>
                      <td>{this.state.chemo.concentration.moscovium}</td>
                    </tr>
                    <tr>
                      <th>Иконий</th>
                      <td>chemo.concentration.iconium</td>
                      <td>{this.state.chemo.concentration.iconium}</td>
                    </tr>
                    <tr>
                      <th>Слюна вампира</th>
                      <td>chemo.concentration.vampirium</td>
                      <td>{this.state.chemo.concentration.vampirium}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Collapse>
            </Accordion>
            <Accordion>
              <Accordion.Toggle as={WideButton} eventKey="0">
                Риггерство
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <th>Модификатор урона при выходе</th>
                      <td>drones.feedbackModifier</td>
                      <td>{this.state.drones.feedbackModifier}</td>
                    </tr>
                    <tr>
                      <th>Максимальная сложность дрона</th>
                      <td>drones.maxDifficulty</td>
                      <td>{this.state.drones.maxDifficulty}</td>
                    </tr>
                    <tr>
                      <th>Максимальное время в дроне</th>
                      <td>drones.maxTimeInside</td>
                      <td>{this.state.drones.maxTimeInside}</td>
                    </tr>
                    <tr>
                      <th>Время восстановления после</th>
                      <td>drones.recoveryTime</td>
                      <td>{this.state.drones.recoveryTime}</td>
                    </tr>
                    <tr>
                      <th>Навык управления медицинскими дронами</th>
                      <td>drones.medicraftBonus</td>
                      <td>{this.state.drones.medicraftBonus}</td>
                    </tr>
                    <tr>
                      <th>Навык управления автодоком</th>
                      <td>drones.autodocBonus</td>
                      <td>{this.state.drones.autodocBonus}</td>
                    </tr>
                    <tr>
                      <th>Навык управления летающими дронами</th>
                      <td>drones.aircraftBonus</td>
                      <td>{this.state.drones.aircraftBonus}</td>
                    </tr>
                    <tr>
                      <th>Навык управления наземными дронами</th>
                      <td>drones.groundcraftBonus</td>
                      <td>{this.state.drones.groundcraftBonus}</td>
                    </tr>
                    <tr>
                      <th>Может работать с биоваром</th>
                      <td>rigging.canWorkWithBioware</td>
                      <td>{this.state.rigging.canWorkWithBioware}</td>
                    </tr>
                    <tr>
                      <th>Способность ставить импланты</th>
                      <td>rigging.implantsBonus</td>
                      <td>{this.state.rigging.implantsBonus}</td>
                    </tr>
                    <tr>
                      <th>Способность ставить моды</th>
                      <td>rigging.tuningBonus</td>
                      <td>{this.state.rigging.tuningBonus}</td>
                    </tr>
                    <tr>
                      <th>Способность рипомена</th>
                      <td>rigging.repomanBonus</td>
                      <td>{this.state.rigging.repomanBonus}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Collapse>
            </Accordion>
            <Accordion>
              <Accordion.Toggle as={WideButton} eventKey="0">
                Эссенс
              </Accordion.Toggle>{' '}
              <Accordion.Collapse eventKey="0">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <th>Итоговый эссенс</th>
                      <td>essence</td>
                      <td>{this.state.essence}</td>
                    </tr>
                    <tr>
                      <th>Максимальный эссенс</th>
                      <td>essenceDetails.max</td>
                      <td>{this.state.essenceDetails.max}</td>
                    </tr>
                    <tr>
                      <th>Занято имплантами</th>
                      <td>essenceDetails.used</td>
                      <td>{this.state.essenceDetails.used}</td>
                    </tr>
                    <tr>
                      <th>Дыра эссенса</th>
                      <td>essenceDetails.gap</td>
                      <td>{this.state.essenceDetails.gap}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Collapse>
            </Accordion>
            <Accordion>
              <Accordion.Toggle as={WideButton} eventKey="0">
                Карма
              </Accordion.Toggle>{' '}
              <Accordion.Collapse eventKey="0">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <th>Доступно</th>
                      <td>karma.available</td>
                      <td>{this.state.karma.available}</td>
                    </tr>
                    <tr>
                      <th>Потрачено</th>
                      <td>karma.spent</td>
                      <td>{this.state.karma.spent}</td>
                    </tr>
                    <tr>
                      <th>Потрачено на пассивки</th>
                      <td>karma.spentOnPassives</td>
                      <td>{this.state.karma.spentOnPassives}</td>
                    </tr>
                    <tr>
                      <th>Лимит на цикл</th>
                      <td>karma.cycleLimit</td>
                      <td>{this.state.karma.cycleLimit}</td>
                    </tr>
                  </tbody>
                </Table>
              </Accordion.Collapse>
            </Accordion>
          </Card.Body>
        </Card>
      </div>
    );
  }
}
