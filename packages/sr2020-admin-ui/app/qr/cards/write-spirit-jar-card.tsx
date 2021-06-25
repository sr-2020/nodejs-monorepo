import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class WriteSpiritJarCard extends React.Component<{ sendEvent: SendEvent }> {
  write() {
    this.props.sendEvent('writeSpiritJar', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись духохранилища на QR</Card.Header>
        <Card.Body>
          <Button variant="success" onClick={() => this.write()}>
            Записать
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
