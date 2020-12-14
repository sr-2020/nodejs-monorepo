import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class WriteAiSymbolCard extends React.Component<{ sendEvent: SendEvent }, { name: string }> {
  state = { name: '' };

  write() {
    this.props.sendEvent('writeAiSymbol', { ai: this.state.name });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись символа ИИ на QR</Card.Header>
        <Card.Body>
          <InputGroup>
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
