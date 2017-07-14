function logger(label) {
    let cfg =  {
        console: {
            level: 'debug',
            colorize: true
        },

        file: {
            level: 'info',
            filename: __dirname + '/log/operation.log'
        }
    };

    if (label) {
        cfg.console.label = label;
        cfg.file.label = label;
    }

    return cfg;
}

module.exports = {
    db: {
        url: "http://admin:admin@localhost:5984/",
        catalogs: "catalogs-dev",
        events: "events-dev",
        models: "models-dev",
        workingModels: "working-models-dev",
        viewModels: "view-models-dev"
    },

    pool: {
        workerModule: 'deus-model-engine/lib/worker_runner',
        workerArgs: ['node_modules/deus-model-engine/models'],
        catalogs: 'db',
        options: {
            max: 2,
            min: 2
        }
    },

    logger: {
        default: logger(),
        manager: logger('manager'),
        engine: logger('engine'),
        model: logger('model')
    }
};
