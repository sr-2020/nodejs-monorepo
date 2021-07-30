import React from 'react';
import { Accordion, Card, Table } from 'react-bootstrap';
import { WideButton } from '@alice/sr2020-admin-ui/app/components/wide-button';
import { Modifier } from '@alice/alice-common/models/alice-model-engine';

export class ModifiersCard extends React.Component<{ modifiers: Modifier[] }> {
  render() {
    return (
      <Card body={false}>
        <Accordion>
          <Card.Header>
            <Accordion.Toggle as={WideButton} eventKey="0">
              Всего модификаторов: {this.props.modifiers.length}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <Table>
                <tbody>
                  <tr>
                    <th>ID модификатора</th>
                    <th>Количество</th>
                    <th>Включен</th>
                    <th>ID эффекта</th>
                    <th>Обработчик</th>
                  </tr>
                  {this.props.modifiers.map((modifier, index) =>
                    modifier.effects.map((effect, index_inner) => (
                      <tr key={index * 100 + index_inner}>
                        <td>{modifier.mID}</td>
                        <td>{modifier.amount}</td>
                        <td>{modifier.enabled && effect.enabled}</td>
                        <td>{effect.id}</td>
                        <td>{effect.handler}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Accordion.Collapse>
        </Accordion>
      </Card>
    );
  }
}
