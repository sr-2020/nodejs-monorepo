import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { Engine } from '@alice/alice-model-engine/engine';
import { loadModels, requireDir, TestFolderLoader, WebpackFolderLoader } from '@alice/alice-model-engine/utils';
import { Config } from '@alice/alice-model-engine/config';
import { PingController } from '@alice/deus-model-engine/controllers/ping.controller';
import { ModelEngineController } from '@alice/deus-model-engine/controllers/model-engine.controller';

export class DeusModelsApplication extends ServiceMixin(RepositoryMixin(RestApplication)) {
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
    const modelsLoader = isTest ? new TestFolderLoader('./models') : new WebpackFolderLoader(require.context('./models', true, /.*\.ts/));
    const catalogsLoader = isTest
      ? new TestFolderLoader('./catalogs')
      : new WebpackFolderLoader(require.context('./catalogs', true, /.*\.json/));

    this.bind(Engine.bindingKey).to(new Engine(loadModels(modelsLoader), Config.parse(requireDir(catalogsLoader))));
    this.bind('controllers.PingController').toClass(PingController);
    this.bind('controllers.ModelEngineController').toClass(ModelEngineController);
  }
}
