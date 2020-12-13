import React from 'react';
import { Button, Card, InputGroup } from 'react-bootstrap';

export class CharacterResetCard extends React.Component<{ reset: () => void }> {
  render() {
    return (
      <Card body={false}>
        <Card.Header>Полный ресет персонажа</Card.Header>
        <Card.Body>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>Полностью сбросить состояние персонажа (обнуляет все способности, эффекты, историю, ...)</InputGroup.Text>
            </InputGroup.Prepend>
            <InputGroup.Append>
              <Button variant="danger" onClick={() => this.props.reset()}>
                Сбросить (я знаю что делаю)!
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Card.Body>
      </Card>
    );
  }
}
