import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { Feature } from '@alice/sr2020-common/models/sr2020-character.model';
import { allFeatures } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteFeatureCardState {
  features: Feature[];
  selected: string;
  uses: number;
}

export class WriteFeatureCard extends React.Component<{ sendEvent: SendEvent }, WriteFeatureCardState> {
  state: WriteFeatureCardState = { features: [], selected: 'magic-1', uses: 9999 };

  componentDidMount() {
    allFeatures().then((features) => this.setState({ features }));
  }

  writeQr() {
    this.props.sendEvent('writeBuyableFeature', { id: this.state.selected, uses: this.state.uses });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись фичи на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.features.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.humanReadableName}
                </option>
              ))}
            </select>
            <FormControl value={this.state.selected} onChange={(e) => this.setState({ selected: e.target.value })} />
            <FormControl type="number" value={this.state.uses} onChange={(e) => this.setState({ uses: Number(e.target.value) })} />
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
