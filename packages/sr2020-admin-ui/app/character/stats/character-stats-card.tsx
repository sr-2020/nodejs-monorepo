import React from 'react';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Accordion, Card } from 'react-bootstrap';
import { BasicCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/basic-character-stats';
import { MagicCharactersStats } from '@alice/sr2020-admin-ui/app/character/stats/magic-character-stats';
import { HackerCharactersStats } from '@alice/sr2020-admin-ui/app/character/stats/hacker-character-stats';
import { EconomicCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/economic-character-stats';
import { ChemoCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/chemo-character-stats';
import { RiggerCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/rigger-character-stats';
import { EssenceCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/essence-character-stats';
import { KarmaCharacterStats } from '@alice/sr2020-admin-ui/app/character/stats/karma-character-stats';
import QRCode from 'qrcode.react';
import { WideButton } from '@alice/sr2020-admin-ui/app/components/wide-button';
import { encodeQr } from '@alice/sr2020-admin-ui/app/api/encode-qr';

export class CharacterStatsCard extends React.Component<Sr2020Character, { encodedQrCode: string }> {
  state = { encodedQrCode: '' };

  componentDidMount() {
    const timestamp = Math.round(new Date().getTime() / 1000) + 3600;
    encodeQr({ type: this.getQrType(this.props), kind: 0, validUntil: timestamp, payload: this.props.modelId }).then((encodedQrCode) =>
      this.setState({ encodedQrCode }),
    );
  }

  componentDidUpdate(prevProps: Readonly<Sr2020Character>) {
    if (prevProps.modelId != this.props.modelId || prevProps.timestamp != this.props.timestamp) {
      this.componentDidMount();
    }
  }

  getQrType(model: Sr2020Character) {
    if (model.currentBody == 'astral') return 9;
    if (model.currentBody == 'drone') return 10;
    if (model.currentBody == 'physical') {
      if (model.healthState == 'healthy') return 5;
      if (model.healthState == 'wounded') return 6;
      if (model.healthState == 'clinically_dead') return 7;
      if (model.healthState == 'biologically_dead') return 8;
    }
  }

  render() {
    return (
      <Card>
        <Card.Body>
          Персонаж {this.props.name} (model ID = {this.props.modelId}), состояние на{' '}
          {new Date(this.props.timestamp).toLocaleString('ru-RU')}
          <Accordion>
            <Accordion.Toggle as={WideButton} eventKey="0">
              QR-код персонажа
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">{this.renderQr()}</Accordion.Collapse>
          </Accordion>
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

  renderQr() {
    if (!this.state.encodedQrCode) return <div>Загрузка...</div>;
    return <QRCode value={this.state.encodedQrCode} size={300} includeMargin={true} />;
  }
}
