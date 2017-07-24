function logger(label) {
    let cfg =  {
        console: {
            level: 'debug',
            colorize: true
        },

        file: {
            level: 'info',
            filename: __dirname + '/log/operation.log'
        },

        // graylog2: {
        //     level: 'debug',
        //     facility: 'alice-dev'
        //     servers: [
        //         {host: 'mon01.alice.local', port: 12201}
        //     ]
        // }
    };

    if (label) {
        cfg.console.label = label;
        cfg.file.label = label;
    }

    return cfg;
}

module.exports = {
    // блок настроек базы
    db: {
        url: "http://admin:admin@localhost:5984/", // адрес для доступа к кочу, с логином и паролем если нужно
        events: "events-dev",                      // это и далее - пары <alias>: <имя базы в коче>
        models: "models-dev",
        workingModels: "working-models-dev"
    },

    // блок настроек пула воркеров
    pool: {
        workerModule: 'deus-model-engine/lib/worker_runner',   // модуль воркера, для которого вызывается ChildProcess.fork
        workerArgs: ['node_modules/deus-model-engine/models'], // аргументы, передаваемые дочернему процессу при запуске
        options: {                                             // опции для https://www.npmjs.com/package/generic-pool
            max: 2,                                            // максимальное число воркеров
            min: 2                                             // минимальное число воркеров
        }
    },

    // блок настроек загрузки каталогов
    catalogs: {

        // если загрузка производится из базы, используется ключ db
        db: {
            conditions: 'dict-conditions-dev', // это и далее - пары <имя каталога>: <имя или алиас базы>
            effects: 'dict-effects-dev',
            events: 'dict-events-dev',
            illnesses: 'dict-illnesses-dev',
            implants: 'dict-implants-dev'
        }

        // если загрузка из файлов, используется ключ path
        // path: __dirname + '/models/catalogs'
    },

    // блок настроек баз для вью-моделей
    viewModels: {
        default: "view-models-dev" // пары <alias>: <имя базы или алиас из списка db>
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
    }
};
