import React from 'react';
import { Accordion, Card, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';
import { Timer } from '@alice/alice-common/models/alice-model-engine';

export class TimersCard extends React.Component<{ timers: Timer[] }> {
  render() {
    return (
      <Card body={false}>
        <Accordion>
          <Card.Header>
            <Accordion.Toggle as={WideButton} eventKey="0">
              Всего таймеров: {this.props.timers.length}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <Table>
                <tbody>
                  <tr>
                    <th>ID</th>
                    <th>Описание</th>
                    <th>Осталось мс</th>
                    <th>Тип события</th>
                    <th>Данные</th>
                  </tr>
                  {this.props.timers.map((timer, index) => (
                    <tr key={index}>
                      <td>{timer.name}</td>
                      <td>{timer.description}</td>
                      <td>{timer.miliseconds}</td>
                      <td>{timer.eventType}</td>
                      <td>{JSON.stringify(timer.data)}</td>
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
