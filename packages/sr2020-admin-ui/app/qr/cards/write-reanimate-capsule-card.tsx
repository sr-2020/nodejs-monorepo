import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class WriteReanimateCapsuleCard extends React.Component<
  { sendEvent: SendEvent },
  { name: string; description: string; essenceGet: number; essenceAir: number; cooldown: number }
> {
  state = {
    essenceGet: 10,
    essenceAir: 15,
    cooldown: 20,
    name: 'Лазарь',
    description: 'Капсула производства России. Работает по воле Господа.',
  };

  write() {
    this.props.sendEvent('writeReanimateCapsule', this.state);
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись воскрешательной капсулы на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Название, описание</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl type="text" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />
            <FormControl type="text" value={this.state.description} onChange={(e) => this.setState({ description: e.target.value })} />
          </InputGroup>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>get-essence, air-essence, cooldown</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              type="number"
              value={this.state.essenceGet}
              onChange={(e) => this.setState({ essenceGet: Number(e.target.value) })}
            />
            <FormControl
              type="number"
              value={this.state.essenceAir}
              onChange={(e) => this.setState({ essenceAir: Number(e.target.value) })}
            />
            <FormControl type="number" value={this.state.cooldown} onChange={(e) => this.setState({ cooldown: Number(e.target.value) })} />
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
