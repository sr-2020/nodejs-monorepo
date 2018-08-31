export interface DbConfig {
  url: string;
  adapter?: string;
  initViews: boolean;
  events: string;
  models: string;
  workingModels: string;
  accounts: string;
  economy: string;
}

export interface CatalogsConfigFiles {
  path: string;
}

export interface DbMappingConfig {
  [alias: string]: string;
}

export interface CatalogsConfigDb {
  db: DbMappingConfig;
}

export type CatalogsConfig = CatalogsConfigFiles | CatalogsConfigDb;

export interface PoolConfig {
  workerModule: string;
  workerArgs: string[];
  options: any;
}

export interface LoggerConfig {
  [source: string]: any;
}

export interface ProcessorConfig {
  deleteEventsOlderThanMs: number;
}

export interface Config {
  db: DbConfig;
  pool: PoolConfig;
  catalogs: CatalogsConfig;
  viewModels: DbMappingConfig;
  objects: DbMappingConfig;
  logger: LoggerConfig;
  processor: ProcessorConfig;
}
