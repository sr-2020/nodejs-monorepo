import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Card } from 'react-bootstrap';
import { BasicCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/basic-character-stats';
import { MagicCharactersStats } from '@alice/sr2020-admin-ui/app/character/stats/magic-character-stats';
import { HackerCharactersStats } from '@alice/sr2020-admin-ui/app/character/stats/hacker-character-stats';
import { EconomicCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/economic-character-stats';
import { ChemoCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/chemo-character-stats';
import { RiggerCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/rigger-character-stats';
import { EssenceCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/essence-character-stats';
import { KarmaCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/karma-character-stats';

export class CharacterStatsCard extends React.Component<Sr2020Character> {
  render() {
    return (
      <Card>
        <Card.Body>
          Персонаж {this.props.name} (model ID = {this.props.modelId}), состояние на{' '}
          {new Date(this.props.timestamp).toLocaleString('ru-RU')}
          <BasicCharacterStats {...this.props} />
          <MagicCharactersStats magicStats={this.props.magicStats} />
          <HackerCharactersStats hacking={this.props.hacking} />
          <EconomicCharacterStats billing={this.props.billing} discounts={this.props.discounts} />
          <ChemoCharacterStats chemo={this.props.chemo} />
          <RiggerCharacterStats drones={this.props.drones} rigging={this.props.rigging} />
          <EssenceCharacterStats essence={this.props.essence} essenceDetails={this.props.essenceDetails} />
          <KarmaCharacterStats karma={this.props.karma} />
        </Card.Body>
      </Card>
    );
  }
}
