import React from 'react';
import { Accordion, Card, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';
import { AddedSpell } from '@alice/sr2020-common/models/sr2020-character.model';

export class SpellsCard extends React.Component<{ abilities: AddedSpell[] }> {
  render() {
    return (
      <Card body={false}>
        <Accordion>
          <Card.Header>
            <Accordion.Toggle as={WideButton} eventKey="0">
              Всего спеллов способностей: {this.props.abilities.length}
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
                    <th>Имеет цель</th>
                    <th>Сфера</th>
                  </tr>
                  {this.props.abilities.map((ability, index) => (
                    <tr key={index}>
                      <td>{ability.id}</td>
                      <td>{ability.humanReadableName}</td>
                      <td>{ability.description}</td>
                      <td>{ability.hasTarget}</td>
                      <td>{ability.sphere}</td>
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
