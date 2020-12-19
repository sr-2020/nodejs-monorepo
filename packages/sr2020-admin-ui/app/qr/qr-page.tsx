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
import { WriteFeatureCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-feature-card';
import { WriteFoodCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-food-card';
import { WriteFocusCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-focus-card';
import { WriteEthicCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-ethic-card';
import { WriteReanimateCapsuleCard } from '@alice/sr2020-admin-ui/app/qr/cards/write-reanimate-capsule-card';
import { ClearQrCard } from '@alice/sr2020-admin-ui/app/qr/cards/clear-card';

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
    if (this.props.qr.type != 'empty') {
      return (
        <div>
          <BasicQrStatsCard {...this.props.qr} />
          <CardDeck className="mt-3">
            <ClearQrCard sendEvent={this.sendEvent} />
          </CardDeck>
        </div>
      );
    }

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
        <CardDeck className="mt-3">
          <WriteFeatureCard sendEvent={this.sendEvent} />
          <WriteFoodCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <WriteFocusCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <WriteEthicCard sendEvent={this.sendEvent} />
        </CardDeck>
        <CardDeck className="mt-3">
          <WriteReanimateCapsuleCard sendEvent={this.sendEvent} />
        </CardDeck>
      </div>
    );
  }
}

export class QrPage extends React.Component<{ idToLoad?: string; addToast: AddToast }, { qr: QrCode | undefined; desiredQrId: string }> {
  state = { qr: undefined, desiredQrId: '' };

  componentDidMount() {
    if (this.props.idToLoad) {
      this.setState({ desiredQrId: this.props.idToLoad });
      this.loadQr(this.props.idToLoad);
    }
  }

  async loadQr(id: string) {
    try {
      const qr = await getQr(id);
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
              <Button variant="outline-primary" onClick={() => this.loadQr(this.state.desiredQrId)}>
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
