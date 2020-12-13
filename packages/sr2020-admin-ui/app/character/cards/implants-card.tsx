import React from 'react';
import { AddedImplant } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Card, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/components/wide-button';

export class ImplantsCard extends React.Component<{ implants: AddedImplant[] }> {
  render() {
    return (
      <Card body={false}>
        <Accordion>
          <Card.Header>
            <Accordion.Toggle as={WideButton} eventKey="0">
              Всего имплантов: {this.props.implants.length}
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
                    <th>Слот</th>
                    <th>Грейд</th>
                    <th>Сложность установки</th>
                    <th>Эссенс</th>
                  </tr>
                  {this.props.implants.map((implant, index) => (
                    <tr key={index}>
                      <td>{implant.id}</td>
                      <td>{implant.name}</td>
                      <td>{implant.description}</td>
                      <td>{implant.slot}</td>
                      <td>{implant.grade}</td>
                      <td>{implant.installDifficulty}</td>
                      <td>{implant.essenceCost}</td>
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
