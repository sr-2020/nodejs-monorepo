import React from 'react';
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap';
import { Feature } from '@alice/sr2020-common/models/sr2020-character.model';
import { allFeatures } from '@alice/sr2020-admin-ui/app/api/models-engine';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export interface AddFeatureCardState {
  features: Feature[];
  selectedFeature: string;
}

export class AddFeatureCard extends React.Component<{ sendEvent: SendEvent }, AddFeatureCardState> {
  state: AddFeatureCardState = { features: [], selectedFeature: 'magic-1' };

  componentDidMount() {
    allFeatures().then((features) => this.setState({ features }));
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Добавление/удаление фичи (без проверки пререквизитов)</Card.Header>
        <Card.Body>
          <InputGroup>
            <select
              className="browser-default custom-select"
              value={this.state.selectedFeature}
              onChange={(e) => this.setState({ selectedFeature: e.target.value })}
            >
              {this.state.features.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.humanReadableName}
                </option>
              ))}
            </select>
            <FormControl value={this.state.selectedFeature} onChange={(e) => this.setState({ selectedFeature: e.target.value })} />
            <InputGroup.Append>
              <Button
                variant="success"
                onClick={() => this.props.sendEvent('addFeature', { id: this.state.selectedFeature }, 'Фича добавлена')}
              >
                Добавить
              </Button>
              <Button
                variant="danger"
                onClick={() => this.props.sendEvent('removeFeature', { id: this.state.selectedFeature }, 'Фича удалена')}
              >
                Удалить
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
