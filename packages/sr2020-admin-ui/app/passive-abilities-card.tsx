import React from 'react';
import { AddedPassiveAbility } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Card, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';

export class PassiveAbilitiesCard extends React.Component<{ abilities: AddedPassiveAbility[] }> {
  render() {
    return (
      <Card body={false}>
        <Accordion>
          <Card.Header>
            <Accordion.Toggle as={WideButton} eventKey="0">
              Всего пассивных способностей: {this.props.abilities.length}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <Table>
                <tbody>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Описание</th>
                  </tr>
                  {this.props.abilities.map((ability, index) => (
                    <tr key={index}>
                      <td>{ability.id}</td>
                      <td>{ability.humanReadableName}</td>
                      <td>{ability.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Accordion.Collapse>
        </Accordion>
      </Card>
    );
  }
}
