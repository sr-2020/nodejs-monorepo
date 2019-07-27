import { model, property } from '@loopback/repository';
import { EmptyModel, ModelApiInterface, JsonColumn } from './alice-model-engine';
import { BaseModelProcessResponse, BaseModelProcessRequest } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

@model()
@Entity({
  name: 'qr',
})
export class QrCode extends EmptyModel {
  @property({ required: true })
  @Column()
  usesLeft: number = 0;

  @property({ required: true })
  @Column()
  type: string = 'empty';

  @property({ required: true })
  @Column()
  description: string = '';

  @property()
  @Column()
  eventType?: string;

  @property()
  @JsonColumn()
  data?: any;
}

export type QrCodeApi = ModelApiInterface<QrCode>;

@model()
export class QrCodeProcessRequest extends BaseModelProcessRequest {
  @property({ required: true })
  baseModel: QrCode;
}

@model()
export class QrCodeProcessResponse extends BaseModelProcessResponse {
  @property({ required: true })
  baseModel: QrCode;

  @property({ required: true })
  workModel: QrCode;
}
