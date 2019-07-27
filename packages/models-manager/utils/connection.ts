import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { ConnectionOptions } from 'typeorm';

export function getDbConnectionOptions(): ConnectionOptions {
  return {
    type: 'mysql',
    database: 'model',
    host: process.env.MYSQL_HOST!!,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD!!,
    synchronize: true,
    entities: [Sr2020Character, Location],
  };
}
