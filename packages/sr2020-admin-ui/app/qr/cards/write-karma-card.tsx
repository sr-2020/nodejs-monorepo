import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class WriteKarmaCard extends React.Component<{ sendEvent: SendEvent }, { amount: number }> {
  state = { amount: 10 };

  write() {
    this.props.sendEvent('writeKarmaSource', { amount: this.state.amount });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись кармы на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <FormControl type="number" value={this.state.amount} onChange={(e) => this.setState({ amount: Number(e.target.value) })} />
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.write()}>
                Записать
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
