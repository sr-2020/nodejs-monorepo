import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class MigrationCard extends React.Component<{ broadcastEvent: SendEvent }> {
  migrate() {
    this.props.broadcastEvent('developmentMigrate', {}, 'Миграция завершена');
  }

  validate() {
    this.props.broadcastEvent('developmentValidate', {}, 'Все персонажи валидны');
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Для разработчика</Card.Header>
        <Card.Body>
          <Button variant="success" onClick={() => this.validate()}>
            Пересчитать и проверить персонажей
          </Button>
          <Button variant="warning" onClick={() => this.migrate()}>
            Мигрировать персонажей
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
