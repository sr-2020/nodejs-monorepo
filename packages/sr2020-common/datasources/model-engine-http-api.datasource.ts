import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

const baseURL: string = process.env.MODEL_ENGINE_URL ?? 'http://model-engine';

const config = {
  name: 'ModelEngineHttpApi',
  connector: 'rest',
  baseURL,
  options: {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  },
  crud: false,
  operations: [
    {
      template: {
        method: 'POST',
        url: `${baseURL}/character/process`,
        body: '{req}',
      },
      functions: {
        processCharacter: ['req'],
      },
    },
    {
      template: {
        method: 'POST',
        url: `${baseURL}/location/process`,
        body: '{req}',
      },
      functions: {
        processLocation: ['req'],
      },
    },
    {
      template: {
        method: 'POST',
        url: `${baseURL}/qr/process`,
        body: '{req}',
      },
      functions: {
        processQr: ['req'],
      },
    },
    {
      template: {
        method: 'POST',
        url: `${baseURL}/character/default`,
        body: '{req}',
      },
      functions: {
        defaultCharacter: ['req'],
      },
    },
    {
      template: {
        method: 'POST',
        url: `${baseURL}/location/default`,
        body: '{req}',
      },
      functions: {
        defaultLocation: ['req'],
      },
    },
    {
      template: {
        method: 'GET',
        url: `${baseURL}/character/available_features`,
        body: '{req}',
      },
      functions: {
        availableFeatures: ['req'],
      },
    },
  ],
};

export class ModelEngineHttpApiDataSource extends juggler.DataSource {
  static dataSourceName = 'ModelEngineHttpApi';

  constructor(
    @inject('datasources.config.ModelEngineHttpApi', { optional: true })
    dsConfig = config,
  ) {
    super(dsConfig);
  }
}
