type DbConfig = {
    url: string,
    events: string,
    models: string,
    workingModels: string,
    [alias: string]: string
}

type PoolConfig = {
    workerModule: string,
    workerArgs: string[],
    options: any
}

type LoggerConfig = {
    [source: string]: any
}

export type Config = {
    db: DbConfig,
    pool: PoolConfig,
    logger: LoggerConfig
}
