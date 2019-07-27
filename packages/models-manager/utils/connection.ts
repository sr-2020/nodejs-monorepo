import { CharacterDbEntity } from '../models/character-db-entity';
import { LocationDbEntity } from '../models/location-db-entity';
import { ConnectionOptions } from 'typeorm';

export function getDbConnectionOptions(): ConnectionOptions {
  return {
    type: 'mysql',
    database: 'model',
    host: process.env.MYSQL_HOST!!,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD!!,
    synchronize: true,
    entities: [CharacterDbEntity, LocationDbEntity],
  };
}
