import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class HungerCard extends React.Component<{ broadcastEvent: SendEvent }> {
  stop() {
    this.props.broadcastEvent('stopAllHungersEvent', {});
  }

  start() {
    this.props.broadcastEvent('restartAllHungersEvent', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Управление голодом</Card.Header>
        <Card.Body>
          <Button variant="success" onClick={() => this.stop()}>
            Отключить голод
          </Button>
          <Button variant="warning" onClick={() => this.start()}>
            Включить голод
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
