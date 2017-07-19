"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Rx_1 = require("rxjs/Rx");
const moment = require("moment");
const commandLineArgs = require("command-line-args");
const winston = require("winston");
const stats_1 = require("./stats");
const config_1 = require("./config");
const join_importer_1 = require("./join-importer");
const tempdb_writer_1 = require("./tempdb-writer");
const alice_exporter_1 = require("./alice-exporter");
const catalogs_loader_1 = require("./catalogs-loader");
const model_refresher_1 = require("./model-refresher");
class ModelImportData {
    constructor() {
        this.importer = new join_importer_1.JoinImporter();
        this.cacheWriter = new tempdb_writer_1.TempDbWriter();
        this.catalogsLoader = new catalogs_loader_1.CatalogsLoader();
        this.modelRefresher = new model_refresher_1.ModelRefresher();
        this.currentStats = new stats_1.ImportRunStats();
        this.lastRefreshTime = moment([1900, 0, 1]);
        this.charList = [];
        this.importCouter = 0;
    }
}
//Сheck CLI arguments
const cliDefs = [
    { name: 'export', type: Boolean },
    { name: 'import', type: Boolean },
    { name: 'test', type: Boolean },
    { name: 'id', type: String },
    { name: 'since', type: String },
    { name: 'list', type: Boolean },
    { name: 'refresh', type: Boolean },
];
const params = commandLineArgs(cliDefs);
//start logging
configureLogger();
//Reenter flag
let isImportRunning = false;
//Statisticts
let stats = new stats_1.ImportStats();
winston.info(JSON.stringify(params));
if (params.export || params.import || params.id || params.test || params.list || params.refresh) {
    let _id = params.id ? params.id : 0;
    let since = params.since ? moment.utc(params.since, "YYYY-MM-DDTHH:mm") : null;
    importAndCreate(_id, (params.import == true), (params.export == true), (params.list == true), false, (params.refresh == true), since)
        .subscribe((data) => { }, (error) => {
        process.exit(1);
    }, () => {
        winston.info("Finished!");
        process.exit(0);
    });
}
else {
    winston.info(`Start HTTP-server on port: ${config_1.config.port} and run import loop`);
    var app = express();
    app.listen(config_1.config.port);
    app.get('/', function (req, res) {
        res.send(stats.toString());
    });
    Rx_1.Observable.timer(0, config_1.config.importInterval).
        flatMap(() => importAndCreate())
        .subscribe((data) => { }, (error) => {
        process.exit(1);
    }, () => {
        winston.info("Finished!");
        process.exit(0);
    });
}
/**
 * Предвартельные операции для импорта (токен, заливка метаданных, каталоги и т.д)
 */
function prepareForImport() {
    let data = new ModelImportData();
    return Rx_1.Observable.fromPromise(data.cacheWriter.getLastStats())
        .map((loadedStats) => {
        data.lastRefreshTime = loadedStats.importTime;
        return data;
    })
        .flatMap(() => data.importer.init())
        .flatMap(() => data.importer.getMetadata())
        .do(() => winston.info(`Received metadata!`))
        .flatMap(() => data.cacheWriter.saveMetadata(data.importer.metadata))
        .do(() => winston.info(`Save metadata to cache!`))
        .flatMap(() => data.catalogsLoader.load())
        .do(() => {
        Object.keys(data.catalogsLoader.catalogs).forEach((name) => {
            winston.info(`Loaded catalog: ${name}, elements: ${data.catalogsLoader.catalogs[name].length}`);
        });
    })
        .flatMap(() => Rx_1.Observable.from([data]));
}
/**
 * Получение списка обновленных персонажей (выполняется с уже подготовленной ModelImportData)
 */
function loadCharacterListFomJoin(data) {
    return Rx_1.Observable.fromPromise(data.importer.getCharacterList(data.lastRefreshTime.subtract(5, "minutes"))
        .then((c) => {
        data.charList = c;
        return data;
    }));
}
/**
 * Получение списка персонажей в кеше (выполняется с уже подготовленной ModelImportData)
 */
function loadCharacterListFromCache(data) {
    return Rx_1.Observable.fromPromise(data.cacheWriter.getCacheCharactersList()
        .then((c) => {
        winston.info("Debug: " + JSON.stringify(c));
        data.charList = c;
        return data;
    }));
}
/**
 * Сохранение данных о персонаже из Join в кеш на CouchDB
 */
function saveCharacterToCache(char, data) {
    return Rx_1.Observable.fromPromise(data.cacheWriter.saveCharacter(char))
        .do((c) => winston.info(`Character id: ${c.id} saved to cache`))
        .map(() => char);
}
/**
 * Создание модели персонажа по данным из Join и экспорт в Model-базу
 */
function exportCharacterModel(char, data) {
    let model = new alice_exporter_1.AliceExporter(char, data.metadata, data.catalogsLoader, true);
    return Rx_1.Observable.fromPromise(model.export())
        .map((c) => {
        winston.info(`Exported model for character id = ${c[0].id}: ` + JSON.stringify(c));
        return char;
    });
}
/**
 * Посылка события Refresh-модели
 */
function sendModelRefresh(char, data) {
    return Rx_1.Observable.fromPromise(data.modelRefresher.sentRefreshEvent(char._id))
        .map((c) => {
        winston.info(`Refresh event sent to model for character id = ${char._id}: ` + JSON.stringify(c));
        return char;
    });
}
/**
 * Получение потока данных персонажей (выполняется с уже подготовленной ModelImportData)
 */
