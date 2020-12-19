import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class DeathAndRebirthCard extends React.Component<{ sendEvent: SendEvent }> {
  wound() {
    this.props.sendEvent('wound', {});
  }

  clinicalDeath() {
    this.props.sendEvent('clinicalDeath0MaxHp', {});
  }

  revive() {
    this.props.sendEvent('debugReviveAbsolute', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Ранения и смерть</Card.Header>
        <Card.Body>
          <Button variant="warning" onClick={() => this.wound()}>
            Упасть в тяжран
          </Button>
          <Button variant="danger" onClick={() => this.clinicalDeath()}>
            Упасть в КС
          </Button>
          <Button variant="success" onClick={() => this.revive()}>
            Воскресить
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
