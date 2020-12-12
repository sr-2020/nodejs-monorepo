import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Table } from 'react-bootstrap';

export class BasicCharacterStats extends React.Component<Sr2020Character> {
  render() {
    return (
      <Table size="sm">
        <tbody>
          <tr>
            <th>Метараса</th>
            <td>metarace</td>
            <td> {this.props.metarace}</td>
          </tr>
          <tr>
            <th>Состояние физического тела</th>
            <td>healthState</td>
            <td> {this.props.healthState}</td>
          </tr>
          <tr>
            <th>Максимальные хиты</th>
            <td>maxHp</td>
            <td> {this.props.maxHp}</td>
          </tr>
          <tr>
            <th>Магия</th>
            <td>magic</td>
            <td>{this.props.magic}</td>
          </tr>
          <tr>
            <th>Strength</th>
            <td>strength</td>
            <td>{this.props.strength}</td>
          </tr>
          <tr>
            <th>Body</th>
            <td>body</td>
            <td>{this.props.body}</td>
          </tr>
          <tr>
            <th>Интеллект</th>
            <td>intelligence</td>
            <td>{this.props.intelligence}</td>
          </tr>
          <tr>
            <th>Резонанс</th>
            <td>resonance</td>
            <td>{this.props.resonance}</td>
          </tr>
          <tr>
            <th>Depth</th>
            <td>depth</td>
            <td>{this.props.depth}</td>
          </tr>
          <tr>
            <th>Харизма</th>
            <td>charisma</td>
            <td>{this.props.charisma}</td>
          </tr>
          <tr>
            <th>Бонус к ментальной атаке</th>
            <td>mentalAttackBonus</td>
            <td>{this.props.mentalAttackBonus}</td>
          </tr>
          <tr>
            <th>Бонус к ментальной защите</th>
            <td>mentalDefenceBonus</td>
            <td>{this.props.mentalDefenceBonus}</td>
          </tr>
          <tr>
            <th>Матричное состояние</th>
            <td>matrixHp</td>
            <td> {this.props.matrixHp}</td>
          </tr>
          <tr>
            <th>Максимальное время в VR</th>
            <td>maxTimeInVr</td>
            <td>{this.props.maxTimeInVr}</td>
          </tr>
          <tr>
            <th>Количество слотов под импланты в теле</th>
            <td>implantsBodySlots</td>
            <td> {this.props.implantsBodySlots}</td>
          </tr>
          <tr>
            <th>Сопротивление вырезанию имплантов</th>
            <td>implantsRemovalResistance</td>
            <td> {this.props.implantsRemovalResistance}</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}
