import { Location } from '@alice/sr2020-common/models/location.model';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { ConnectionOptions, Entity } from 'typeorm';

@Entity({
  name: 'sr2020-character-cached',
})
export class Sr2020CharacterCached extends Sr2020Character {}

export function getDbConnectionOptions(): ConnectionOptions {
  return {
    type: 'postgres',
    database: 'model',
    host: process.env.POSTGRESQL_HOST!,
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD!,
    synchronize: true,
    entities: [Sr2020Character, Sr2020CharacterCached, Location, QrCode],
  };
}
