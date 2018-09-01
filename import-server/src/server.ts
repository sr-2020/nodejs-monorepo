import * as express from 'express';
import * as moment from 'moment';
import * as PouchDB from 'pouchdb';
import * as pouchDBFind from 'pouchdb-find';
import { BehaviorSubject, Observable  } from 'rxjs/Rx';
import * as winston from 'winston';
const Elasticsearch = require('winston-elasticsearch');

import { AliceExporter } from './alice-exporter';
import { processCliParams } from './cli-params';
import { config } from './config';
import { ImportRunStats } from './import-run-stats';
import { JoinCharacter, JoinCharacterDetail, JoinImporter } from './join-importer';
import { ModelRefresher } from './model-refresher';
import { EconProvider } from './providers/econ-provider';
import { Provider } from './providers/interface';
import { ImportStats} from './stats';
import { TempDbWriter} from './tempdb-writer';

PouchDB.plugin(pouchDBFind);

class ModelImportData {
    public importer: JoinImporter = new JoinImporter();
    public cacheWriter: TempDbWriter = new TempDbWriter();
    public modelRefresher: ModelRefresher = new ModelRefresher();

    public afterConversionProviders: Provider[] = [ new EconProvider()];

    public currentStats = new ImportRunStats();

    public lastRefreshTime = moment([1900, 0, 1]);

    public charList: JoinCharacter[] = [];
    public charDetails: JoinCharacterDetail[] = [];

    public importCouter: number = 0;
}

const params = processCliParams();

if (!params) {
     process.exit(0);
}

// start logging
configureLogger();

winston.info('Run CLI parameters: ', params);

// Reenter flag
let isImportRunning = false;

// Statisticts
const stats = new ImportStats();

if (
    params.export
    || params.import
    || params.id
    || params.test
    || params.list
    || params.refresh
    || params.mail
    || params.econ) {
    // tslint:disable-next-line:variable-name
    const _id = params.id ? params.id : 0;
    const since = params.since ? moment.utc(params.since, 'YYYY-MM-DDTHH:mm') : null;

    importAndCreate(_id, (params.import === true), (params.export === true), (params.list === true),
                            false, (params.refresh === true), (params.mail === true), since)
    // tslint:disable-next-line:no-empty
    .subscribe( () => { },
                () => {
            process.exit(1);
        },
                () => {
                    winston.info('Finished!');
                    process.exit(0);
                },
    );
} else if (params.server) {
    winston.info(`Start HTTP-server on port: ${config.port} and run import loop`);

    const app = express();
    app.listen(config.port);

    app.get('/', (_req, res) => res.send(stats.toString()));

    Observable.timer(0, config.importInterval).
        flatMap( () => importAndCreate() )
        .subscribe( () => { },
            () => {
                process.exit(1);
            },
            () => {
                winston.info('Finished!');
                process.exit(0);
            },
        );
}

/**
 * Предвартельные операции для импорта (токен, заливка метаданных, каталоги и т.д)
 */
function prepareForImport(data: ModelImportData): Observable<ModelImportData> {

    return Observable.fromPromise(data.cacheWriter.getLastStats())
            .map( (loadedStats) => {
                data.lastRefreshTime = loadedStats.importTime;
                return data;
            })
            .flatMap( () => data.importer.init() )
            .flatMap( () => data.importer.getMetadata() )
            .do( () => winston.info(`Received metadata!`) )
            .flatMap( () => data.cacheWriter.saveMetadata(data.importer.metadata) )
            .do( () => winston.info(`Save metadata to cache!`) )
            .flatMap( () => Observable.from([data]) );
}

/**
 * Получение списка обновленных персонажей (выполняется с уже подготовленной ModelImportData)
 */
function loadCharacterListFomJoin(data: ModelImportData): Observable<ModelImportData> {
    return Observable.fromPromise(
                data.importer.getCharacterList(data.lastRefreshTime.subtract(5, 'minutes'))
                .then( ( c: JoinCharacter[] ) => {
                            data.charList = c;
                            return data;
                 }),
            );
}

