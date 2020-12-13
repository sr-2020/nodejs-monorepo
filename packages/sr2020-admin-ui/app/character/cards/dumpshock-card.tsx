import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class DumpshockCard extends React.Component<{ sendEvent: SendEvent }> {
  dumpshock() {
    this.props.sendEvent('dumpshock', {});
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Дампшок</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Долбануть дампшоком</InputGroup.Text>
            </InputGroup.Prepend>
            <InputGroup.Append>
              <Button variant="danger" onClick={() => this.dumpshock()}>
                Бдыщ!
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
