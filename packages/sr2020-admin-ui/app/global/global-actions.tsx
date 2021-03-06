import React from 'react';
import { AddToast } from 'react-toast-notifications';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';
import { broadcastCharacterEvent } from '@alice/sr2020-admin-ui/app/api/models-manager';
import { CardDeck } from 'react-bootstrap';
import { NewCycleCard } from '@alice/sr2020-admin-ui/app/global/cards/new-cycle-card';
import { NightPauseCard } from '@alice/sr2020-admin-ui/app/global/cards/night-pause-card';
import { MigrationCard } from '@alice/sr2020-admin-ui/app/global/cards/migration-card';
import { EthicsCard } from '@alice/sr2020-admin-ui/app/global/cards/ethics-card';

export class GlobalActionsPage extends React.Component<{ addToast: AddToast }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(e: any) {
    const errorMessage = e?.response?.data?.error?.message;
    if (errorMessage) {
      this.props.addToast(errorMessage, { appearance: 'error' });
    } else {
      this.props.addToast('Неизвестная ошибка сервера :(', { appearance: 'error' });
    }
  }

  broadcastEvent: SendEvent = async (eventType: string, data: unknown, successMessage = 'Успех!') => {
    try {
      this.props.addToast('Это долгая операция, пожалуйста, подождите...', { appearance: 'info' });
      await broadcastCharacterEvent({ eventType, data });
      this.props.addToast(successMessage, { appearance: 'success' });
    } catch (e) {
      this.handleError(e);
    }
  };

  render() {
    return (
      <div>
        <CardDeck className="mt-3">
          <NewCycleCard broadcastEvent={this.broadcastEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <NightPauseCard broadcastEvent={this.broadcastEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <EthicsCard broadcastEvent={this.broadcastEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <MigrationCard broadcastEvent={this.broadcastEvent} />
        </CardDeck>
      </div>
    );
  }
}
