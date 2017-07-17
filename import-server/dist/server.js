"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Rx_1 = require("rxjs/Rx");
const moment = require("moment");
const commandLineArgs = require("command-line-args");
const stats_1 = require("./stats");
const config_1 = require("./config");
const join_importer_1 = require("./join-importer");
const tempdb_writer_1 = require("./tempdb-writer");
const alice_exporter_1 = require("./alice-exporter");
const catalogs_loader_1 = require("./catalogs-loader");
//Сheck CLI arguments
const cliDefs = [
    { name: 'recreate', alias: 'r', type: Boolean },
    { name: 'id', alias: 'i', type: String },
];
const params = commandLineArgs(cliDefs);
//Reenter flag
let isImportRunning = false;
//Statisticts
let stats = new stats_1.ImportStats();
if (params.recreate) {
    console.log("Recreate models from the cache");
    console.log(JSON.stringify(params, null, 4));
    recreateModels();
}
else {
    console.log(`Start HTTP-server on port: ${config_1.config.port} and run import loop`);
    var app = express();
    app.listen(config_1.config.port);
    app.get('/', function (req, res) {
        res.send(stats.toString());
    });
    Rx_1.Observable.timer(0, config_1.config.importInterval).subscribe(() => {
        console.log("Start import sequence!");
        importData();
    });
}
/**
 *  Функция для импорта данных из Join, записи в кеш CouchDB
 *  и экспорта моделей
 */
function importData() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isImportRunning) {
            console.log("Import session in progress.. return and wait to next try");
            return;
        }
        let currentsStats = new stats_1.ImportRunStats();
        isImportRunning = true;
        let importer = new join_importer_1.JoinImporter();
        let cacheWriter = new tempdb_writer_1.TempDbWriter();
        let catalogsLoader = new catalogs_loader_1.CatalogsLoader();
        //Получить статистику последнего импорта (если была)
        stats.lastRefreshTime = (yield cacheWriter.getLastStats()).importTime;
        console.log("Last import time set to: " + stats.lastRefreshTime.format("L LTS"));
        //Иницировать загрузчик данных из Join(токен)
        yield importer.init();
        //Загрузить метаднные
        let metadata = yield importer.getMetadata();
        console.log(`Received metadata!`);
        //Сохранить метаднные в кеше
        yield cacheWriter.saveMetadata(metadata);
        console.log(`Save metadata to cache!`);
        //Получить список обновленных персонажей для загрузки
        let charList = yield importer.getCharacterList(stats.lastRefreshTime.subtract(1, "hours"));
        console.log(`Received character list: ${charList.length} characters`);
        //Если список не нулевой загрузить каталоги
        if (charList.length) {
            yield catalogsLoader.load();
            Object.keys(catalogsLoader.catalogs).forEach((name) => {
                console.log(`Loaded catalog: ${name}, elements: ${catalogsLoader.catalogs[name].length}`);
            });
        }
        //Пройти по всему списку персонажей
        Rx_1.Observable.from(charList)
            .bufferCount(config_1.config.importBurstSize) //Порезать на группы по 20
            .mergeMap((cl) => {
            console.log(`Process buffer!`);
            let promiseArr = [];
            cl.forEach(c => promiseArr.push(importer.getCharacter(c.CharacterLink)));
            return Promise.all(promiseArr);
        }, 1)
            .retry(3)
            .mergeMap((cl) => Rx_1.Observable.from(cl)) //Полученные данные группы разбить на отдельные элементы для обработки
            .do((c) => console.log(`Imported character: ${c.CharacterId}`)) //Написать в лог
            .do((c) => cacheWriter.saveCharacter(c)) //сохранить в кеш (CouchDB)
            .do((c) => console.log(`Character id: ${c._id} saved to cache`))
            .flatMap((c) => {
            let modelExporter = new alice_exporter_1.AliceExporter(c, metadata, catalogsLoader, true);
            return modelExporter.export();
        })
            .do((c) => { currentsStats.imported.push(c.id); }) //обновить статистику
            .subscribe((c) => {
            console.log(`Exported model for character id = ${c[0].id}: ` + JSON.stringify(c));
        }, (error) => {
            console.log("Error in pipe: " + JSON.stringify(error));
            isImportRunning = false;
        }, () => {
            currentsStats.importTime = moment();
            cacheWriter.saveLastStats(currentsStats).then(() => {
                stats.addImportStats(currentsStats);
                isImportRunning = false;
                console.log("Import sequence completed!");
            });
        });
    });
}
/**
 *  Функция для ручной перезаливки моделей из кеша
 */
function recreateModels() {
    return __awaiter(this, void 0, void 0, function* () {
        let cacheWriter = new tempdb_writer_1.TempDbWriter();
        let metadata = yield cacheWriter.getMetadata();
        console.log(`Loaded metadata from cache!`);
        let catalogsLoader = new catalogs_loader_1.CatalogsLoader();
        yield catalogsLoader.load();
        Object.keys(catalogsLoader.catalogs).forEach((name) => {
            console.log(`Loaded catalog: ${name}, elements: ${catalogsLoader.catalogs[name].length}`);
        });
        let exceptionIds = ["JoinMetadata", "lastImportStats"];
        let src = null;
        if (params.hasOwnProperty("id")) {
            src = Rx_1.Observable.fromPromise(cacheWriter.getCacheCharacter(params.id));
        }
        else {
            src = Rx_1.Observable.fromPromise(cacheWriter.getCacheCharactersList())
                .do((c) => console.log(JSON.stringify(c, null, 4)))
                .flatMap((result) => Rx_1.Observable.from(result.rows))
                .filter((doc) => !exceptionIds.find(e => e == doc.id))
                .flatMap((doc) => cacheWriter.getCacheCharacter(doc.id), 10);
        }
        src.flatMap((c) => {
            let modelExporter = new alice_exporter_1.AliceExporter(c, metadata, catalogsLoader, true);
            return modelExporter.export();
        })
            .retry(3)
            .subscribe((c) => {
            console.log(`Update model for character id = ${c[0].id}: ` + JSON.stringify(c));
        }, (error) => {
            console.log("Error in pipe: " + JSON.stringify(error));
            process.exit(1);
        }, () => {
            console.log("Update sequence completed!");
            process.exit(0);
        });
    });
}
//# sourceMappingURL=server.js.map