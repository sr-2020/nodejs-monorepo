import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { allDrones, DictionaryItem } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteDroneCardState {
  drones: DictionaryItem[];
  selected: string;
}

export class WriteDroneCard extends React.Component<{ sendEvent: SendEvent }, WriteDroneCardState> {
  state: WriteDroneCardState = { drones: [], selected: 'belarus' };

  componentDidMount() {
    allDrones().then((drones) => this.setState({ drones }));
  }

  writeQr() {
    this.props.sendEvent('createMerchandise', { id: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись дрона на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.drones.map((f) => (
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
