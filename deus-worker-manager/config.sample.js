module.exports = {
    db: {
        url: "http://admin:admin@localhost:5984/",
        events: "events-dev",
        models: "models-dev",
        workingModels: "working-models-dev",
        viewModels: "view-models-dev"
    },

    pool: {
        workerModule: 'deus-model-engine/lib/worker_runner',
        workerArgs: ['node_modules/deus-model-engine/models', '-c', 'node_modules/deus-model-engine/config'],
        options: {
            max: 2,
            min: 2
        }
    }
};
