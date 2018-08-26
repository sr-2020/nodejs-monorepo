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
        events: "events",                      // это и далее - пары <alias>: <имя базы в коче>
        models: "models",
        workingModels: "work-models"
    },

    // блок настроек пула воркеров
    pool: {
        workerModule: 'deus-model-engine/lib/worker_runner',   // модуль воркера, для которого вызывается ChildProcess.fork
        workerArgs: ['../deus-models/src'],                    // аргументы, передаваемые дочернему процессу при запуске
        options: {                                             // опции для https://www.npmjs.com/package/generic-pool
            max: 2,                                            // максимальное число воркеров
            min: 2                                             // минимальное число воркеров
        }
    },

    // блок настроек загрузки каталогов
    catalogs: {

        // если загрузка производится из базы, используется ключ db
        db: {
            conditions: 'dict-conditions', // это и далее - пары <имя каталога>: <имя или алиас базы>
            effects: 'dict-effects',
            events: 'dict-events',
            illnesses: 'dict-illnesses',
            implants: 'dict-implants'
        }

        // если загрузка из файлов, используется ключ path
        // path: __dirname + '/models/catalogs'
    },

    // блок настроек баз для вью-моделей
    viewModels: {
        default: "view-models" // пары <alias>: <имя базы или алиас из списка db>
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
