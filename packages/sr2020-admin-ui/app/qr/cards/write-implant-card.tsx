import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { allImplants, DictionaryItem } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteImplantCardState {
  implants: DictionaryItem[];
  selected: string;
}

export class WriteImplantCard extends React.Component<{ sendEvent: SendEvent }, WriteImplantCardState> {
  state: WriteImplantCardState = { implants: [], selected: 'rcc-alpha' };

  componentDidMount() {
    allImplants().then((implants) => this.setState({ implants }));
  }

  writeQr() {
    this.props.sendEvent('createMerchandise', { id: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись импланта на QR</Card.Header>
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
              <Button variant="success" onClick={() => this.writeQr()}>
                Записать
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
