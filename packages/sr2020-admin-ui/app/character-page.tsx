import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Card, CardGroup } from 'react-bootstrap';
import { AddToast } from 'react-toast-notifications';
import { getCharacter, sendCharacterEvent } from '@alice/sr2020-admin-ui/app/models-manager-api';
import { BasicCharacterStats } from '@alice/sr2020-admin-ui/app/basic-character-stats';
import { MagicCharactersStats } from '@alice/sr2020-admin-ui/app/magic-character-stats';
import { HackerCharactersStats } from '@alice/sr2020-admin-ui/app/hacker-character-stats';
import { EconomicCharacterStats } from '@alice/sr2020-admin-ui/app/economic-character-stats';
import { ChemoCharacterStats } from '@alice/sr2020-admin-ui/app/chemo-character-stats';
import { RiggerCharacterStats } from '@alice/sr2020-admin-ui/app/rigger-character-stats';
import { EssenceCharacterStats } from '@alice/sr2020-admin-ui/app/essence-character-stats';
import { KarmaCharacterStats } from '@alice/sr2020-admin-ui/app/karma-character-stats';
import { PassiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/passive-abilities-card';
import { ActiveAbilitiesCard } from '@alice/sr2020-admin-ui/app/active-abilities-card';
import { SpellsCard } from '@alice/sr2020-admin-ui/app/spells-card';
import { ImplantsCard } from '@alice/sr2020-admin-ui/app/implants-card';
import { TimersCard } from '@alice/sr2020-admin-ui/app/timers-card';
import { AddFeatureCard } from '@alice/sr2020-admin-ui/app/add-feature-card';

export class CharacterPage extends React.Component<{ id: string; addToast: AddToast }, Sr2020Character> {
  state: Sr2020Character;
  sendEvent = async (eventType: string, data: unknown, successMessage = 'Успех!') => {
    try {
      this.setState(await sendCharacterEvent(this.state.modelId, { eventType, data }));
      this.props.addToast(successMessage, { appearance: 'success' });
    } catch (e) {
      if (e.body && e.body.error && e.body.error.message) {
        this.props.addToast(e.body.error.message, { appearance: 'error' });
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
        <Card>
          <Card.Body>
            Персонаж {this.state.name} (model ID = {this.state.modelId}), состояние на{' '}
            {new Date(this.state.timestamp).toLocaleString('ru-RU')}
            <BasicCharacterStats {...this.state} />
            <MagicCharactersStats magicStats={this.state.magicStats} />
            <HackerCharactersStats hacking={this.state.hacking} />
            <EconomicCharacterStats billing={this.state.billing} discounts={this.state.discounts} />
            <ChemoCharacterStats chemo={this.state.chemo} />
            <RiggerCharacterStats drones={this.state.drones} rigging={this.state.rigging} />
            <EssenceCharacterStats essence={this.state.essence} essenceDetails={this.state.essenceDetails} />
            <KarmaCharacterStats karma={this.state.karma} />
          </Card.Body>
        </Card>
        <PassiveAbilitiesCard abilities={this.state.passiveAbilities} />
        <ActiveAbilitiesCard abilities={this.state.activeAbilities} />
        <SpellsCard abilities={this.state.spells} />
        <ImplantsCard implants={this.state.implants} />
        <TimersCard timers={this.state.timers} />
        <CardGroup className="mt-3">
          <AddFeatureCard sendEvent={this.sendEvent} />
        </CardGroup>
      </div>
    );
  }
}
