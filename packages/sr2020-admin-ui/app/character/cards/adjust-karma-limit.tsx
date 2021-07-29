import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class AdjustKarmaLimit extends React.Component<{ sendEvent: SendEvent }, { amount: number }> {
  state = { amount: 10 };

  increase() {
    this.props.sendEvent('adjustGameKarmaCycleLimit', { amount: this.state.amount, notify: true });
  }

  decrease() {
    this.props.sendEvent('adjustGameKarmaCycleLimit', { amount: -this.state.amount, notify: true });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Изменение лимита кармы на игру</Card.Header>
        <Card.Body>
          <InputGroup>
            <FormControl type="number" value={this.state.amount} onChange={(e) => this.setState({ amount: Number(e.target.value) })} />
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.increase()}>
                Увеличить
              </Button>
              <Button variant="warning" onClick={() => this.decrease()}>
                Уменьшить
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
