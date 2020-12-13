import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/event-sender';

// TODO(aeremin) Receive from dictionary controller
const ALL_RACES = [
  { id: 'meta-norm', name: 'Норм' },
  { id: 'meta-elf', name: 'Эльф' },
  { id: 'meta-dwarf', name: 'Дварф' },
  { id: 'meta-ork', name: 'Орк' },
  { id: 'meta-troll', name: 'Тролль' },
  { id: 'meta-vampire', name: 'Вампир' },
  { id: 'meta-ghoul', name: 'Гуль' },
  { id: 'meta-eghost', name: 'E-Ghost' },
  { id: 'meta-ai', name: 'AI' },
];

export class ChangeRaceCard extends React.Component<{ sendEvent: SendEvent }, { selected: string }> {
  state = { selected: 'meta-norm' };

  changeRace() {
    this.props.sendEvent('setRace', { race: this.state.selected });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Смена расы</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {ALL_RACES.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name} ({id})
                </option>
              ))}
            </select>
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.changeRace()}>
                Изменить
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
