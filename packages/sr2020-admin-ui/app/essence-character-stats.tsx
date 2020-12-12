import React from 'react';
import { EssenceDetails } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';

export class EssenceCharacterStats extends React.Component<{ essence: number; essenceDetails: EssenceDetails }> {
  render() {
    return (
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
                <td>{this.props.essence}</td>
              </tr>
              <tr>
                <th>Максимальный эссенс</th>
                <td>essenceDetails.max</td>
                <td>{this.props.essenceDetails.max}</td>
              </tr>
              <tr>
                <th>Занято имплантами</th>
                <td>essenceDetails.used</td>
                <td>{this.props.essenceDetails.used}</td>
              </tr>
              <tr>
                <th>Дыра эссенса</th>
                <td>essenceDetails.gap</td>
                <td>{this.props.essenceDetails.gap}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
