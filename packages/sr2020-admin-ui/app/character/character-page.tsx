import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Button, CardDeck, FormControl, InputGroup } from 'react-bootstrap';
import { AddToast } from 'react-toast-notifications';
import { getCharacter, sendCharacterEvent, setDefaultCharacter } from '@alice/sr2020-admin-ui/app/api/models-manager';
import { PassiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/character/cards/passive-abilities-card';
import { ActiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/character/cards/active-abilities-card';
import { SpellsCard } from '@alice/sr2020-admin-ui/app/character/cards/spells-card';
import { ImplantsCard } from '@alice/sr2020-admin-ui/app/character/cards/implants-card';
import { TimersCard } from '@alice/sr2020-admin-ui/app/character/cards/timers-card';
import { AddFeatureCard } from '@alice/sr2020-admin-ui/app/character/cards/add-feature-card';
import { CharacterStatsCard } from '@alice/sr2020-admin-ui/app/character/stats/character-stats-card';
import { AddImplantCard } from '@alice/sr2020-admin-ui/app/character/cards/add-implant-card';
import { GiveKarmaCard } from '@alice/sr2020-admin-ui/app/character/cards/give-karma-card';
import { DeathAndRebirthCard } from '@alice/sr2020-admin-ui/app/character/cards/death-and-rebirth-card';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';
import { ScanQrCard } from '@alice/sr2020-admin-ui/app/character/cards/scan-qr-card';
import { DumpshockCard } from '@alice/sr2020-admin-ui/app/character/cards/dumpshock-card';
import { ChangeRaceCard } from '@alice/sr2020-admin-ui/app/character/cards/change-race-card';
import { EthicsCard } from '@alice/sr2020-admin-ui/app/character/cards/ethics-card';
import { EssenceCard } from '@alice/sr2020-admin-ui/app/character/cards/essence-card';
import { CharacterResetCard } from '@alice/sr2020-admin-ui/app/character/cards/character-reset-card';

type SetCharacter = (character: Sr2020Character) => void;

export class LoadedCharacterPage extends React.Component<{ character: Sr2020Character; addToast: AddToast; setter: SetCharacter }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      this.props.setter(await sendCharacterEvent(this.props.character.modelId, { eventType, data }));
      this.props.addToast(successMessage, { appearance: 'success' });
    } catch (e) {
      this.handleError(e);
    }
  };

  reset = async () => {
    try {
      await setDefaultCharacter(this.props.character.modelId, this.props.character.name);
      await this.sendEvent('_', {}, 'Персонаж пересоздан!');
    } catch (e) {
      this.handleError(e);
    }
  };

  render() {
    return (
      <div>
        <CharacterStatsCard {...this.props.character} />
        <PassiveAbilitiesCard abilities={this.props.character.passiveAbilities} />
        <ActiveAbilitiesCard abilities={this.props.character.activeAbilities} />
        <SpellsCard abilities={this.props.character.spells} />
        <ImplantsCard implants={this.props.character.implants} />
        <TimersCard timers={this.props.character.timers} />
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
          <EthicsCard sendEvent={this.sendEvent} states={this.props.character.ethic.state} triggers={this.props.character.ethic.trigger} />
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

export class CharacterPage extends React.Component<
  { idToLoad?: string; addToast: AddToast },
  { character: Sr2020Character | undefined; desiredCharacterId: string }
> {
  state = { character: undefined, desiredCharacterId: '' };

  componentDidMount() {
    if (this.props.idToLoad) {
      this.setState({ desiredCharacterId: this.props.idToLoad });
      this.loadCharacter(this.props.idToLoad);
    }
  }

  async loadCharacter(id: string) {
    try {
      const character = await getCharacter(id);
      this.setState({ character });
      this.props.addToast('Персонаж загружен', { appearance: 'success' });
    } catch (e) {
      this.props.addToast(
        e?.response?.status == 404 ? 'Персонаж не найден' : `Неожиданная ошибка сервера: ${e?.response?.data?.statusText}`,
        {
          appearance: 'error',
        },
      );
    }
  }

  render() {
    return (
      <div>
        <div className="mt-3">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>ID персонажа</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl
              type="number"
              value={this.state.desiredCharacterId}
              onChange={(e) => this.setState({ desiredCharacterId: e.target.value })}
            />
            <InputGroup.Append>
              <Button variant="outline-primary" onClick={() => this.loadCharacter(this.state.desiredCharacterId)}>
                Обновить
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
        {this.state.character ? (
          <LoadedCharacterPage
            character={this.state.character}
            addToast={this.props.addToast}
            setter={(character) => this.setState({ character })}
          />
        ) : (
          <div />
        )}
      </div>
    );
  }
}
