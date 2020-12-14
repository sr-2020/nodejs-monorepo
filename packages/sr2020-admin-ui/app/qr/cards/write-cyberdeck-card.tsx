import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { allCyberdecks, DictionaryItem } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteCyberdeckCardState {
  cyberdecks: DictionaryItem[];
  selected: string;
}

export class WriteCyberdeckCard extends React.Component<{ sendEvent: SendEvent }, WriteCyberdeckCardState> {
  state: WriteCyberdeckCardState = { cyberdecks: [], selected: 'cyberdeck-microtronic' };

  componentDidMount() {
    allCyberdecks().then((cyberdecks) => this.setState({ cyberdecks }));
  }

  writeQr() {
    this.props.sendEvent('createMerchandise', { id: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись кибердеки на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.cyberdecks.map((f) => (
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
