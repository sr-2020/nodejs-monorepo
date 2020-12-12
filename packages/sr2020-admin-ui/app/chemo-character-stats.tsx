import React from 'react';
import { Chemo } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';

export class ChemoCharacterStats extends React.Component<{ chemo: Chemo }> {
  render() {
    return (
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
                <td>{this.props.chemo.baseEffectThreshold}</td>
              </tr>
              <tr>
                <th>Химота Убер Эффект</th>
                <td>chemo.uberEffectThreshold</td>
                <td>{this.props.chemo.uberEffectThreshold}</td>
              </tr>
              <tr>
                <th>Химота Супер Эффект</th>
                <td>chemo.superEffectThreshold</td>
                <td>{this.props.chemo.superEffectThreshold}</td>
              </tr>
              <tr>
                <th>Химота Кризис</th>
                <td>chemo.crysisThreshold</td>
                <td>{this.props.chemo.crysisThreshold}</td>
              </tr>
              <tr>
                <th>Текгель</th>
                <td>chemo.concentration.teqgel</td>
                <td>{this.props.chemo.concentration.teqgel}</td>
              </tr>
              <tr>
                <th>Йод</th>
                <td>chemo.concentration.iodine</td>
                <td>{this.props.chemo.concentration.iodine}</td>
              </tr>
              <tr>
                <th>Аргон</th>
                <td>chemo.concentration.argon</td>
                <td>{this.props.chemo.concentration.argon}</td>
              </tr>
              <tr>
                <th>Радий</th>
                <td>chemo.concentration.radium</td>
                <td>{this.props.chemo.concentration.radium}</td>
              </tr>
              <tr>
                <th>Юний</th>
                <td>chemo.concentration.junius</td>
                <td>{this.props.chemo.concentration.junius}</td>
              </tr>
              <tr>
                <th>Кустодий</th>
                <td>chemo.concentration.custodium</td>
                <td>{this.props.chemo.concentration.custodium}</td>
              </tr>
              <tr>
                <th>Полоний</th>
                <td>chemo.concentration.polonium</td>
                <td>{this.props.chemo.concentration.polonium}</td>
              </tr>
              <tr>
                <th>Силикон</th>
                <td>chemo.concentration.silicon</td>
                <td>{this.props.chemo.concentration.silicon}</td>
              </tr>
              <tr>
                <th>Магний</th>
                <td>chemo.concentration.magnium</td>
                <td>{this.props.chemo.concentration.magnium}</td>
              </tr>
              <tr>
                <th>Хром</th>
                <td>chemo.concentration.chromium</td>
                <td>{this.props.chemo.concentration.chromium}</td>
              </tr>
              <tr>
                <th>Опий</th>
                <td>chemo.concentration.opium</td>
                <td>{this.props.chemo.concentration.opium}</td>
              </tr>
              <tr>
                <th>Эльба</th>
                <td>chemo.concentration.elba</td>
                <td>{this.props.chemo.concentration.elba}</td>
              </tr>
              <tr>
                <th>Барий</th>
                <td>chemo.concentration.barium</td>
                <td>{this.props.chemo.concentration.barium}</td>
              </tr>
              <tr>
                <th>Уранус</th>
                <td>chemo.concentration.uranium</td>
                <td>{this.props.chemo.concentration.uranium}</td>
              </tr>
              <tr>
                <th>Московий</th>
                <td>chemo.concentration.moscovium</td>
                <td>{this.props.chemo.concentration.moscovium}</td>
              </tr>
              <tr>
                <th>Иконий</th>
                <td>chemo.concentration.iconium</td>
                <td>{this.props.chemo.concentration.iconium}</td>
              </tr>
              <tr>
                <th>Слюна вампира</th>
                <td>chemo.concentration.vampirium</td>
                <td>{this.props.chemo.concentration.vampirium}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
