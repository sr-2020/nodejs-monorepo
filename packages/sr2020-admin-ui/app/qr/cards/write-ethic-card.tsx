import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { allEthicGroups, DictionaryItem } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface WriteEthicCardState {
  ethicGroups: DictionaryItem[];
  selected: string;
  amount: number;
}

export class WriteEthicCard extends React.Component<{ sendEvent: SendEvent }, WriteEthicCardState> {
  state: WriteEthicCardState = { ethicGroups: [], selected: 'russian-orthodox-church', amount: 5 };

  componentDidMount() {
    allEthicGroups().then((ethicGroups) => this.setState({ ethicGroups }));
  }

  writeLocusChargeQr() {
    this.props.sendEvent('createMerchandise', {
      id: this.state.selected,
      name: '',
      description: 'Позволяет зарядить любой локус при наличии соответствующей способности ',
      numberOfUses: this.state.amount,
    });
  }

  writeLocusQr() {
    this.props.sendEvent('createLocusQr', { groupId: this.state.selected, numberOfUses: this.state.amount });
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Запись локуса этической группы / универсального заряда на QR</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Зарядов</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl type="number" value={this.state.amount} onChange={(e) => this.setState({ amount: Number(e.target.value) })} />
            <select
              className="browser-default custom-select"
              value={this.state.selected}
              onChange={(e) => this.setState({ selected: e.target.value })}
            >
              {this.state.ethicGroups.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id})
                </option>
              ))}
            </select>
            <InputGroup.Append>
              <Button variant="success" onClick={() => this.writeLocusQr()}>
                Записать локус
              </Button>
              <Button variant="success" onClick={() => this.writeLocusChargeQr()}>
                Записать заряд локуса
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
