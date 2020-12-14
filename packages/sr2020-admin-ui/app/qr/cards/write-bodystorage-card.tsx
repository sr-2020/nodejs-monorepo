import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class WriteBodystorageCard extends React.Component<{ sendEvent: SendEvent }, { name: string }> {
  state = { name: '' };

  write() {
    this.props.sendEvent('writeBodyStorage', { name: this.state.name });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись телохранилища на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Название</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl type="text" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />
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
