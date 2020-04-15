import { model, property } from '@loopback/repository';
import { EmptyModel, JsonColumn, rproperty } from './alice-model-engine';
import { BaseModelProcessResponse, BaseModelProcessRequest } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

export type QrType =
  | 'empty' // Empty QR, can be written.
  | 'implant' // Implant bought in the shop or cut from the body.
  | 'food' // Food item
  | 'ability' // Used for mental abilities - ability which affects the person who scanned it.
  | 'artifact' // Enchanted item.
  | 'event'; // Event which affects the person who scanned it.

@model()
@Entity({
  name: 'qr',
})
export class QrCode extends EmptyModel {
  @rproperty()
  @Column()
  usesLeft: number = 0;

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'empty' })
  type: QrType = 'empty';

  @rproperty()
  @Column({ default: '' })
  name: string = '';

  @rproperty()
  @Column({ default: '' })
  description: string = '';

  @property()
  @Column()
  eventType?: string;

  @property()
  @JsonColumn()
  data?: any;
}

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
