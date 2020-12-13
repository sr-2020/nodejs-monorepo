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
              <tr>
                <th>Коэффициент цены на товары ares</th>
                <td>discounts.ares</td>
                <td>{this.props.discounts.ares}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары aztechnology</th>
                <td>discounts.aztechnology</td>
                <td>{this.props.discounts.aztechnology}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары saederKrupp</th>
                <td>discounts.saederKrupp</td>
                <td>{this.props.discounts.saederKrupp}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары spinradGlobal</th>
                <td>discounts.spinradGlobal</td>
                <td>{this.props.discounts.spinradGlobal}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары neonet1</th>
                <td>discounts.neonet1</td>
                <td>{this.props.discounts.neonet1}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары evo</th>
                <td>discounts.evo</td>
                <td>{this.props.discounts.evo}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары horizon</th>
                <td>discounts.horizon</td>
                <td>{this.props.discounts.horizon}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары wuxing</th>
                <td>discounts.wuxing</td>
                <td>{this.props.discounts.wuxing}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары russia</th>
                <td>discounts.russia</td>
                <td>{this.props.discounts.russia}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары renraku</th>
                <td>discounts.renraku</td>
                <td>{this.props.discounts.renraku}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары mutsuhama</th>
                <td>discounts.mutsuhama</td>
                <td>{this.props.discounts.mutsuhama}</td>
              </tr>
              <tr>
                <th>Коэффициент цены на товары shiavase</th>
                <td>discounts.shiavase</td>
                <td>{this.props.discounts.shiavase}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
