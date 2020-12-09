import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { Engine } from '@alice/alice-model-engine/engine';
import { loadModels, TestFolderLoader, WebpackFolderLoader } from '@alice/alice-model-engine/utils';
import { PingController } from '@alice/sr2020-model-engine/controllers/ping.controller';
import { ModelEngineController } from '@alice/sr2020-model-engine/controllers/model-engine.controller';
import { DictionariesController } from '@alice/sr2020-model-engine/controllers/dictionaries.controller';

export class SR2020ModelsApplication extends ServiceMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, 'assets'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    const isTest = process.env.NODE_ENV == 'test';
    const characterScriptsLoader = isTest
      ? new TestFolderLoader('./scripts/character')
      : new WebpackFolderLoader(require.context('./scripts/character', true, /.*\.ts/));
    const locationScriptsLoader = isTest
      ? new TestFolderLoader('./scripts/location')
      : new WebpackFolderLoader(require.context('./scripts/location', true, /.*\.ts/));
    const qrScriptsLoader = isTest
      ? new TestFolderLoader('./scripts/qr')
      : new WebpackFolderLoader(require.context('./scripts/qr', true, /.*\.ts/));

    this.bind(Engine.bindingKey + '.Sr2020Character').to(new Engine(loadModels(characterScriptsLoader)));
    this.bind(Engine.bindingKey + '.Location').to(new Engine(loadModels(locationScriptsLoader)));
    this.bind(Engine.bindingKey + '.QrCode').to(new Engine(loadModels(qrScriptsLoader)));
    this.bind('controllers.PingController').toClass(PingController);
    this.bind('controllers.ModelEngineController').toClass(ModelEngineController);
    this.bind('controllers.DictionariesController').toClass(DictionariesController);
  }
}