/**
 * Получение списка персонажей в кеше (выполняется с уже подготовленной ModelImportData)
 */
function loadCharacterListFromCache(data: ModelImportData): Observable<ModelImportData> {
    return Observable.fromPromise(
                data.cacheWriter.getCacheCharactersList()
                .then( ( c: JoinCharacter[] ) => {
                            winston.info('Debug: ' + JSON.stringify(c));
                            data.charList = c;
                            return data;
                 }),
            );
}

/**
 * Сохранение данных о персонаже из Join в кеш на CouchDB
 */
function saveCharacterToCache(char: JoinCharacterDetail, data: ModelImportData): Observable<JoinCharacterDetail> {
    return Observable.fromPromise( data.cacheWriter.saveCharacter(char) )
            .do( (c: any) => winston.info(`Character id: ${c.id} saved to cache`) )
            .map( () => char);
}

function assertNever(x: never): never {
    throw new Error('Unexpected object: ' + x);
}

function perfromProvide(
    provider: Provider,
    char: JoinCharacterDetail,
    exportModel: boolean = true,
): Observable<JoinCharacterDetail> {
    if (!exportModel) {
        return Observable.from([char]);
    }

    if (params.ignoreInGame || !char.finalInGame) {

        return Observable.from([char])
        .do(() => winston.info(`About to provide ${provider.name} for character(${char._id})`))
        .delay(1000)
        .flatMap((c) => provider.provide(c))
        .map((result) => {
            switch (result.result) {
                case 'success': {
                     winston.info(`Provide ${provider.name} for character(${char._id}) success`);
                     return char;
                }
                case 'nothing':  {
                    winston.info(`Provide ${provider.name} for character(${char._id}) nothing to do`);
                    return char;
                }
                case 'problems': {
                    winston.warn(`Provide ${provider.name} for character(${char._id})` +
                        `failed with ${result.problems.join(', ')}`);
                    return char;
                }
                default: assertNever(result);
            }
            return char;
        });
    }
    return Observable.from([char]);
}

/**
 * Создание модели персонажа по данным из Join и экспорт в Model-базу
 */
function exportCharacterModel(
    char: JoinCharacterDetail,
    data: ModelImportData,
    exportModel: boolean = true): Observable<JoinCharacterDetail>  {

    if (!exportModel) {
        return Observable.from([char]);
    }

    winston.info(`About to export Character(${char._id})`);

    const exporter = new AliceExporter(
        char, data.importer.metadata, true, params.ignoreInGame);

    return Observable.fromPromise(exporter.export())
            .map( (c: any) => {
                    if (c) {
                        char.model = exporter.model;
                        char.account = exporter.account;

                        winston.info(
                                `Exported model and account for character ${char._id}, results: ${JSON.stringify(c)}`);
                    } else {
                        if (char.InGame) {
                        winston.info(
                            `Model and account for character ${char._id} not exported: model alredy IN THE GAME` );
                        char.finalInGame = true;    // Отметить что эту модель дальше не надо обрабатывать
                        }
                    }

                    return char;
            });
        }
/**
 * Посылка события Refresh-модели
 */
function sendModelRefresh(char: JoinCharacterDetail, data: ModelImportData): Observable<JoinCharacterDetail> {
    return Observable.fromPromise(data.modelRefresher.sentRefreshEvent(char))
            .map( (c: any) => {
                    winston.info( `Refresh event sent to model for character id = ${char._id}: ` + JSON.stringify(c) );
                    return char;
            });
}

/*
 * Создание e-mail адресов и учеток для всех персонажей
 *
function provisionMailAddreses(data: ModelImportData): Promise<any> {
    //winston.info(`provisionMailAddreses: ` + data.charDetails.map(c=>c._id).join(','));
    return data.mailProvision.createEmails(data.charDetails).then( c => {
        winston.info(
`Request for mail creation was sent for: ${data.charDetails.map(c=>c._id).join(',')}, result: ${JSON.stringify(c)}`);
        return c;
    });
}
*/

/**
 * Получение потока данных персонажей (выполняется с уже подготовленной ModelImportData)
 */
