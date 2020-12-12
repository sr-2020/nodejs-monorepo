import React from 'react';
import { Karma } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';

export class KarmaCharacterStats extends React.Component<{ karma: Karma }> {
  render() {
    return (
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
                <td>{this.props.karma.available}</td>
              </tr>
              <tr>
                <th>Потрачено</th>
                <td>karma.spent</td>
                <td>{this.props.karma.spent}</td>
              </tr>
              <tr>
                <th>Потрачено на пассивки</th>
                <td>karma.spentOnPassives</td>
                <td>{this.props.karma.spentOnPassives}</td>
              </tr>
              <tr>
                <th>Лимит на цикл</th>
                <td>karma.cycleLimit</td>
                <td>{this.props.karma.cycleLimit}</td>
              </tr>
            </tbody>
          </Table>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}
