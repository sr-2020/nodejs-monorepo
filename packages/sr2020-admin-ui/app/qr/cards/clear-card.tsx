import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class ClearQrCard extends React.Component<{ sendEvent: SendEvent }> {
  clear() {
    this.props.sendEvent('clear', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Стирание QR-кода</Card.Header>
        <Card.Body>
          <Button variant="danger" onClick={() => this.clear()}>
            Очистить
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
