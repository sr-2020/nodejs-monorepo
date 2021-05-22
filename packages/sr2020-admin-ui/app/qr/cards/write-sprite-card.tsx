import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { allFocuses, DictionaryItem } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteSpriteCardState {
  sprites: DictionaryItem[];
  selected: string;
}

export class WriteSpriteCard extends React.Component<{ sendEvent: SendEvent }, WriteSpriteCardState> {
  state: WriteSpriteCardState = { sprites: [], selected: 'keys' };

  componentDidMount() {
    allFocuses().then((sprites) => this.setState({ sprites }));
  }

  writeQr() {
    this.props.sendEvent('createMerchandise', { id: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись спрайта на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.sprites.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id}
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
