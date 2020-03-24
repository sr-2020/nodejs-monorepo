import { Client, createRestAppClient, givenHttpServerConfig } from '@loopback/testlab';
import { Config } from '@sr2020/alice-model-engine/config';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { loadModels, requireDir } from '@sr2020/alice-model-engine/utils';
import { PushNotification, PushResult, PubSubNotification } from '@sr2020/interface/models';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { PushService } from '@sr2020/interface/services/push.service';
import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { TimeService } from '@sr2020/models-manager/services/time.service';
import { PubSubService } from '@sr2020/models-manager/services/pubsub.service';
import { getDbConnectionOptions } from '@sr2020/models-manager/utils/connection';
import { ModelEngineController } from '@sr2020/sr2020-models/controllers/model-engine.controller';
import * as dotenv from 'dotenv';
import { Connection, createConnection } from 'typeorm';
import * as Winston from 'winston';
import { ModelProcessResponse } from '@sr2020/interface/models/process-requests-respose';

(Winston as any).level = 'error';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

// Those are singletones intentionally - so model scripts are only loaded once.
const characterEngine = new Engine<Sr2020Character>(
  loadModels('../sr2020-models/scripts/character'),
  Config.parse(requireDir('../sr2020-models/scripts/character/catalogs')),
);
const locationEngine = new Engine<Location>(
  loadModels('../sr2020-models/scripts/location'),
  Config.parse(requireDir('../sr2020-models/scripts/location/catalogs')),
);
const qrCodeEngine = new Engine<QrCode>(
  loadModels('../sr2020-models/scripts/qr'),
  Config.parse(requireDir('../sr2020-models/scripts/qr/catalogs')),
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
  private notifications: { [characterId: number]: PushNotification[] } = {};

  async send(recipient: number, notification: PushNotification): Promise<PushResult> {
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

class MockPubSubService implements PubSubService {
  private notifications: PubSubNotification[] = [];

  async publish(topic: string, body: any): Promise<string> {
    this.notifications.push({ topic, body });
    return '';
  }

  get() {
    return this.notifications;
  }

  reset() {
    this.notifications = [];
  }
}

export class TestFixture {
  constructor(
    public client: Client,
    private _connection: Connection,
    private _app: ModelsManagerApplication,
    private _timeService: MockTimeService,
    private _pushService: MockPushService,
    private _pubSubService: MockPubSubService,
  ) {}

  static async create(): Promise<TestFixture> {
    const restConfig = givenHttpServerConfig({});

    const app = new ModelsManagerApplication({
      rest: restConfig,
    });

    await app.boot();

    app.bind('services.ModelEngineService').to(new ModelEngineController(characterEngine, locationEngine, qrCodeEngine));

    const timeService = new MockTimeService();
    app.bind('services.TimeService').to(timeService);

    const pushService = new MockPushService();
    app.bind('services.PushService').to(pushService);

    const pubSubService = new MockPubSubService();
    app.bind('services.PubSubService').to(pubSubService);

    let connection: Connection;
    if (process.env.NODE_ENV == 'test') {
      const prodConnectionOptions = getDbConnectionOptions();
      connection = await createConnection({ type: 'sqljs', entities: prodConnectionOptions.entities, synchronize: true });
    } else {
      dotenv.config({ path: '../../.env' });
      connection = await createConnection(getDbConnectionOptions());
    }

    await app.start();

    const client = createRestAppClient(app);

    return new TestFixture(client, connection, app, timeService, pushService, pubSubService);
  }

  async saveCharacter(model: DeepPartial<Sr2020Character> = {}) {
    const id = model.modelId ?? 0;
    await this.client
      .put(`/character/default/${id}?noAbilities=true`)
      .send({})
      .expect(200);
    const character = await this._connection.getRepository(Sr2020Character).findOneOrFail(id);
    await this._connection.getRepository(Sr2020Character).save({ ...character, ...model });
  }

  async saveLocation(model: DeepPartial<Location> = {}) {
    await this._connection.getRepository(Location).save({ ...getDefaultLocation(this._timeService.timestamp()), ...model });
  }

  async saveQrCode(model: DeepPartial<QrCode> = {}) {
    await this._connection.getRepository(QrCode).save({ ...getDefaultQrCode(this._timeService.timestamp()), ...model });
  }

  getCharacterNotifications(id: number | string = 0): PushNotification[] {
    return this._pushService.get(id) ?? [];
  }

  getPubSubNotifications(): PubSubNotification[] {
    return this._pubSubService.get();
  }

  async sendCharacterEvent(event: EventRequest, id: number | string = 0): Promise<ModelProcessResponse<Sr2020Character>> {
    this._pushService.reset();
    const resp = await this.client
      .post(`/character/model/${id}`)
      .send(event)
      .expect(200);
    return resp.body;
  }

  async getCharacter(id: number | string = 0): Promise<ModelProcessResponse<Sr2020Character>> {
    return (await this.client.get(`/character/model/${id}`).expect(200)).body;
  }

  async sendLocationEvent(event: EventRequest, id: number | string = 0): Promise<ModelProcessResponse<Location>> {
    this._pushService.reset();
    const resp = await this.client
      .post(`/location/model/${id}`)
      .send(event)
      .expect(200);
    return resp.body;
  }

  async getLocation(id: number | string = 0): Promise<ModelProcessResponse<Location>> {
    return (await this.client.get(`/location/model/${id}`).expect(200)).body;
  }

  async sendQrCodeEvent(event: EventRequest, id: number | string = 0): Promise<ModelProcessResponse<QrCode>> {
    this._pushService.reset();
    const resp = await this.client
      .post(`/qr/model/${id}`)
      .send(event)
      .expect(200);
    return resp.body;
  }

  async getQrCode(id: number | string = 0): Promise<ModelProcessResponse<QrCode>> {
    return (await this.client.get(`/qr/model/${id}`).expect(200)).body;
  }

  async advanceTime(seconds: number) {
    this._timeService.advanceTime(seconds);
  }

  async destroy() {
    await this._connection.getRepository(Sr2020Character).clear();
    await this._connection.getRepository(Location).clear();
    await this._connection.getRepository(QrCode).clear();
    await this._connection.close();
    this._app.close();
  }
}

function getDefaultLocation(timestamp: number): Location {
  return {
    manaDensity: 0,
    modelId: '0',
    spellTraces: [],
    timestamp,
    modifiers: [],
    timers: {},
  };
}

function getDefaultQrCode(timestamp: number): QrCode {
  return {
    type: 'empty',
    eventType: '_',
    name: '',
    description: '',
    usesLeft: 0,
    data: {},

    modelId: '0',
    timestamp,
    modifiers: [],
    timers: {},
  };
}
