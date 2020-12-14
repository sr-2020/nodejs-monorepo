import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class NewCycleCard extends React.Component<{ broadcastEvent: SendEvent }> {
  broadcast() {
    this.props.broadcastEvent('newLargeCycle', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Новый цикл</Card.Header>
        <Card.Body>
          <Button variant="success" onClick={() => this.broadcast()}>
            Начать новый цикл
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
