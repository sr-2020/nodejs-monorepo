import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';

export class SR2020ModelsApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, 'static'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // TODO: Uncomment when models and catalogs are added
    // this.bind(Engine.bindingKey).to(new Engine(loadModels('./models'), Config.parse(requireDir('./catalogs'))));

    this.projectRoot = __dirname + '/../';
    const dirs = ['sr2020-models'];
    // Customize @loopback/boot Booter Conventions here
    const extension = require.extensions['.ts'] ? 'ts' : 'js';
    this.bootOptions = {
      controllers: {
        dirs,
        extensions: [`.controller.${extension}`],
      },
      datasources: {
        dirs,
        extensions: [`.datasource.${extension}`],
      },
      repositories: {
        dirs,
        extensions: [`.repository.${extension}`],
      },
      services: {
        dirs,
        extensions: [`.service.${extension}`],
      },
    };
  }
}
