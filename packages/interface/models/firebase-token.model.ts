import { Entity, model, property } from '@loopback/repository';

@model({
  name: 'firebase_tokens',
})
export class FirebaseToken extends Entity {
  @property({ type: 'number', id: true, required: true })
  id: number;

  @property({ type: 'string' })
  token?: string;

  constructor(data?: Partial<FirebaseToken>) {
    super(data);
  }
}

export interface FirebaseTokenRelations {
  // describe navigational properties here
}

export type FirebaseTokenWithRelations = FirebaseToken & FirebaseTokenRelations;
