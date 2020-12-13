import React from 'react';
import { Accordion, Card, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/components/wide-button';
import { AddedActiveAbility } from '@alice/sr2020-common/models/sr2020-character.model';

export class ActiveAbilitiesCard extends React.Component<{ abilities: AddedActiveAbility[] }> {
  render() {
    return (
      <Card body={false}>
        <Accordion>
          <Card.Header>
            <Accordion.Toggle as={WideButton} eventKey="0">
              Всего активных способностей: {this.props.abilities.length}
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
                    <th>Кулдаун (минут)</th>
                    <th>Кулдаун (до)</th>
                  </tr>
                  {this.props.abilities.map((ability, index) => (
                    <tr key={index}>
                      <td>{ability.id}</td>
                      <td>{ability.humanReadableName}</td>
                      <td>{ability.description}</td>
                      <td>{ability.cooldownMinutes}</td>
                      <td>{ability.cooldownUntil}</td>
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
