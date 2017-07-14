export interface DbConfig {
    // url?: string
    events: string
    models: string
    workingModels: string
    [alias: string]: string
}

export interface PoolConfig {
    workerModule: string
    workerArgs: string[]
    catalogs: string
    options: any
}

export interface LoggerConfig {
    [source: string]: any
}

export interface Config {
    db: DbConfig
    pool: PoolConfig
    logger: LoggerConfig
}
