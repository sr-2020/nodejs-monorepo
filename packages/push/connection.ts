import { ConnectionOptions } from 'typeorm';
import { FirebaseToken } from '@alice/alice-common/models/firebase-token.model';

export function getDbConnectionOptions(): ConnectionOptions {
  return {
    type: 'postgres',
    database: 'push',
    host: process.env.POSTGRESQL_HOST!,
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD!,
    synchronize: false,
    entities: [FirebaseToken],
  };
}
