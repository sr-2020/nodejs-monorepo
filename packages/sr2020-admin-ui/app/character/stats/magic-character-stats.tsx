import React from 'react';
import { MagicStats } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/components/wide-button';

export class MagicCharactersStats extends React.Component<{ magicStats: MagicStats }> {
  render() {
    return (
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
                <td> {this.props.magicStats.feedbackMultiplier}</td>
              </tr>
              <tr>
                <th>Коэффициент восстановления Магии</th>
                <td>magicStats.recoverySpeedMultiplier</td>
                <td>{this.props.magicStats.recoverySpeedMultiplier}</td>
              </tr>
              <tr>
                <th>Коэффициент Сопротивления Духов</th>
                <td>magicStats.spiritResistanceMultiplier</td>
                <td>{this.props.magicStats.spiritResistanceMultiplier}</td>
              </tr>
              <tr>
                <th>Коэффициент Чтения Астральных Следов</th>
                <td>magicStats.auraReadingMultiplier</td>
                <td>{this.props.magicStats.auraReadingMultiplier}</td>
              </tr>
              <tr>
                <th>Коэффициент Отчетливости Астральных Следов</th>
                <td>magicStats.auraMarkMultiplier</td>
                <td>{this.props.magicStats.auraMarkMultiplier}</td>
              </tr>
              <tr>
                <th>Аура</th>
                <td>magicStats.aura</td>
                <td>{this.props.magicStats.aura}</td>
              </tr>
              <tr>
                <th>Маска ауры</th>
                <td>magicStats.auraMask</td>
                <td>{this.props.magicStats.auraMask}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
