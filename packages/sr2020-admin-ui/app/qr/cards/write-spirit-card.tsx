import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteSpiritCardState {
  spirits: string[];
  selected: string;
}

export class WriteSpiritCard extends React.Component<{ sendEvent: SendEvent }, WriteSpiritCardState> {
  state: WriteSpiritCardState = { spirits: ['spirit-type-1', 'spirit-type-2', 'spirit-type-3'], selected: 'spirit-type-1' };

  writeQr() {
    this.props.sendEvent('writeSpirit', { id: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись духа на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.spirits.map((f) => (
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
