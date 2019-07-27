import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { createConnection, Connection } from 'typeorm';
import * as Winston from 'winston';
import { CharacterDbEntity } from 'models-manager/models/character-db-entity';
import { LocationDbEntity } from 'models-manager/models/location-db-entity';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';
import { ModelEngineController } from '@sr2020/sr2020-models/controllers/model-engine.controller';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { loadModels, requireDir } from '@sr2020/alice-model-engine/utils';
import { Config } from '@sr2020/alice-model-engine/config';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { TimeService } from '@sr2020/models-manager/services/time.service';
import { PushService } from '@sr2020/interface/services/push.service';
import { PushNotification, PushResult } from '@sr2020/interface/models';
import { getDbConnectionOptions } from '@sr2020/models-manager/utils/connection';

import * as dotenv from 'dotenv';

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

class MockTimeService implements TimeService {
  private _timestamp = 0;

  timestamp(): number {
    return this._timestamp;
  }

  advanceTime(seconds: number) {
    this._timestamp += 1000 * seconds;
  }
}

class MockPushService implements PushService {
  private notifications: { [characterId: number]: PushNotification[] };

  send(recipient: number, notification: PushNotification): PushResult {
    if (this.notifications[recipient] == undefined) {
      this.notifications[recipient] = [];
    }

    this.notifications[recipient].push(notification);

    return new PushResult();
  }

  get(characterId: number | string) {
    return this.notifications[Number(characterId)];
  }

  reset() {
    this.notifications = {};
  }
}

export class TestFixture {
  constructor(
    public client: Client,
    private _connection: Connection,
    private _app: ModelsManagerApplication,
    private _timeService: MockTimeService,
    private _pushService: MockPushService,
  ) {}

  static async create(): Promise<TestFixture> {
    const restConfig = givenHttpServerConfig({});

    const app = new ModelsManagerApplication({
      rest: restConfig,
    });

    await app.boot();

    app.bind('services.ModelEngineService').to(new ModelEngineController(characterEngine, locationEngine));

    const timeService = new MockTimeService();
    app.bind('services.TimeService').to(timeService);

    const pushService = new MockPushService();
    app.bind('services.PushService').to(pushService);

    let connection: Connection;
    if (process.env.NODE_ENV == 'test') {
      connection = await createConnection({ ...getDbConnectionOptions(), database: undefined, type: 'sqljs' });
    } else {
      dotenv.config({ path: '../../.env' });
      connection = await createConnection(getDbConnectionOptions());
    }

    await app.start();

    const client = createRestAppClient(app);

    return new TestFixture(client, connection, app, timeService, pushService);
  }

  async saveCharacter(model: Partial<Sr2020Character> = {}) {
    await this._connection
      .getRepository(CharacterDbEntity)
      .save(new CharacterDbEntity().fromModel({ ...getDefaultCharacter(this._timeService.timestamp()), ...model }));
  }

  async saveLocation(model: Partial<Location> = {}) {
    await this._connection
      .getRepository(LocationDbEntity)
      .save(new LocationDbEntity().fromModel({ ...getDefaultLocation(this._timeService.timestamp()), ...model }));
  }

  async getCharacter(id: number | string = 0): Promise<Sr2020Character> {
    const entity = await this._connection.getRepository(CharacterDbEntity).findOneOrFail(id);
    return entity.getModel();
  }

  getCharacterNotifications(id: number | string = 0): PushNotification[] {
    return this._pushService.get(id);
  }

  async getLocation(id: number | string = 0): Promise<Location> {
    const entity = await this._connection.getRepository(LocationDbEntity).findOneOrFail(id);
    return entity.getModel();
  }

  async sendCharacterEvent(event: EventRequest, id: number | string = 0) {
    this._pushService.reset();
    await this.client
      .post(`/character/model/${id}`)
      .send(event)
      .expect(200);
  }

  async refreshCharacter(id: number | string = 0) {
    await this.client.get(`/character/model/${id}`).expect(200);
  }

  async sendLocationEvent(event: EventRequest, id: number | string = 0) {
    this._pushService.reset();
    await this.client
      .post(`/location/model/${id}`)
      .send(event)
      .expect(200);
  }

  async refreshLocation(id: number | string = 0) {
    await this.client.get(`/location/model/${id}`).expect(200);
  }

  async advanceTime(seconds: number) {
    await this._timeService.advanceTime(seconds);
  }

  async destroy() {
    await this._connection.close();
    await this._app.close();
  }
}

function getDefaultCharacter(timestamp: number): Sr2020Character {
  return {
    spellsCasted: 0,

    modelId: '0',
    timestamp,
    conditions: [],
    modifiers: [],
    timers: {},
  };
}

function getDefaultLocation(timestamp: number): Location {
  return {
    manaDensity: 0,

    modelId: '0',
    timestamp,
    conditions: [],
    modifiers: [],
    timers: {},
  };
}
