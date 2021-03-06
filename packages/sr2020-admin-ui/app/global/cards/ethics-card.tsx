import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';

export class EthicsCard extends React.Component<{ broadcastEvent: SendEvent }> {
  hide() {
    this.props.broadcastEvent('hideEthic', {}, 'Операция завершена');
  }

  show() {
    this.props.broadcastEvent('showEthic', {}, 'Операция завершена');
  }

  render() {
    return (
      <Card body={false}>
        <Card.Header>Для разработчика</Card.Header>
        <Card.Body>
          <Button variant="success" onClick={() => this.hide()}>
            Скрыть этику
          </Button>
          <Button variant="warning" onClick={() => this.show()}>
            Показать этику
          </Button>
        </Card.Body>
      </Card>
    );
  }
}
