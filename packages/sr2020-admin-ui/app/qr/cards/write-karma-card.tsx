import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class WriteKarmaCard extends React.Component<{ sendEvent: SendEvent }, { amount: number; charges: number }> {
  state = { amount: 10, charges: 999 };

  write() {
    return this.props.sendEvent('writeKarmaSource', this.state);
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись кармы на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Карма, зарядов</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl type="number" value={this.state.amount} onChange={(e) => this.setState({ amount: Number(e.target.value) })} />
            <FormControl type="number" value={this.state.charges} onChange={(e) => this.setState({ charges: Number(e.target.value) })} />
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
