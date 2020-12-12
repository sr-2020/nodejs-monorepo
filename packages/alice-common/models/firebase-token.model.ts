import { model } from '@loopback/repository';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { rproperty } from '@alice/alice-common/models/alice-model-engine';

@model()
@Entity({
  name: 'firebase_tokens',
})
export class FirebaseToken {
  @rproperty() @PrimaryColumn() id: number;

  @rproperty() @Column() token: string;
}
