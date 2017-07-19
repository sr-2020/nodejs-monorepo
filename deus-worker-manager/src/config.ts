export interface DbConfig {
    // url?: string
    events: string
    models: string
    workingModels: string
    [alias: string]: string
}

export interface CatalogsConfigFiles {
    path: string
}

export interface DbMappingConfig {
    [alias: string]: string
}

export interface CatalogsConfigDb {
    db: DbMappingConfig
}

export type CatalogsConfig = CatalogsConfigFiles | CatalogsConfigDb;

export interface PoolConfig {
    workerModule: string
    workerArgs: string[]
    options: any
}

export interface LoggerConfig {
    [source: string]: any
}

export interface Config {
    db: DbConfig
    pool: PoolConfig
    catalogs: CatalogsConfig
    viewModels: DbMappingConfig
    objects: DbMappingConfig
    logger: LoggerConfig
}
