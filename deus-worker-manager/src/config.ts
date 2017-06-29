export type DbConfig = {
    url: string,
    events: string,
    models: string,
    workingModels: string,
    [alias: string]: string
}

export type PoolConfig = {
    workerModule: string,
    workerArgs: string[],
    options: any
}

export type LoggerConfig = {
    [source: string]: any
}

export type Config = {
    db: DbConfig,
    pool: PoolConfig,
    logger: LoggerConfig
}
