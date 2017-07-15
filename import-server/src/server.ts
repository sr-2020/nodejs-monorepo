import * as express from "express";
import { Observable, BehaviorSubject  } from 'rxjs/Rx';
import * as moment from "moment";

import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinData, JoinImporter, JoinCharacter,JoinCharacterDetail, JoinMetadata } from './join-importer';
import { TempDbWriter} from './tempdb-writer'


//Statisticts
let stats = new ImportStats();

var app = express();
app.listen(config.port);

app.get('/', function (req, res) {
    res.send(stats.toString());
})

Observable.timer(0, config.importInterval).subscribe( ()=> {
    console.log("Start import sequence!");
    importData();   
});

//Reenter flag
let isImportRunning = false;
let currentsStats = new ImportRunStats(); 

async function importData() {
    if(isImportRunning) {
        console.log("Import session in progress.. return and wait to next try");
        return;
    }

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
                .flatMap( (c:JoinCharacterDetail) => cacheWriter.saveCharacter(c) )             //сохранить в кеш (CouchDB)
                .do( (c:any)=> {currentsStats.imported.push(c.id)})                         //обновить статистику
                .subscribe( (c:any) => {
                    console.log( "Saved character: " + JSON.stringify(c) );
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

