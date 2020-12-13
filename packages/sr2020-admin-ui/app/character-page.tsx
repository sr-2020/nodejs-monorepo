import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { CardGroup } from 'react-bootstrap';
import { AddToast } from 'react-toast-notifications';
import { getCharacter, sendCharacterEvent } from '@alice/sr2020-admin-ui/app/models-manager-api';
import { PassiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/passive-abilities-card';
import { ActiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/active-abilities-card';
import { SpellsCard } from '@alice/sr2020-admin-ui/app/spells-card';
import { ImplantsCard } from '@alice/sr2020-admin-ui/app/implants-card';
import { TimersCard } from '@alice/sr2020-admin-ui/app/timers-card';
import { AddFeatureCard } from '@alice/sr2020-admin-ui/app/add-feature-card';
import { CharacterStatsCard } from '@alice/sr2020-admin-ui/app/character-stats-card';
import { AddImplantCard } from '@alice/sr2020-admin-ui/app/add-implant-card';
import { GiveKarmaCard } from '@alice/sr2020-admin-ui/app/give-karma-card';

export class CharacterPage extends React.Component<{ id: string; addToast: AddToast }, Sr2020Character> {
  state: Sr2020Character;
  sendEvent = async (eventType: string, data: unknown, successMessage = 'Успех!') => {
    try {
      this.setState(await sendCharacterEvent(this.state.modelId, { eventType, data }));
      this.props.addToast(successMessage, { appearance: 'success' });
    } catch (e) {
      const errorMessage = e?.response?.data?.error?.message;
      if (errorMessage) {
        this.props.addToast(errorMessage, { appearance: 'error' });
      } else {
        this.props.addToast('Неизвестная ошибка сервера :(', { appearance: 'error' });
      }
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
        <CardGroup className="mt-3">
          <AddFeatureCard sendEvent={this.sendEvent} />
        </CardGroup>
        <CardGroup className="mt-3">
          <AddImplantCard sendEvent={this.sendEvent} />
          <GiveKarmaCard sendEvent={this.sendEvent} />
        </CardGroup>
      </div>
    );
  }
}
