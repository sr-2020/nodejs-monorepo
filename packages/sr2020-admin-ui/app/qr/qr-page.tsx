import React from 'react';
import { Button, CardDeck, FormControl, InputGroup } from 'react-bootstrap';
import { AddToast } from 'react-toast-notifications';
import { getQr, sendQrEvent } from '@alice/sr2020-admin-ui/app/api/models-manager';
import { SendEvent } from '@alice/sr2020-admin-ui/app/api/event-sender';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { BasicQrStatsCard } from '@alice/sr2020-admin-ui/app/qr/stats/basic-qr-stats';
import { WriteImplantCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-implant-card';
import { WritePillCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-pill-card';
import { WriteReagentCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-reagent-card';
import { WriteDroneCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-drone-card';
import { WriteCyberdeckCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-cyberdeck-card';
import { WriteSoftwareCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-software-card';
import { WriteBodystorageCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-bodystorage-card';
import { WriteAiSymbolCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-ai-symbol-card';
import { WriteKarmaCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-karma-card';
import { WriteSpiritCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-spirit-card';

type SetQrCode = (qr: QrCode) => void;

export class LoadedQrCodePage extends React.Component<{ qr: QrCode; addToast: AddToast; setter: SetQrCode }> {
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
      this.props.setter(await sendQrEvent(this.props.qr.modelId, { eventType, data }));
      this.props.addToast(successMessage, { appearance: 'success' });
    } catch (e) {
      this.handleError(e);
    }
  };

  render() {
    return (
      <div>
        <BasicQrStatsCard {...this.props.qr} />
        <CardDeck className="mt-3">
          <WriteImplantCard sendEvent={this.sendEvent} />
          <WritePillCard sendEvent={this.sendEvent} />
          <WriteReagentCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <WriteDroneCard sendEvent={this.sendEvent} />
          <WriteCyberdeckCard sendEvent={this.sendEvent} />
          <WriteSoftwareCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <WriteBodystorageCard sendEvent={this.sendEvent} />
          <WriteAiSymbolCard sendEvent={this.sendEvent} />
          <WriteKarmaCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <WriteSpiritCard sendEvent={this.sendEvent} />
        </CardDeck>
      </div>
    );
  }

  // TODO: Запись фичи на QR
  // TODO: Запись еды на QR
  // TODO: Запись фокуса на QR
  // TODO: Запись локуса этической группы / универсального заряда на QR
  // TODO: Запись воскрешательной капсулы на QR
}

export class QrPage extends React.Component<{ id: string; addToast: AddToast }, { qr: QrCode | undefined; desiredQrId: string }> {
  state = { qr: undefined, desiredQrId: '1' };

  async loadQr() {
    try {
      const qr = await getQr(this.state.desiredQrId);
      this.setState({ qr });
      this.props.addToast('QR загружен', { appearance: 'success' });
    } catch (e) {
      this.props.addToast(e?.response?.status == 404 ? 'QR не найден' : `Неожиданная ошибка сервера: ${e?.response?.data?.statusText}`, {
        appearance: 'error',
      });
    }
  }

  render() {
    return (
      <div>
        <div className="mt-3">
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text>ID QR-кода</InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl type="number" value={this.state.desiredQrId} onChange={(e) => this.setState({ desiredQrId: e.target.value })} />
            <InputGroup.Append>
              <Button variant="outline-primary" onClick={() => this.loadQr()}>
                Обновить
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
        {this.state.qr ? (
          <LoadedQrCodePage qr={this.state.qr} addToast={this.props.addToast} setter={(qr) => this.setState({ qr })} />
        ) : (
          <div />
        )}
      </div>
    );
  }
}
