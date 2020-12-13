import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { allImplants } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { Implant } from '@alice/sr2020-common/models/common_definitions';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface AddImplantCardState {
  implants: Implant[];
  selected: string;
}

export class AddImplantCard extends React.Component<{ sendEvent: SendEvent }, AddImplantCardState> {
  state: AddImplantCardState = { implants: [], selected: 'rcc-alpha' };

  componentDidMount() {
    allImplants().then((implants) => this.setState({ implants }));
  }

  installImplant() {
    this.props.sendEvent(
      'installImplant',
      {
        id: this.state.selected,
        basePrice: 0,
        rentPrice: 0,
        dealId: '',
        lifestyle: '',
        gmDescription: '',
      },
      'Имплант установлен',
    );
  }

  removeImplant() {
    this.props.sendEvent(
      'removeImplant',
      {
        id: this.state.selected,
      },
      'Имплант удален',
    );
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Установка/удаление импланта</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.implants.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id})
                </option>
              ))}
            </select>
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.installImplant()}>
                Установить
              </Button>
              <Button variant="danger" onClick={() => this.removeImplant()}>
                Удалить
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
