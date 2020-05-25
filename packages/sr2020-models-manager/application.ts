import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication, RestBindings } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { CustomRejectProvider } from '@sr2020/alice-models-manager/services/reject.service';

export class ModelsManagerApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, 'static'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind(RestBindings.SequenceActions.REJECT).toProvider(CustomRejectProvider);

    this.projectRoot = __dirname + '/../';
    const dirs = ['alice-models-manager', 'sr2020-models-manager', 'sr2020-common', 'interface'];
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
