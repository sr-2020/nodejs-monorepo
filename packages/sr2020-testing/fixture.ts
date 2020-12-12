import { Client, createRestAppClient, givenHttpServerConfig } from '@loopback/testlab';
import { Engine } from '@alice/alice-model-engine/engine';
import { loadModels, TestFolderLoader } from '@alice/alice-model-engine/utils';
import { PubSubNotification, PushNotification } from '@alice/alice-common/models/push-notification.model';
import { PushResult } from '@alice/alice-common/models/push-result.model';
import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { Location } from '@alice/sr2020-common//models/location.model';
import { QrCode } from '@alice/sr2020-common//models/qr-code.model';
import { Sr2020Character } from '@alice/sr2020-common//models/sr2020-character.model';
import { PushService } from '@alice/alice-common/services/push.service';
import { ModelsManagerApplication } from '@alice/sr2020-models-manager/application';
import { TimeService } from '@alice/alice-models-manager/services/time.service';
import { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import { getDbConnectionOptions } from '@alice/sr2020-models-manager/utils/connection';
import { ModelEngineController } from '@alice/sr2020-model-engine/controllers/model-engine.controller';
import * as dotenv from 'dotenv';
import { Connection, createConnection } from 'typeorm';
import { ModelProcessResponse } from '@alice/alice-common/models/process-requests-respose';
import { Duration } from 'moment';
import { LoggerService } from '@alice/alice-models-manager/services/logger.service';
import { logger } from '@alice/alice-model-engine/logger';
import * as Path from 'path';

logger.level = 'error';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

// Those are singletones intentionally - so model scripts are only loaded once.
const characterEngine = new Engine<Sr2020Character>(
  loadModels(new TestFolderLoader(Path.resolve(__dirname, '../sr2020-model-engine/scripts/character'))),
);
const locationEngine = new Engine<Location>(
  loadModels(new TestFolderLoader(Path.resolve(__dirname, '../sr2020-model-engine/scripts/location'))),
);
const qrCodeEngine = new Engine<QrCode>(loadModels(new TestFolderLoader(Path.resolve(__dirname, '../sr2020-model-engine/scripts/qr'))));

class MockTimeService implements TimeService {
  private _timestamp = 0;

  timestamp(): number {
    return this._timestamp;
  }

  advanceTime(d: Duration) {
    this._timestamp += d.asMilliseconds();
  }

  reset() {
    this._timestamp = 0;
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

class NoOpLoggerService implements LoggerService {
  debug(msg: string, meta?: any): void {}
  info(msg: string, meta?: any): void {}
  warning(msg: string, meta?: any): void {}
  error(msg: string, meta?: any): void {}
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

  static cached: TestFixture | null = null;

  static async create(): Promise<TestFixture> {
    if (this.cached) return this.cached;

    const restConfig = givenHttpServerConfig({});

    const app = new ModelsManagerApplication({
      rest: restConfig,
    });

    app.bind('services.ModelEngineService').to(new ModelEngineController(characterEngine, locationEngine, qrCodeEngine));

    const timeService = new MockTimeService();
    app.bind('services.TimeService').to(timeService);

    const pushService = new MockPushService();
    app.bind('services.PushService').to(pushService);

    const pubSubService = new MockPubSubService();
    app.bind('services.PubSubService').to(pubSubService);

    const loggerService = new NoOpLoggerService();
    app.bind('services.LoggerService').to(loggerService);

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

    this.cached = new TestFixture(client, connection, app, timeService, pushService, pubSubService);
    return this.cached;
  }

  async saveCharacter(model: DeepPartial<Sr2020Character> = {}) {
    const id = model.modelId ?? 0;
    await this.client.put(`/character/default/${id}`).send({}).expect(200);
    const character = await this._connection.getRepository(Sr2020Character).findOneOrFail(id);
    await this._connection.getRepository(Sr2020Character).save({ ...character, ...model });
  }

  async saveLocation(model: DeepPartial<Location> = {}) {
    const id = model.modelId ?? 0;
    await this.client.put(`/location/default/${id}`).send({}).expect(200);
    const location = await this._connection.getRepository(Location).findOneOrFail(id);
    await this._connection.getRepository(Location).save({ ...location, ...model });
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
    this._pubSubService.reset();
    const resp = await this.client.post(`/character/model/${id}`).send(event).expect(200);
    return resp.body;
  }

  async sendCharacterEventExpectingError(event: EventRequest, id: number | string = 0): Promise<string | undefined> {
    this._pushService.reset();
    this._pubSubService.reset();
    const resp = await this.client.post(`/character/model/${id}`).send(event).expect(400);
    return resp?.body?.error?.message;
  }

  addCharacterFeature(featureId: string, characterId: number | string = 0): Promise<ModelProcessResponse<Sr2020Character>> {
    return this.sendCharacterEvent({ eventType: 'addFeature', data: { id: featureId } }, characterId);
  }

  useAbility(data: unknown, characterId: number | string = 0): Promise<ModelProcessResponse<Sr2020Character>> {
    return this.sendCharacterEvent({ eventType: 'useAbility', data }, characterId);
  }

  async getCharacter(id: number | string = 0): Promise<ModelProcessResponse<Sr2020Character>> {
    return (await this.client.get(`/character/model/${id}`).expect(200)).body;
  }

  async sendLocationEvent(event: EventRequest, id: number | string = 0): Promise<ModelProcessResponse<Location>> {
    this._pushService.reset();
    const resp = await this.client.post(`/location/model/${id}`).send(event).expect(200);
    return resp.body;
  }

  async getLocation(id: number | string = 0): Promise<ModelProcessResponse<Location>> {
    return (await this.client.get(`/location/model/${id}`).expect(200)).body;
  }

  async sendQrCodeEvent(event: EventRequest, id: number | string = 0): Promise<ModelProcessResponse<QrCode>> {
    this._pushService.reset();
    const resp = await this.client.post(`/qr/model/${id}`).send(event).expect(200);
    return resp.body;
  }

  async getQrCode(id: number | string = 0): Promise<ModelProcessResponse<QrCode>> {
    return (await this.client.get(`/qr/model/${id}`).expect(200)).body;
  }

  async advanceTime(d: Duration) {
    this._timeService.advanceTime(d);
  }

  async destroy() {
    await this._connection.getRepository(Sr2020Character).clear();
    await this._connection.getRepository(Location).clear();
    await this._connection.getRepository(QrCode).clear();
    this._pushService.reset();
    this._pubSubService.reset();
    this._timeService.reset();
  }
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
    timers: [],
  };
}
