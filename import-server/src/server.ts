import * as express from "express";
import { Observable, BehaviorSubject  } from 'rxjs/Rx';
import * as moment from "moment";
import * as commandLineArgs  from 'command-line-args';

import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinData, JoinImporter, JoinCharacter,JoinCharacterDetail, JoinMetadata } from './join-importer';
import { TempDbWriter} from './tempdb-writer';
import { AliceExporter } from './alice-exporter';
import { CatalogsLoader } from './catalogs-loader';
import { ModelRefresher } from './model-refresher';

class ModelImportData{
    importer:JoinImporter = new JoinImporter();
    cacheWriter: TempDbWriter = new TempDbWriter();
    catalogsLoader: CatalogsLoader = new CatalogsLoader();
    modelRefresher:ModelRefresher = new ModelRefresher();

    currentStats = new ImportRunStats();

    lastRefreshTime = moment([1900,0,1]);

    metadata:JoinMetadata;
    charList:JoinCharacter[] = [];

    importCouter: number = 0;

    constructor() {} 
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

//Reenter flag
let isImportRunning = false;

//Statisticts
let stats = new ImportStats();

console.log(JSON.stringify(params));

if(params.export || params.import || params.id || params.test || params.list || params.refresh){
    let _id = params.id? params.id : 0;
    let since = params.since? moment.utc(params.since, "YYYY-MM-DDTHH:mm") : null;
    
    importAndCreate(_id, (params.import == true), (params.export==true), (params.list==true), 
                            false, (params.refresh==true), since)
    .subscribe( (data:JoinCharacterDetail) => {},
                (error:any) => {
                    //process.exit(1);
                },
                () => {
                    console.log("Finished!");
                   // process.exit(0);
                }
    );
}else{
    console.log(`Start HTTP-server on port: ${config.port} and run import loop`);

    var app = express();
    app.listen(config.port);

    app.get('/', function (req, res) {
        res.send(stats.toString());
    })

    Observable.timer(0, config.importInterval).
        flatMap( () => importAndCreate() )
        .subscribe( (data:JoinCharacterDetail) => {},
            (error:any) => {
                process.exit(1);
            },
            () => {
                console.log("Finished!");
                process.exit(0);
            }
        );
}

/**
 * Предвартельные операции для импорта (токен, заливка метаданных, каталоги и т.д)
 */
function prepareForImport():Observable<ModelImportData> {
    let data = new ModelImportData();

    return Observable.fromPromise(data.cacheWriter.getLastStats())
            .map( (loadedStats) => {
                data.lastRefreshTime = loadedStats.importTime;
                return data;
            })
            .flatMap( () => data.importer.init() )
            .flatMap( () => data.importer.getMetadata() )
            .do( () => console.log(`Received metadata!`) )
            .flatMap( () => data.cacheWriter.saveMetadata(data.importer.metadata) )
            .do( () => console.log(`Save metadata to cache!`) )
            .flatMap( () => data.catalogsLoader.load() )
            .do( () => {
                Object.keys(data.catalogsLoader.catalogs).forEach( (name) => {
                    console.log(`Loaded catalog: ${name}, elements: ${data.catalogsLoader.catalogs[name].length}`);  
                })
            })
            .flatMap( () => Observable.from([data]) );                           
}

/**
 * Получение списка обновленных персонажей (выполняется с уже подготовленной ModelImportData)
 */
function loadCharacterListFomJoin(data: ModelImportData): Observable<ModelImportData> {
    return Observable.fromPromise( 
                data.importer.getCharacterList(data.lastRefreshTime.subtract(5,"minutes"))
                .then( ( c:JoinCharacter[] ) => {
                            data.charList = c;
                            return data;   
                 })
            );
}


/**
 * Получение списка персонажей в кеше (выполняется с уже подготовленной ModelImportData)
 */
function loadCharacterListFromCache(data: ModelImportData): Observable<ModelImportData> {
    return Observable.fromPromise( 
                data.cacheWriter.getCacheCharactersList()
                .then( ( c:JoinCharacter[] ) => {
                            console.log("Debug: " + JSON.stringify(c));
                            data.charList = c;
                            return data;   
                 })
            );
}

/**
 * Сохранение данных о персонаже из Join в кеш на CouchDB
 */
function saveCharacterToCache(char: JoinCharacterDetail, data: ModelImportData): Observable<JoinCharacterDetail> {
    return Observable.fromPromise( data.cacheWriter.saveCharacter(char) )
            .do( (c:any) => console.log(`Character id: ${c.id} saved to cache`) )
            .map( () => char)
}

/**
 * Создание модели персонажа по данным из Join и экспорт в Model-базу
 */
function exportCharacterModel(char: JoinCharacterDetail, data: ModelImportData): Observable<JoinCharacterDetail> {
    let model = new AliceExporter(char, data.metadata, data.catalogsLoader, true);

    return Observable.fromPromise(model.export())
            .map( (c:any) => { 
                    console.log( `Exported model for character id = ${c[0].id}: ` + JSON.stringify(c) );
                    return char;
            });
}          
        
/**
 * Посылка события Refresh-модели
 */
function sendModelRefresh(char: JoinCharacterDetail, data: ModelImportData): Observable<JoinCharacterDetail> {
    return Observable.fromPromise(data.modelRefresher.sentRefreshEvent(char._id))
            .map( (c:any) => { 
                    console.log( `Refresh event sent to model for character id = ${char._id}: ` + JSON.stringify(c) );
                    return char;
            });
}


/**
 * Получение потока данных персонажей (выполняется с уже подготовленной ModelImportData)
 */
function loadCharactersFromJoin(data: ModelImportData): Observable<JoinCharacterDetail>{
    let bufferCounter = 0;

    return Observable.from(data.charList)
            .bufferCount(config.importBurstSize)        //Порезать на группы по 20
            .mergeMap( (cl:JoinCharacter[]) => {        //Каждую группу преобразовать в один общий Promise, ждущий все запросы в группе
                console.log( `##=====================================\n` +
                             `## Process buffer ${bufferCounter}, size=${config.importBurstSize}: ${cl.map(d => d.CharacterId).join(',')}` +
                             `\n##=====================================`);
                bufferCounter++;

                let promiseArr: Promise<JoinCharacterDetail>[] = [];
                cl.forEach( c => promiseArr.push(data.importer.getCharacter(c.CharacterLink)) );

                return Promise.all(promiseArr);
            }, 1)
            .retry(3)
            
            .mergeMap( (cl:JoinCharacterDetail[]) => Observable.from(cl) ) //Полученные данные группы разбить на отдельные элементы для обработки
            .do( (c:JoinCharacterDetail) => console.log(`Imported character: ${c.CharacterId}`) )  //Написать в лог
}

/**
 * Получение потока данных персонажей из кэша (выполняется с уже подготовленной ModelImportData)
 */
function loadCharactersFromCache(data: ModelImportData): Observable<JoinCharacterDetail>{
    let bufferCounter = 0;

    return Observable.from(data.charList)
            .bufferCount(config.importBurstSize)        //Порезать на группы по 20
            .mergeMap( (cl:JoinCharacter[]) => {        //Каждую группу преобразовать в один общий Promise, ждущий все запросы в группе
                console.log( `##=====================================\n` +
                             `## Process buffer ${bufferCounter}, size=${config.importBurstSize}: ${cl.map(d => d.CharacterId).join(',')}` +
                             `\n##=====================================`);
                bufferCounter++;

                let promiseArr: Promise<JoinCharacterDetail>[] = [];
                cl.forEach( c => promiseArr.push(data.cacheWriter.getCacheCharacter(c.CharacterId.toString())) );

                return Promise.all(promiseArr);
            }, 1)
            .retry(3)
            
            .mergeMap( (cl:JoinCharacterDetail[]) => Observable.from(cl) ) //Полученные данные группы разбить на отдельные элементы для обработки
            .do( (c:JoinCharacterDetail) => console.log(`Imported character: ${c.CharacterId}`) )  //Написать в лог
}

/**
 *  Функция для импорта данных из Join, записи в кеш CouchDB, создания и экспорта моделей 
 *  (т.е. вся цепочка)
 */
function importAndCreate(   id:number = 0,
                            importJoin:boolean = true, 
                            exportModel:boolean = true,
                            onlyList:boolean = false, 
                            updateStats:boolean = true,
                            refreshModel:boolean = true,
                            updatedSince?: moment.Moment ): Observable<JoinCharacterDetail> {

    
    let sinceText = updatedSince? updatedSince.format("DD-MM-YYYY HH:mm:SS") : "";
    console.log(`Run import sequence with: id=${id}, import=${importJoin}, export=${exportModel}, onlyList=${onlyList}, updateStats=${updateStats}, refresh=${refreshModel}, updateSince=${sinceText}` )

    let workData: ModelImportData;

    if(isImportRunning) {
        console.log("Import session in progress.. return and wait to next try");
        return Observable.from([]);
    }

    isImportRunning = true;

    return prepareForImport()
    //Установить дату с которой загружать персонажей (если задано)
        .map( (data) => { 
            if(updatedSince){ data.lastRefreshTime = updatedSince; }
            console.log("Using update since time: " +  data.lastRefreshTime.format("DD-MM-YYYY HH:mm:SS")) 
            return data;
        })
    //Загрузить список персонажей (Join или кэш), если не задан ID
        .flatMap( (data:ModelImportData) => {
                if(id){
                    data.charList.push( JoinImporter.createJoinCharacter(id) );
                    return Observable.from([data]);
                }else if(importJoin){
                    return loadCharacterListFomJoin(data); 
                }else{
                    return loadCharacterListFromCache(data);
                }
        })
    //Запись в консоль
        .map( (data) => {
                workData = data;
                console.log(`Received character list: ${data.charList.length} characters`);
                if(onlyList){
                    workData.charList = [];
                }
                return workData;
        })
    //Загрузить данные из Join или из кеша
        .flatMap( (data:ModelImportData) => {
                        if(importJoin) {
                            console.log("Load characters from JoinRPG");
                            return loadCharactersFromJoin(data);
                        }else{
                            console.log("Load characters from CouchDB cache");
                            return loadCharactersFromCache(data);
                        }
        })
    //Сохранить данные в кеш (если надо)
        .flatMap( (c: JoinCharacterDetail) => { 
                    if(importJoin) {
                        return saveCharacterToCache(c, workData);
                    }else{
                        return Observable.from([c]);
                    }
            })
    //Экспортировать модель в БД (если надо)
        .flatMap( (c: JoinCharacterDetail) => {
                    if(exportModel) {
                        return exportCharacterModel(c, workData);
                    }else{
                        return Observable.from([c]);
                    } 
        })
        .flatMap( (c: JoinCharacterDetail) => { 
                if(refreshModel) {
                    return sendModelRefresh(c, workData);
                }else{
                    return Observable.from([c]);
                }
        })
        .do( ()=>{
                workData.importCouter++;
             },
             (error)=>{
                console.log( "Error in pipe: " + JSON.stringify(error) );  
                isImportRunning = false;
            },
            () => {
                isImportRunning = false;
                if(updateStats){
                    workData.cacheWriter.saveLastStats( new ImportRunStats(moment.utc()) );
                }
                console.log(`Import sequence completed. Imported ${workData.importCouter} models!`);
            }
        )
}