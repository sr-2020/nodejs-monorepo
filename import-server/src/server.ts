import * as express from "express";
import { Observable } from 'rxjs/Rx';
import * as moment from "moment";

import { ImportStats } from './stats';
import { config } from './config';
import {loadJoinRPGData, JoinData } from './join-importer';
import {tempDbStoreData} from './tempdb-writer'

//Statisticts
let stats = new ImportStats();

var app = express();
app.listen(config.port);

app.get('/', function (req, res) {
    res.send(stats.toString());
})

Observable.timer(0, 30000).subscribe( ()=> {
   stats.lastRefreshTime = moment(); 
   console.log("update!");
});

importData();


async function importData() {
    let importData:JoinData = await loadJoinRPGData();
    console.log("Test point!");
    tempDbStoreData(importData.characters, importData.metadata);
}