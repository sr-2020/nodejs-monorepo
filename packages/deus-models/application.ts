import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { Engine } from '@sr2020/alice-model-engine/engine';
import { loadModels, requireDir } from '@sr2020/alice-model-engine/utils';
import { Config } from '@sr2020/alice-model-engine/config';

export class DeusModelsApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, 'static'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind(Engine.bindingKey).to(new Engine(loadModels('./models'), Config.parse(requireDir('./catalogs'))));

    this.projectRoot = __dirname + '/../';
    const dirs = ['deus-models'];
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        dirs,
      },
      datasources: {
        dirs,
      },
      repositories: {
        dirs,
      },
      services: {
        dirs,
      },
    };
  }
}
