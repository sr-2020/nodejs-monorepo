import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';

export class PushApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname + '/../../';
    const dirs = ['push', 'interface'];
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        dirs,
        extensions: ['.controller.js', '.controller.ts'],
      },
      datasources: {
        dirs,
        extensions: ['.datasource.js', '.datasource.ts'],
      },
      repositories: {
        dirs,
        extensions: ['.repository.js', '.repository.ts'],
      },
      services: {
        dirs,
        extensions: ['.service.js', '.service.ts'],
      },
    };
  }
}
