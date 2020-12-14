import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { allReagents, DictionaryItem } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteReagentCardState {
  reagents: DictionaryItem[];
  selected: string;
}

export class WriteReagentCard extends React.Component<{ sendEvent: SendEvent }, WriteReagentCardState> {
  state: WriteReagentCardState = { reagents: [], selected: 'virgo' };

  componentDidMount() {
    allReagents().then((reagents) => this.setState({ reagents }));
  }

  writeQr() {
    this.props.sendEvent('createMerchandise', { id: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись реагента на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.reagents.map((f) => (
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