function loadCharactersFromJoin(data: ModelImportData): Observable<JoinCharacterDetail> {
    let bufferCounter = 0;
    winston.info('Load characters from JoinRPG');

    return Observable.from(data.charList)
            .bufferCount(config.importBurstSize)        // Порезать на группы по 20

            // Добавить задержку между обработкой записей
            .flatMap((c) => Observable.from([c]).delay(config.importBurstDelay), 1 )

            // Каждую группу преобразовать в один общий Promise, ждущий все запросы в группе
            .mergeMap( (cl: JoinCharacter[]) => {
                const characterIds = cl.map((d) => d.CharacterId);
                winston.info(`# Process ${bufferCounter}, size=${config.importBurstSize}: ${characterIds.join(',')} #`);
                bufferCounter++;

                const promiseArr: Array<Promise<JoinCharacterDetail>> = [];
                cl.forEach((c) => promiseArr.push(data.importer.getCharacter(c.CharacterLink)) );

                return Promise.all(promiseArr);
            }, 1)
            .retry(3)

             // Полученные данные группы разбить на отдельные элементы для обработки
            .mergeMap( (cl: JoinCharacterDetail[]) => Observable.from(cl) )

            .do( (c: JoinCharacterDetail) => winston.info(`Imported character: ${c.CharacterId}`) );  // Написать в лог
}

/**
 * Получение потока данных персонажей из кэша (выполняется с уже подготовленной ModelImportData)
 */
function loadCharactersFromCache(data: ModelImportData): Observable<JoinCharacterDetail> {
    let bufferCounter = 0;
    winston.info('Load characters from CouchDB cache');

    return Observable.from(data.charList)
            .bufferCount(config.importBurstSize)        // Порезать на группы по 20
             // Полученные данные группы разбить на отдельные элементы для обработки
            .mergeMap( (cl: JoinCharacter[]) => {
                const characterIds = cl.map((d) => d.CharacterId);
                winston.info(`# Process ${bufferCounter}, size=${config.importBurstSize}: ${characterIds.join(',')} #`);
                bufferCounter++;

                const promiseArr: Array<Promise<JoinCharacterDetail>> = [];
                cl.forEach( (c) => promiseArr.push(data.cacheWriter.getCacheCharacter(c.CharacterId.toString())) );

                return Promise.all(promiseArr);
            }, 1)
            .retry(3)
            // Полученные данные группы разбить на отдельные элементы для обработки
            .mergeMap( (cl: JoinCharacterDetail[]) => Observable.from(cl) )
            .do( (c: JoinCharacterDetail) => winston.info(`Imported character: ${c.CharacterId}`) );  // Написать в лог
}

/**
 *  Функция для импорта данных из Join, записи в кеш CouchDB, создания и экспорта моделей
 *  (т.е. вся цепочка)
 */
