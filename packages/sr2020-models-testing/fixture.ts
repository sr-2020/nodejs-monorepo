import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { createConnection, Connection } from 'typeorm';
import * as Winston from 'winston';
import { CharacterDbEntity, fromModel as fromCharacterModel } from 'models-manager/models/character-db-entity';
import { LocationDbEntity, fromModel as fromLocationModel } from 'models-manager/models/location-db-entity';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';
import { ModelEngineController } from '@sr2020/sr2020-models/controllers/model-engine.controller';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { loadModels, requireDir } from '@sr2020/alice-model-engine/utils';
import { Config } from '@sr2020/alice-model-engine/config';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';

(Winston as any).level = 'error';

// Those are singletones intentionally - so model scripts are only loaded once.
const characterEngine = new Engine<Sr2020Character>(
  loadModels('../sr2020-models/scripts/character'),
  Config.parse(requireDir('../sr2020-models/scripts/character/catalogs')),
);
const locationEngine = new Engine<Location>(
  loadModels('../sr2020-models/scripts/location'),
  Config.parse(requireDir('../sr2020-models/scripts/location/catalogs')),
);

export class TestFixture {
  constructor(public client: Client, private _connection: Connection, private _app: ModelsManagerApplication) {}

  static async create(): Promise<TestFixture> {
    const restConfig = givenHttpServerConfig({});

    const app = new ModelsManagerApplication({
      rest: restConfig,
    });

    await app.boot();

    app.bind('services.ModelEngineService').to(new ModelEngineController(characterEngine, locationEngine));

    const connection = await createConnection({
      type: 'sqljs',
      synchronize: true,
      entities: [CharacterDbEntity, LocationDbEntity],
    });
    await app.start();

    const client = createRestAppClient(app);

    return new TestFixture(client, connection, app);
  }

  async saveCharacter(model: Partial<Sr2020Character> = {}) {
    await this._connection.getRepository(CharacterDbEntity).save(fromCharacterModel({ ...getDefaultCharacter(), ...model }));
  }

  async saveLocation(model: Partial<Location> = {}) {
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

  async sendCharacterEvent(event: EventRequest, id: number | string = 0) {
    await this.client
      .post(`/character/model/${id}`)
      .send(event)
      .expect(200);
  }

  async sendLocationEvent(event: EventRequest, id: number | string = 0) {
    await this.client
      .post(`/location/model/${id}`)
      .send(event)
      .expect(200);
  }

  async destroy() {
    await this._connection.close();
    await this._app.close();
  }
}

function getDefaultCharacter(): Sr2020Character {
  return {
    spellsCasted: 0,

    modelId: '0',
    timestamp: 0,
    conditions: [],
    modifiers: [],
    timers: {},
  };
}

function getDefaultLocation(): Location {
  return {
    manaDensity: 0,

    modelId: '0',
    timestamp: 0,
    conditions: [],
    modifiers: [],
    timers: {},
  };
}
