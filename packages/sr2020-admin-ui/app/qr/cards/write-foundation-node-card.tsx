import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';
import { FoundationNodeQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

export class WriteFoundationNodeCard extends React.Component<{ sendEvent: SendEvent }, FoundationNodeQrData> {
  state = { id: '' };

  write() {
    this.props.sendEvent('writeFoundationNode', this.state);
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись ноды основания на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <FormControl type="text" value={this.state.id} onChange={(e) => this.setState({ id: e.target.value })} />
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.write()}>
                Записать
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
