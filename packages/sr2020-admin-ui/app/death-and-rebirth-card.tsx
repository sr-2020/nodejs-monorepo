import React from 'react';
import { Button, Card } from 'react-bootstrap';

export class DeathAndRebirthCard extends React.Component<{ sendEvent: (eventType: string, data: unknown, message?: string) => void }> {
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
