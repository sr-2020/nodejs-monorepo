import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { createConnection, Connection } from 'typeorm';
import { CharacterDbEntity, fromModel as fromCharacterModel } from 'models-manager/models/character-db-entity';
import { LocationDbEntity, fromModel as fromLocationModel } from 'models-manager/models/location-db-entity';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';
import { getDefaultCharacter, getDefaultLocation } from '@sr2020/sr2020-models/testing/test-helper';

export class TestFixture {
  constructor(public client: Client, private _connection: Connection, private _app: ModelsManagerApplication) {}

  static async create(): Promise<TestFixture> {
    const restConfig = givenHttpServerConfig({});

    const app = new ModelsManagerApplication({
      rest: restConfig,
    });

    await app.boot();
    // TODO(aeremin): bind model engine service
    const connection = await createConnection({
      type: 'sqljs',
      synchronize: true,
      entities: [CharacterDbEntity, LocationDbEntity],
    });
    await app.start();

    const client = createRestAppClient(app);

    return new TestFixture(client, connection, app);
  }

  async saveCharacter(model: Partial<Sr2020Character>) {
    await this._connection.getRepository(CharacterDbEntity).save(fromCharacterModel({ ...getDefaultCharacter(), ...model }));
  }

  async saveLocation(model: Partial<Location>) {
    await this._connection.getRepository(LocationDbEntity).save(fromLocationModel({ ...getDefaultLocation(), ...model }));
  }

  async getCharacter(id: number | string = 0): Promise<Sr2020Character> {
    const entity = await this._connection.getRepository(CharacterDbEntity).findOneOrFail(id);
    return entity.getModel();
  }

  async getLocation(id: number | string = 0): Promise<Location> {
    const entity = await this._connection.getRepository(LocationDbEntity).findOneOrFail(id);
    return entity.getModel();
  }

  async destroy() {
    await this._connection.close();
    await this._app.close();
  }
}
