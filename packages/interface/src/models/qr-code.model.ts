import { model, property } from '@loopback/repository';
import { EmptyModel, ModelApiInterface, JsonColumn, rproperty } from './alice-model-engine';
import { BaseModelProcessResponse, BaseModelProcessRequest } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

@model()
@Entity({
  name: 'qr',
})
export class QrCode extends EmptyModel {
  @rproperty()
  @Column()
  usesLeft: number = 0;

  @rproperty()
  @Column()
  type: string = 'empty';

  @rproperty()
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
  @rproperty()
  baseModel: QrCode;
}

@model()
export class QrCodeProcessResponse extends BaseModelProcessResponse {
  @rproperty()
  baseModel: QrCode;

  @rproperty()
  workModel: QrCode;
}
