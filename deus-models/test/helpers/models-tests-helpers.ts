//Helper'ы для тестирования моделей для Deus 2017

//import { Observable } from 'rxjs/Rx';

import * as PouchDB from 'pouchdb';
import * as pouchDBFind from 'pouchdb-find';


let hConfig = {
    url: "http://devserver:devserver@10.254.1.130:5984/",
    eventsDB: "events",
    baseModelDB: "models",
    workModelDB: "workmodels",
    viewModelDB: "viewmodels"
}

let exModelID = "1111";

let BACKEND_WAIT_TIME = 2000;

let REFRESH_EVENT_TYPE = "_RefreshModel";

let cons = {
    events: <any> null,
    base: <any> null,
    work: <any> null,
    view: <any> null
};

export function testHelper(): string {
    return "Test Helper String";
}

export default testHelper;

export function prepareConnections(){
    console.log("    prepareConnections(): open DBs connections");
    cons.events = new PouchDB(hConfig.url + hConfig.eventsDB);
    cons.base = new PouchDB(hConfig.url + hConfig.baseModelDB);
    cons.work = new PouchDB(hConfig.url + hConfig.workModelDB);
    cons.view = new PouchDB(hConfig.url + hConfig.viewModelDB);
}

export function clearConnections(){
    console.log("    prepareConnections(): close DBs connections");
    if(cons.events) cons.events.close();
    if(cons.base) cons.base.close();
    if(cons.work) cons.work.close();
    if(cons.view) cons.view.close();
}

export function sendEvent(eventType: string, data: any, refresh: boolean = true  ): Promise<any> {
    console.log(`    sendEvent(): send event '${eventType}' to backend, refresh: ${refresh}`);

    let docs = [];

    if(eventType){
        docs.push(
        {
            characterId: exModelID,
            eventType: eventType,
            timestamp: Date.now(),
            data: data
        });

    }

    if(refresh){
        docs.push(
            {
                characterId: exModelID,
                eventType: REFRESH_EVENT_TYPE,
                timestamp: Date.now() + 1,
                data: { }
            });
    }

    return cons.events.bulkDocs( docs ).then( (x:any) => {
        //console.log(" Start waiting for backend processing");
        //console.log(JSON.stringify(x));

        return new Promise((resolve) =>{
            setTimeout(resolve, BACKEND_WAIT_TIME);
        })
    }).then( () => {
        //console.log( Date().valueOf() + " Get result model");

        return getBaseModel();  //TODO: change to work
    });
}

export function getWorkModel(): Promise<any>{
    return cons.work.get(exModelID);
}

export function getBaseModel(): Promise<any>{
    return cons.base.get(exModelID);
}


function mapForDelete(x: any) {
    return {
        _id: x.id,
        _rev: x.value.rev,
        _deleted: true
    };
}

function clearOneDB(connection: any): Promise<any> {
    return connection.allDocs().then((result:any) => connection.bulkDocs(result.rows.map(mapForDelete)));
}

export function clearDB(): Promise<any> {
    console.log("    clearDB(): Clear and prepare DBs");

    let p1 = clearOneDB(cons.events);
    let p2 = clearOneDB(cons.base);
    let p3 = clearOneDB(cons.work);
    let p4 = clearOneDB(cons.view);

    return Promise.all([p1, p2, p3, p4]);
}

export function cteateExampleModel(): Promise<any> {
    let model = getExampleModel();

    return cons.base.put(model)
}


function getExampleModel(): any {

    return {
        _id: exModelID,
        memory: [
            {
                title: "Название воспоминания №1",
                text: "Какие-то воспоминания о хрен знает чем...",
                url: "http://link-to-local-server.local/url"
            },
            {
                title: "Название воспоминания №2",
                url: "http://link-to-local-server.local/url2"
            }
        ],
        firstName: "Имя",
        lastName:  "Фамилия",
        skills: [],
        sex: "male",
        corporation: "Skynet",
        hp: 4,
        maxHp: 5,
        mind: {
            "A": [ 0, 1, 2, 3, 2, 1 ],
            "B": [ 0, 1, 2, 3 ],
            "C": [1, 2, 4 ]
        },
        timestamp: Date.now(),
        conditions: [
            {
                "id": "demoState",
                "class": "physiology",
                "text": "Тестовое постоянное состояние!",
                "details": "Тестовое постоянное состояние!"
            }
        ],

        password: "P@ssw0rd",

        modifiers: [ ],
        //     {
        //         "id": "HeartHealthBooster",
        //         "displayName": "Мотор для сердца +2 HP",
        //         "class": "mechanical",
        //         "system": "CardioSystem",
        //         "effects": [
        //             {
        //                 "id": "demoEffect",
        //                 "class": "physiology",
        //                 "type": "normal",
        //                 "handler": "demoImplantEffect",
        //                 "enabled": true
        //             }
        //         ],
        //         "enabled": true,
        //         "mID": "cj3pyoqr00000b3jsog2gsswe"
        //     }
        //],
        "age": 17,
        "timers": []
    };
}
