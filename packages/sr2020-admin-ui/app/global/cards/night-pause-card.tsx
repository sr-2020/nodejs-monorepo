import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface NightPauseCardState {
  postponeDurationHours: number;
  pauseDurationHours: number;
}

export class NightPauseCard extends React.Component<{ broadcastEvent: SendEvent }, NightPauseCardState> {
  state = { postponeDurationHours: 8, pauseDurationHours: 6 };

  broadcast() {
    this.props.broadcastEvent('pauseAndPostpone', this.state);
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Ночная пауза</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Пауза (часов), Сдвиг таймеров (часов)</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              type="number"
              value={this.state.pauseDurationHours}
              onChange={(e) => this.setState({ pauseDurationHours: Number(e.target.value) })}
            />
            <FormControl
              type="number"
              value={this.state.postponeDurationHours}
              onChange={(e) => this.setState({ postponeDurationHours: Number(e.target.value) })}
            />
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.broadcast()}>
                Пауза
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