function importAndCreate(   id: number = 0,
                            importJoin: boolean = true,
                            exportModel: boolean = true,
                            onlyList: boolean = false,
                            updateStats: boolean = true,
                            refreshModel: boolean = false,
                            mailProvision: boolean = true,
                            updatedSince: moment.Moment | null = null,
                        ): Observable<string> {

    const sinceText = updatedSince ? updatedSince.format('DD-MM-YYYY HH:mm:SS') : '';

    winston.info(`Run import sequence with: id=${id}, import=${importJoin}, export=${exportModel}, ` +
                  `onlyList=${onlyList}, updateStats=${updateStats}, refresh=${refreshModel}, ` +
                  `mailProvision=${mailProvision}, updateSince=${sinceText}` );

    // Объект с рабочими данными при импорте - экспорте
    const workData = new ModelImportData();

    if (isImportRunning) {
        winston.info('Import session in progress.. return and wait to next try');
        return Observable.from([]);
    }

    isImportRunning = true;

    const returnSubject = new BehaviorSubject('start');

    let chain = prepareForImport(workData)
    // Установить дату с которой загружать персонажей (если задано)
        .map( (data) => {
            if (updatedSince) { data.lastRefreshTime = updatedSince; }
            winston.info('Using update since time: ' +  data.lastRefreshTime.format('DD-MM-YYYY HH:mm:SS'));
            return data;
        })

    // Загрузить список персонажей (Join или кэш), если не задан ID
        .flatMap( (data: ModelImportData) => {
                if (id) {
                    data.charList.push( JoinImporter.createJoinCharacter(id) );
                    return Observable.from([data]);
                } else if (importJoin) {
                    return loadCharacterListFomJoin(data);
                } else {
                    return loadCharacterListFromCache(data);
                }
        })

    // Запись в лог
        .do( (data) => winston.info(`Received character list: ${data.charList.length} characters`) )

    // Если это только запрос списка - закончить
        .filter( () => !onlyList )

    // Загрузить данные из Join или из кеша
        .flatMap( (data: ModelImportData) => importJoin ? loadCharactersFromJoin(data) : loadCharactersFromCache(data) )

    // Добавить задержку между обработкой записей
        .flatMap( (c) => Observable.from([c]).delay(config.importDelay), 1 )

    // Сохранить данные в кеш (если надо)
        .flatMap( (c) => importJoin ? saveCharacterToCache(c, workData) : Observable.from([c]) )

    // Остановить обработку, если в модели нет флага InGame (игра началась и дальше импортировать что-то левое не нужно)
        .filter( (c) => {
            if (config.importOnlyInGame && !c.InGame) {
                winston.info(`Character id=${c._id} have no flag "InGame", and not imported`);
                return false;
            }
            return true;
         })

    // Экспортировать модель в БД (если надо)
        .flatMap( (c) => Observable.from([c]).delay(1000), 1 )
        .flatMap( (c)  =>  exportCharacterModel(c, workData, exportModel) )

    // Если персонаж "В игре" остановить дальнейшую обработку
        .filter( (c) => (!c.finalInGame) );

    // Выполнить все задачи после экспорта
        workData.afterConversionProviders.forEach((provider) => {
            chain = chain.flatMap((c) => perfromProvide(provider, c, exportModel));

        });

        chain
    // Сохранить данные по персонажу в общий список
        .do( (c) => workData.charDetails.push(c) )

    // Послать модели Refresh соообщение для создания Work и View-моделей
        .flatMap( (c) => refreshModel ? sendModelRefresh(c, workData) : Observable.from([c]) )

    // Посчитать статистику
        .do( () => workData.importCouter++ )

    // Собрать из всех обработанных данных всех персонажей общий массив и передать дальше как один элемент
        .toArray()
    // Отправить запрос на создание почтовых ящиков для всхе персонажей
        .filter( () => workData.charDetails.length > 0 )
   //     .flatMap( c => mailProvision
   // ? Observable.fromPromise(provisionMailAddreses(workData)) : Observable.from([c]) )
        .subscribe( () => {},
            (error) => {
                winston.error( 'Error in pipe: ', error );
                isImportRunning = false;
            },
            () => {
                isImportRunning = false;

                if (updateStats) {
                    workData.cacheWriter.saveLastStats( new ImportRunStats(moment.utc()) );
                }

                winston.info(`Import sequence completed. Imported ${workData.importCouter} models!`);

                returnSubject.complete();
            },
        );

    return returnSubject;
}

function configureLogger() {

    winston.remove('console');
    if (process.env.NODE_ENV !== 'production') {

        winston.add(winston.transports.Console, {
            level: 'debug',
            colorize: true,
            prettyPrint: true,
        });
    }

    winston.add(winston.transports.File, {
                filename: config.log.logFileName,
                json: false,
                level: 'debug',
            });

    winston.add(Elasticsearch,
        { level: 'debug',  indexPrefix: 'importserver-logs', clientOpts: { host: config.log.elasticHost } });

    winston.add(winston.transports.File, {
        name: 'warn-files',
        filename: config.log.warnFileName,
        json: false,
        level: 'warn',
    });

    winston.handleExceptions(new winston.transports.File({
                 filename: 'path/to/exceptions.log',
                handleExceptions: true,
                humanReadableUnhandledException: true,
                json: false,
                level: 'debug',
            }));
}