function loadCharactersFromJoin(data) {
    let bufferCounter = 0;
    return Rx_1.Observable.from(data.charList)
        .bufferCount(config_1.config.importBurstSize) //Порезать на группы по 20
        .mergeMap((cl) => {
        winston.info(`##=====================================\n` +
            `## Process buffer ${bufferCounter}, size=${config_1.config.importBurstSize}: ${cl.map(d => d.CharacterId).join(',')}` +
            `\n##=====================================`);
        bufferCounter++;
        let promiseArr = [];
        cl.forEach(c => promiseArr.push(data.importer.getCharacter(c.CharacterLink)));
        return Promise.all(promiseArr);
    }, 1)
        .retry(3)
        .mergeMap((cl) => Rx_1.Observable.from(cl)) //Полученные данные группы разбить на отдельные элементы для обработки
        .do((c) => winston.info(`Imported character: ${c.CharacterId}`)); //Написать в лог
}
/**
 * Получение потока данных персонажей из кэша (выполняется с уже подготовленной ModelImportData)
 */
function loadCharactersFromCache(data) {
    let bufferCounter = 0;
    return Rx_1.Observable.from(data.charList)
        .bufferCount(config_1.config.importBurstSize) //Порезать на группы по 20
        .mergeMap((cl) => {
        winston.info(`##=====================================\n` +
            `## Process buffer ${bufferCounter}, size=${config_1.config.importBurstSize}: ${cl.map(d => d.CharacterId).join(',')}` +
            `\n##=====================================`);
        bufferCounter++;
        let promiseArr = [];
        cl.forEach(c => promiseArr.push(data.cacheWriter.getCacheCharacter(c.CharacterId.toString())));
        return Promise.all(promiseArr);
    }, 1)
        .retry(3)
        .mergeMap((cl) => Rx_1.Observable.from(cl)) //Полученные данные группы разбить на отдельные элементы для обработки
        .do((c) => winston.info(`Imported character: ${c.CharacterId}`)); //Написать в лог
}
/**
 *  Функция для импорта данных из Join, записи в кеш CouchDB, создания и экспорта моделей
 *  (т.е. вся цепочка)
 */
function importAndCreate(id = 0, importJoin = true, exportModel = true, onlyList = false, updateStats = true, refreshModel = true, updatedSince) {
    let sinceText = updatedSince ? updatedSince.format("DD-MM-YYYY HH:mm:SS") : "";
    winston.info(`Run import sequence with: id=${id}, import=${importJoin}, export=${exportModel}, onlyList=${onlyList}, updateStats=${updateStats}, refresh=${refreshModel}, updateSince=${sinceText}`);
    let workData;
    if (isImportRunning) {
        winston.info("Import session in progress.. return and wait to next try");
        return Rx_1.Observable.from([]);
    }
    isImportRunning = true;
    return prepareForImport()
        .map((data) => {
        if (updatedSince) {
            data.lastRefreshTime = updatedSince;
        }
        winston.info("Using update since time: " + data.lastRefreshTime.format("DD-MM-YYYY HH:mm:SS"));
        return data;
    })
        .flatMap((data) => {
        if (id) {
            data.charList.push(join_importer_1.JoinImporter.createJoinCharacter(id));
            return Rx_1.Observable.from([data]);
        }
        else if (importJoin) {
            return loadCharacterListFomJoin(data);
        }
        else {
            return loadCharacterListFromCache(data);
        }
    })
        .map((data) => {
        workData = data;
        winston.info(`Received character list: ${data.charList.length} characters`);
        if (onlyList) {
            workData.charList = [];
        }
        return workData;
    })
        .flatMap((data) => {
        if (importJoin) {
            winston.info("Load characters from JoinRPG");
            return loadCharactersFromJoin(data);
        }
        else {
            winston.info("Load characters from CouchDB cache");
            return loadCharactersFromCache(data);
        }
    })
        .flatMap((c) => {
        if (importJoin) {
            return saveCharacterToCache(c, workData);
        }
        else {
            return Rx_1.Observable.from([c]);
        }
    })
        .flatMap((c) => {
        if (exportModel) {
            return exportCharacterModel(c, workData);
        }
        else {
            return Rx_1.Observable.from([c]);
        }
    })
        .flatMap((c) => {
        if (refreshModel) {
            return sendModelRefresh(c, workData);
        }
        else {
            return Rx_1.Observable.from([c]);
        }
    })
        .do(() => {
        workData.importCouter++;
    }, (error) => {
        winston.info("Error in pipe: " + JSON.stringify(error));
        isImportRunning = false;
    }, () => {
        isImportRunning = false;
        if (updateStats) {
            workData.cacheWriter.saveLastStats(new stats_1.ImportRunStats(moment.utc()));
        }
        winston.info(`Import sequence completed. Imported ${workData.importCouter} models!`);
    });
}
function configureLogger() {
    winston.add(winston.transports.File, { filename: config_1.config.logFileName });
    winston.handleExceptions(new winston.transports.File({
        filename: 'path/to/exceptions.log',
        handleExceptions: true,
        humanReadableUnhandledException: true,
        level: 'debug',
        json: false
    }));
}
//# sourceMappingURL=server.js.map