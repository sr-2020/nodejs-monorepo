import React from 'react';
import { encodeQr } from '@alice/sr2020-admin-ui/app/api/encode-qr';
import { Card, Table } from 'react-bootstrap';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import QRCode from 'qrcode.react';

export class BasicQrStatsCard extends React.Component<QrCode, { encodedQrCode: string }> {
  state = { encodedQrCode: '' };

  componentDidMount() {
    const timestamp = Math.round(new Date().getTime() / 1000) + 3600000;
    encodeQr({ type: 1, kind: 0, validUntil: timestamp, payload: this.props.modelId }).then((encodedQrCode) =>
      this.setState({ encodedQrCode }),
    );
  }

  componentDidUpdate(prevProps: Readonly<QrCode>) {
    if (prevProps.modelId != this.props.modelId || prevProps.timestamp != this.props.timestamp) {
      this.componentDidMount();
    }
  }

  render() {
    return (
      <div>
        <Card>
          <Card.Body>{this.renderQr()}</Card.Body>
        </Card>
        <Card>
          <Card.Body>
            QR-код {this.props.modelId}, состояние на {new Date(this.props.timestamp).toLocaleString('ru-RU')}. <br />
            Закодированный формат:
            {' ' + this.state.encodedQrCode}.
            <Table size="sm">
              <tbody>
                <tr>
                  <th>Тип</th>
                  <td>{this.props.type}</td>
                </tr>
                <tr>
                  <th>Количество использований</th>
                  <td>{this.props.usesLeft}</td>
                </tr>
                <tr>
                  <th>Название</th>
                  <td>{this.props.name}</td>
                </tr>
                <tr>
                  <th>Описание</th>
                  <td>{this.props.description}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  }

  renderQr() {
    if (!this.state.encodedQrCode) return <div>Загрузка...</div>;
    return <QRCode value={this.state.encodedQrCode} size={300} includeMargin={true} />;
  }
}
