import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/event-sender';

export class DeathAndRebirthCard extends React.Component<{ sendEvent: SendEvent }> {
  wound() {
    this.props.sendEvent('wound', {});
  }

  revive() {
    this.props.sendEvent('debugReviveAbsolute', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Ранения и смерть</Card.Header>
        <Card.Body>
          <Button variant="danger" onClick={() => this.wound()}>
            Упасть в тяжран
          </Button>
          <Button variant="success" onClick={() => this.revive()}>
            Воскресить
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
