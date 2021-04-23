import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteRepairKitCardState {
  repairKits: string[];
  selected: string;
}

export class WriteRepairKitCard extends React.Component<{ sendEvent: SendEvent }, WriteRepairKitCardState> {
  state: WriteRepairKitCardState = { repairKits: ['repair-kit-1', 'repair-kit-2', 'repair-kit-3'], selected: 'repair-kit-1' };

  writeQr() {
    this.props.sendEvent('createMerchandise', { id: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись ремкомплекта на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.repairKits.map((f) => (
                <option key={f} value={f}>
                  {f}
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
