import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/event-sender';

export class EssenceCard extends React.Component<{ sendEvent: SendEvent }> {
  increaseEssence() {
    this.props.sendEvent('increaseMaxEssence', { amount: 100 });
  }

  decreaseEssence() {
    this.props.sendEvent('increaseMaxEssence', { amount: -100 });
  }

  resetEssence() {
    this.props.sendEvent('essenceReset', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Ранения и смерть</Card.Header>
        <Card.Body>
          <Button variant="success" onClick={() => this.increaseEssence()}>
            Увеличить макс. эссенс
          </Button>
          <Button variant="warning" onClick={() => this.decreaseEssence()}>
            Уменьшить макс. эссенс
          </Button>
          <Button variant="danger" onClick={() => this.resetEssence()}>
            Очистка эссенса и имплантов
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
