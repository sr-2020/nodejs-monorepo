import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class CopyAnotherCard extends React.Component<{ sendEvent: SendEvent }, { qrCodeId: number }> {
  state = { qrCodeId: 1 };

  write() {
    return this.props.sendEvent('pasteAnother', this.state);
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Перемещение другого QR-кода на этот</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Откуда копируем (будет очищен!!!)</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl type="number" value={this.state.qrCodeId} onChange={(e) => this.setState({ qrCodeId: Number(e.target.value) })} />
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.write()}>
                Вырезать и вставить
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
