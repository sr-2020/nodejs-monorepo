import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { CardDeck } from 'react-bootstrap';
import { AddToast } from 'react-toast-notifications';
import { getCharacter, sendCharacterEvent, setDefaultCharacter } from '@alice/sr2020-admin-ui/app/models-manager-api';
import { PassiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/passive-abilities-card';
import { ActiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/active-abilities-card';
import { SpellsCard } from '@alice/sr2020-admin-ui/app/spells-card';
import { ImplantsCard } from '@alice/sr2020-admin-ui/app/implants-card';
import { TimersCard } from '@alice/sr2020-admin-ui/app/timers-card';
import { AddFeatureCard } from '@alice/sr2020-admin-ui/app/add-feature-card';
import { CharacterStatsCard } from '@alice/sr2020-admin-ui/app/character-stats-card';
import { AddImplantCard } from '@alice/sr2020-admin-ui/app/add-implant-card';
import { GiveKarmaCard } from '@alice/sr2020-admin-ui/app/give-karma-card';
import { DeathAndRebirthCard } from '@alice/sr2020-admin-ui/app/death-and-rebirth-card';
import { SendEvent } from '@alice/sr2020-admin-ui/app/event-sender';
import { ScanQrCard } from '@alice/sr2020-admin-ui/app/scan-qr-card';
import { DumpshockCard } from '@alice/sr2020-admin-ui/app/dumpshock-card';
import { ChangeRaceCard } from '@alice/sr2020-admin-ui/app/change-race-card';
import { EthicsCard } from '@alice/sr2020-admin-ui/app/ethics-card';
import { EssenceCard } from '@alice/sr2020-admin-ui/app/essence-card';
import { CharacterResetCard } from '@alice/sr2020-admin-ui/app/character-reset-card';

export class CharacterPage extends React.Component<{ id: string; addToast: AddToast }, Sr2020Character> {
  state: Sr2020Character;

  handleError(e: any) {
    const errorMessage = e?.response?.data?.error?.message;
    if (errorMessage) {
      this.props.addToast(errorMessage, { appearance: 'error' });
    } else {
      this.props.addToast('Неизвестная ошибка сервера :(', { appearance: 'error' });
    }
  }

  sendEvent: SendEvent = async (eventType: string, data: unknown, successMessage = 'Успех!') => {
    try {
      this.setState(await sendCharacterEvent(this.state.modelId, { eventType, data }));
      this.props.addToast(successMessage, { appearance: 'success' });
    } catch (e) {
      this.handleError(e);
    }
  };

  reset = async () => {
    try {
      await setDefaultCharacter(this.state.modelId, this.state.name);
      await this.sendEvent('_', {}, 'Персонаж пересоздан!');
    } catch (e) {
      this.handleError(e);
    }
  };

  componentDidMount() {
    getCharacter(this.props.id).then((c) => {
      this.setState(c);
    });
  }

  render() {
    if (!this.state) return <div>Загрузка...</div>;
    return (
      <div>
        <CharacterStatsCard {...this.state} />
        <PassiveAbilitiesCard abilities={this.state.passiveAbilities} />
        <ActiveAbilitiesCard abilities={this.state.activeAbilities} />
        <SpellsCard abilities={this.state.spells} />
        <ImplantsCard implants={this.state.implants} />
        <TimersCard timers={this.state.timers} />
        <CardDeck className="mt-3">
          <AddFeatureCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <AddImplantCard sendEvent={this.sendEvent} />
          <GiveKarmaCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <DeathAndRebirthCard sendEvent={this.sendEvent} />
          <ScanQrCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <DumpshockCard sendEvent={this.sendEvent} />
          <ChangeRaceCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <EthicsCard sendEvent={this.sendEvent} states={this.state.ethic.state} triggers={this.state.ethic.trigger} />
        </CardDeck>
        <CardDeck className="mt-3">
          <EssenceCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <CharacterResetCard reset={this.reset} />
        </CardDeck>
      </div>
    );
  }
}
