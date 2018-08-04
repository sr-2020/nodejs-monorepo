import { Observable } from 'rxjs/Rx';
import * as PouchDB from 'pouchdb';
import * as winston from 'winston';
import * as clones from 'clones';

/**
 * Сохранить в БД (connection) переданный объект (doc) 
 * Перед сохранением проверяется есть ли там уже такой думент, 
 * если задан update == true, то этот документ обновляется
 * 
 */
export function saveObject( connection: any, doc: any, update:boolean = true ): Observable<any> {

    doc = clones(doc);

    //Если в объекте не установлен _id => то его можно просто сохранять, проставится автоматически 
    if(!doc._id){
        return Observable.fromPromise( connection.post(doc) );
    }

    return Observable.fromPromise(connection.get( doc._id ))
        .flatMap( (oldDoc:any) => { 
            winston.debug(`try to save: ${doc._id}`);
            if(update){
                doc._rev = oldDoc._rev;
                return connection.put(doc);
            }else{
                Promise.resolve({ status: "exist", oldDoc: oldDoc });
            }
        })
        .catch( (err) => {
            if(err.status && err.status == 404){
                return connection.put(doc)
            }
            else{
                winston.warn(`catch object: `, err, doc);    
            }
        });



    // //Иначе надо проверить наличие 
    // return connection.get( doc._id)
    //         .then( (oldDoc:any) =>{
    //             if(update){
    //                 doc._rev = oldDoc._rev;
    //                 return connection.put(doc);
    //             }
    //             return Promise.resolve({ status: "exist", oldDoc: oldDoc });
    //         })
    //         .catch( () => connection.put(doc) );
}