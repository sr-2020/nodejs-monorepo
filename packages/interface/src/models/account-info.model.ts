import { model, property } from '@loopback/repository';
import { Transaction } from './transaction.model';
import { rproperty, EmptyModel, JsonColumn, ModelApiInterface } from './alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from './process-requests-respose';
import { Entity } from 'typeorm';

@model()
@Entity({
  name: 'account-info',
})
export class AccountInfo extends EmptyModel {
  sin?: number;

  @rproperty()
  balance: number;

  @property.array(Transaction, { required: true })
  @JsonColumn()
  history: Transaction[];
}

export type AccountInfoApi = ModelApiInterface<AccountInfo>;

@model()
export class AccountInfoProcessRequest extends BaseModelProcessRequest {
  @rproperty()
  baseModel: AccountInfo;
}

@model()
export class AccountInfoProcessResponse extends BaseModelProcessResponse {
  @rproperty()
  baseModel: AccountInfo;

  @rproperty()
  workModel: AccountInfo;
}
