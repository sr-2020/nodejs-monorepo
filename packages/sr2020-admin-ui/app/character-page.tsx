import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Card } from 'react-bootstrap';
import { getCharacter } from '@alice/sr2020-admin-ui/app/models-manager-api';
import { BasicCharacterStats } from '@alice/sr2020-admin-ui/app/basic-character-stats';
import { MagicCharactersStats } from '@alice/sr2020-admin-ui/app/magic-character-stats';
import { HackerCharactersStats } from '@alice/sr2020-admin-ui/app/hacker-character-stats';
import { EconomicCharacterStats } from '@alice/sr2020-admin-ui/app/economic-character-stats';
import { ChemoCharacterStats } from '@alice/sr2020-admin-ui/app/chemo-character-stats';
import { RiggerCharacterStats } from '@alice/sr2020-admin-ui/app/rigger-character-stats';
import { EssenceCharacterStats } from '@alice/sr2020-admin-ui/app/essence-character-stats';
import { KarmaCharacterStats } from '@alice/sr2020-admin-ui/app/karma-character-stats';

export class CharacterPage extends React.Component<{ id: string }, Sr2020Character> {
  state: Sr2020Character;

  componentDidMount() {
    getCharacter(this.props.id).then((c) => {
      this.setState(c);
    });
  }

  render() {
    if (!this.state) return <div>Загрузка...</div>;
    return (
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
    );
  }
}
