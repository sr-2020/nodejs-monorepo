import React from 'react';
import { Accordion, Button, Card, InputGroup, Table } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/event-sender';
import { AddedEthicState, AddedEthicTrigger } from '@alice/sr2020-common/models/sr2020-character.model';
import { WideButton } from '@alice/sr2020-admin-ui/app/wide-button';

export interface EthicsCardState {
  violence: number;
  control: number;
  individualism: number;
  mind: number;
}

const ETHIC_VALUES = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

export class EthicsCard extends React.Component<
  { sendEvent: SendEvent; states: AddedEthicState[]; triggers: AddedEthicTrigger[] },
  EthicsCardState
> {
  state = { violence: 0, control: 0, individualism: 0, mind: 0 };

  setEthicState() {
    this.props.sendEvent('ethicSet', {
      violence: this.state.violence,
      control: this.state.control,
      individualism: this.state.individualism,
      mind: this.state.mind,
    });
  }

  ethicTrigger(id: string) {
    this.props.sendEvent('ethicTrigger', { id });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Этика</Card.Header>
        <Card.Body>
          <div>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>Насилие, контроль, индивидуализм, разум</InputGroup.Text>
              </InputGroup.Prepend>
              <select
                className="browser-default custom-select"
                value={this.state.violence}
                onChange={(e) => this.setState({ violence: Number(e.target.value) })}
              >
                {this.getEthicValuesOptions()}
              </select>
              <select
                className="browser-default custom-select"
                value={this.state.control}
                onChange={(e) => this.setState({ control: Number(e.target.value) })}
              >
                {this.getEthicValuesOptions()}
              </select>
              <select
                className="browser-default custom-select"
                value={this.state.individualism}
                onChange={(e) => this.setState({ individualism: Number(e.target.value) })}
              >
                {this.getEthicValuesOptions()}
              </select>
              <select
                className="browser-default custom-select"
                value={this.state.mind}
                onChange={(e) => this.setState({ mind: Number(e.target.value) })}
              >
                {this.getEthicValuesOptions()}
              </select>
              <InputGroup.Append>
                <Button variant="success" onClick={() => this.setEthicState()}>
                  Установить
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
          <Accordion>
            <Accordion.Toggle as={WideButton} eventKey="0">
              Подробности
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
              <div>
                <Table>
                  <tbody>
                    <tr>
                      <th>Шкала</th>
                      <th>Значение</th>
                      <th>Описание</th>
                    </tr>
                    {this.props.states.map((state) => (
                      <tr key={state.scale}>
                        <td>{state.scale}</td>
                        <td>{state.value}</td>
                        <td>{state.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Table>
                  <tbody>
                    <tr>
                      <th>Активация</th>
                      <th>Тип</th>
                      <th>Описание</th>
                    </tr>
                    {this.props.triggers.map((trigger) => (
                      <tr key={trigger.id}>
                        <td>
                          <Button variant="warning" onClick={() => this.ethicTrigger(trigger.id)}>
                            Активировать
                          </Button>
                        </td>
                        <td>{trigger.kind}</td>
                        <td>{trigger.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Accordion.Collapse>
          </Accordion>
        </Card.Body>
      </Card>
    );
  }

  private getEthicValuesOptions() {
    return ETHIC_VALUES.map((v) => (
      <option key={v} value={v}>
        {v}
      </option>
    ));
  }
}
