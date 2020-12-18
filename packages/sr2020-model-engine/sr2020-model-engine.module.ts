import { HttpModule, Module } from '@nestjs/common';
import { PingController } from '@alice/alice-common/controllers/ping.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ModelEngineController } from '@alice/sr2020-model-engine/controllers/model-engine.controller';
import { DictionariesController } from '@alice/sr2020-model-engine/controllers/dictionaries.controller';
import { loadModels, TestFolderLoader, WebpackFolderLoader } from '@alice/alice-model-engine/utils';
import { Engine } from '@alice/alice-model-engine/engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { Location } from '@alice/sr2020-common/models/location.model';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';

function isTest() {
  return process.env.NODE_ENV == 'test';
}

function createCharacterEngine(): Engine<Sr2020Character> {
  const loader = isTest()
    ? new TestFolderLoader('./scripts/character')
    : new WebpackFolderLoader(require.context('./scripts/character', true, /.*\.ts/));
  return new Engine<Sr2020Character>(loadModels(loader));
}

function createLocationEngine(): Engine<Location> {
  const loader = isTest()
    ? new TestFolderLoader('./scripts/location')
    : new WebpackFolderLoader(require.context('./scripts/location', true, /.*\.ts/));
  return new Engine<Location>(loadModels(loader));
}

function createQrEngine(): Engine<QrCode> {
  const loader = isTest() ? new TestFolderLoader('./scripts/qr') : new WebpackFolderLoader(require.context('./scripts/qr', true, /.*\.ts/));
  return new Engine<QrCode>(loadModels(loader));
}

@Module({
  imports: [
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
      renderPath: '/',
    }),
  ],
  controllers: [PingController, ModelEngineController, DictionariesController],
  providers: [
    { provide: Engine.bindingKey + '.Sr2020Character', useFactory: createCharacterEngine },
    { provide: Engine.bindingKey + '.Location', useFactory: createLocationEngine },
    { provide: Engine.bindingKey + '.QrCode', useFactory: createQrEngine },
  ],
})
export class Sr2020ModelEngineModule {}
