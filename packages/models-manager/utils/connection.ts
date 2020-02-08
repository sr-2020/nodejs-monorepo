import { Location } from '@sr2020/interface/models/location.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { ConnectionOptions } from 'typeorm';

export function getDbConnectionOptions(): ConnectionOptions {
  return {
    type: 'postgres',
    database: 'model',
    host: process.env.POSTGRESQL_HOST!,
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD!,
    synchronize: true,
    entities: [Sr2020Character, Location, QrCode],
  };
}
