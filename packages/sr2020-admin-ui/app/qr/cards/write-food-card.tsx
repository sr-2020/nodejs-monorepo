import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class WriteFoodCard extends React.Component<{ sendEvent: SendEvent }, { amount: number }> {
  state = { amount: 5 };

  write(id: string) {
    this.props.sendEvent('createMerchandise', { numberOfUses: Number(this.state.amount), id: 'food' });
  }

  writeFood() {
    this.write('food');
  }

  writeMeat() {
    this.write('cow-meat');
  }

  writeBlood() {
    this.write('cow-blood');
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись еды на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <FormControl type="number" value={this.state.amount} onChange={(e) => this.setState({ amount: Number(e.target.value) })} />
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.writeFood()}>
                Еда
              </Button>
              <Button variant="success" onClick={() => this.writeMeat()}>
                Мясо
              </Button>
              <Button variant="success" onClick={() => this.writeBlood()}>
                Кровь
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
