import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { createConnection, Connection } from 'typeorm';
import { CharacterDbEntity } from 'models-manager/models/character-db-entity';
import { LocationDbEntity } from 'models-manager/models/location-db-entity';

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

    // TODO(aeremin): return some helper which will allow to save/read models
    return new TestFixture(client, connection, app);
  }

  async destroy() {
    await this._connection.close();
    await this._app.close();
  }
}
