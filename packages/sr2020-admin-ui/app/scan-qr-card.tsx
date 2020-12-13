import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/event-sender';

export class ScanQrCard extends React.Component<{ sendEvent: SendEvent }, { id: string }> {
  state = { id: '1' };

  scanQr() {
    this.props.sendEvent('scanQr', { qrCode: this.state.id });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Сканирование QR-кода</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>ID QR-кода</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl type="number" value={this.state.id} onChange={(e) => this.setState({ id: e.target.value })} />
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.scanQr()}>
                Отсканировать
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
