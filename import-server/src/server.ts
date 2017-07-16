import * as express from "express";
import { Observable, BehaviorSubject  } from 'rxjs/Rx';
import * as moment from "moment";
import * as commandLineArgs  from 'command-line-args';

import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinData, JoinImporter, JoinCharacter,JoinCharacterDetail, JoinMetadata } from './join-importer';
import { TempDbWriter} from './tempdb-writer';
import { AliceExporter } from './alice-exporter';

//Сheck CLI arguments
const cliDefs = [
        { name: 'recreate', alias: 'r', type: Boolean }
];
const params = commandLineArgs(cliDefs);

//Reenter flag
let isImportRunning = false;

//Statisticts
let stats = new ImportStats();


if(params.recreate){
    console.log("Recreate models from the cache");
    recreateModels();
}else{
    console.log(`Start HTTP-server on port: ${config.port} and run import loop`);

    var app = express();
    app.listen(config.port);

    app.get('/', function (req, res) {
        res.send(stats.toString());
    })

    Observable.timer(0, config.importInterval).subscribe( ()=> {
        console.log("Start import sequence!");
        importData();   
    });
}

/**
 *  Функция для импорта данных из Join, записи в кеш CouchDB 
 *  и экспорта моделей
 */
async function importData() {
    if(isImportRunning) {
        console.log("Import session in progress.. return and wait to next try");
        return;
    }

    let currentsStats = new ImportRunStats(); 

    isImportRunning = true;

    let importer:JoinImporter = new JoinImporter();
    let cacheWriter: TempDbWriter = new TempDbWriter();

    //Получить статистику последнего импорта (если была)
    stats.lastRefreshTime = (await cacheWriter.getLastStats()).importTime;
    console.log("Last import time set to: " + stats.lastRefreshTime.format("L LTS"));

    await importer.init();

    let metadata:JoinMetadata = await importer.getMetadata();
    console.log(`Received metadata!`);  

    await cacheWriter.saveMetadata(metadata);
    console.log(`Save metadata to cache!`);  
    
    let charList:JoinCharacter[] = await importer.getCharacterList( stats.lastRefreshTime.subtract(1,"hours") );
    console.log(`Received character list: ${charList.length} characters`);  

    //TODO - remove in prod
    //charList = charList.slice(0,10);


    //Пройти по всему списку персонажей
    Observable.from(charList)
                .bufferCount(config.importBurstSize)   //Порезать на группы по 20
                .mergeMap( (cl:JoinCharacter[]) => {        //Каждую группу преобразовать в один общий Promise, ждущий все запросы в группе
                    console.log(`Process buffer!`);

                    let promiseArr: Promise<JoinCharacterDetail>[] = [];
                    cl.forEach( c => promiseArr.push(importer.getCharacter(c.CharacterLink)) );
                    return Promise.all(promiseArr);
                }, 1)
                .retry(3)
                
                .mergeMap( (cl:JoinCharacterDetail[]) => Observable.from(cl) ) //Полученные данные группы разбить на отдельные элементы для обработки
                .do( (c:JoinCharacterDetail) => console.log(`Imported character: ${c.CharacterId}`) )  //Написать в лог
                
                //.map( (c:JoinCharacterDetail) => cacheWriter.setFieldsNames(c, metadata))       //проставить имена полей в объекте из метаданных
                .do( (c:JoinCharacterDetail) => cacheWriter.saveCharacter(c) )             //сохранить в кеш (CouchDB)
                
                .do( (c:JoinCharacterDetail) => console.log(`Character id: ${c._id} saved to cache`) )

                .flatMap( (c:JoinCharacterDetail) => { 
                        let modelExporter = new AliceExporter(c, metadata, true);
                        return modelExporter.export();
                } )

                .do( (c:any)=> {currentsStats.imported.push(c.id)})                         //обновить статистику

                .subscribe( (c:any) => {
                    console.log( `Exported model for character id = ${c.id}: ` + JSON.stringify(c) );
                },
                (error:any) => {
                    console.log( "Error in pipe: " + JSON.stringify(error) );   
                    isImportRunning = false;
                },
                () => {
                    currentsStats.importTime = moment();
                    cacheWriter.saveLastStats(currentsStats).then(() => {
                        stats.addImportStats(currentsStats);
                        isImportRunning = false;
                        console.log( "Import sequence completed!" );
                    })
                }
            );
}


/**
 *  Функция для ручной перезаливки моделей из кеша
 */
async function recreateModels() {
    
    let cacheWriter: TempDbWriter = new TempDbWriter();

    let metadata:JoinMetadata = await cacheWriter.getMetadata();
    console.log(`Loaded metadata from cache!`);  

    let exceptionIds = ["JoinMetadata", "lastImportStats"];

    Observable.fromPromise(cacheWriter.getCacheCharactersList())
        .do( (c:any) => console.log(JSON.stringify(c, null, 4)) )
        .flatMap( (result:any) => Observable.from(result.rows) )

        .filter( (doc:any) => !exceptionIds.find(e => e == doc.id ) )
        .flatMap( (doc:any) => cacheWriter.getCacheCharacter(doc.id), 10 )
        
        .flatMap( (c:JoinCharacterDetail) => { 
                        let modelExporter = new AliceExporter(c, metadata, true);
                        return modelExporter.export();
                } )

        .retry(3)

        .subscribe( (c:any) => {
                    console.log( `Update model for character id = ${c.id}: ` + JSON.stringify(c) );
                },
                (error:any) => {
                    console.log( "Error in pipe: " + JSON.stringify(error) );   
                     process.exit(1);
                },
                () => {
                     console.log( "Update sequence completed!" );
                     process.exit(0);
                }
         );
}