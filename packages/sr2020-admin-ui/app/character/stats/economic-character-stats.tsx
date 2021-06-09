import React from 'react';
import { Billing, Discounts } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/components/wide-button';

export class EconomicCharacterStats extends React.Component<{ billing: Billing; discounts: Discounts }> {
  render() {
    return (
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
                <td>{this.props.billing.stockGainPercentage}</td>
              </tr>
              <tr>
                <th>Переводы анонимны</th>
                <td>billing.anonymous</td>
                <td>{this.props.billing.anonymous}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на оружие и броню</th>
                <td>discounts.weaponsArmor</td>
                <td>{this.props.discounts.weaponsArmor}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на все</th>
                <td>discounts.everything</td>
                <td>{this.props.discounts.everything}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
