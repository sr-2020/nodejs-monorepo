function logger(label) {
    let cfg =  {
        console: {
            level: 'info',
            colorize: true
        },
        elasticsearch: {
            level: 'debug',
            clientOpts: {
                host: 'elasticsearch:9200'
            }
        }
    };

    if (label) {
        cfg.console.label = label;
    }

    return cfg;
}

module.exports = {
    // блок настроек базы
    db: {
        url: `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@couchdb:5984/`, // адрес для доступа к кочу, с логином и паролем если нужно
        events: "events",                      // это и далее - пары <alias>: <имя базы в коче>
        models: "models",
        metadata: "metadata",
        workingModels: "work-models",
        accounts: "accounts",
        economy: "economy",
    },

    // блок настроек пула воркеров
    pool: {
        workerModule: '/app/packages/alice-model-engine/dist/worker_runner',   // модуль воркера, для которого вызывается ChildProcess.fork
        workerArgs: ['../deus-models/build/src'],              // аргументы, передаваемые дочернему процессу при запуске
        options: {                                             // опции для https://www.npmjs.com/package/generic-pool
            max: 2,                                            // максимальное число воркеров
            min: 2                                             // минимальное число воркеров
        }
    },

    // блок настроек загрузки каталогов
    catalogs: {

        // если загрузка производится из базы, используется ключ db
        db: {
            // Model Engine использует эту базу, чтоб сопоставить тип события и его обработчик.
            // Модельный код в нее лазить не должен.
            events: 'dict-events',
            // К этим базам обращается модельный код непосредственно
            // (через ReadModelApi.getCatalogObject).
            effects: 'dict-effects', // это и далее - пары <имя каталога>: <имя или алиас базы>
        }

        // если загрузка из файлов, используется ключ path
        // path: __dirname + '/models/catalogs'
    },

    // блок настроек баз для вью-моделей
    viewModels: {
        default: "view-models", // пары <alias>: <имя базы или алиас из списка db>
    },

    // блок настроек баз для общих объектов
    objects: {
        'counters': 'obj-counters' // пары <alias>: <имя базы или алиас из списка db>
    },

    // блок настроек логирования
    logger: {
        default: logger(),          // настройки логгера по-умолчанию. Используются стандартные настройки для Winston
        manager: logger('manager'), // это и далее - настройки логгеров для отдельных источников
        engine: logger('engine'),
        model: logger('model')
    },

    processor: {
        deleteEventsOlderThanMs: 30 * 60 * 1000 // 30 минут
    }
};
