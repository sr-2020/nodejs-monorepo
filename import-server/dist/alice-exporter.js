"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PouchDB = require("pouchdb");
const chance = require("chance");
const winston = require("winston");
const config_1 = require("./config");
const join_import_tables_1 = require("./join-import-tables");
const model_1 = require("./interfaces/model");
const mind_model_stub_1 = require("./mind-model-stub");
class AliceExporter {
    constructor(character, metadata, catalogs, isUpdate = true) {
        this.character = character;
        this.metadata = metadata;
        this.catalogs = catalogs;
        this.isUpdate = isUpdate;
        this.con = null;
        this.accCon = null;
        this.model = new model_1.DeusModel();
        this.account = { _id: "", password: "", login: "" };
        const ajaxOpts = {
            auth: {
                username: config_1.config.username,
                password: config_1.config.password
            }
        };
        this.con = new PouchDB(`${config_1.config.url}${config_1.config.modelDBName}`, ajaxOpts);
        this.accCon = new PouchDB(`${config_1.config.url}${config_1.config.accountDBName}`, ajaxOpts);
        this.chance = new chance(character.CharacterId);
        this.createModel();
    }
    export() {
        if (!this.model._id) {
            return Promise.reject(`AliceExporter.export(): ${this.character._id} Incorrect model ID or problem in conversion!`);
        }
        //Create or update Profile 
        let profilePromise = this.con.get(this.model._id)
            .then((oldc) => {
            if (this.isUpdate) {
                this.model._rev = oldc._rev;
                winston.info(`Update model with id = ${this.model._id}.`);
                return this.con.put(this.model);
            }
            winston.info(`Model with id = ${this.model._id} is exists in DB. Updates is disabled!`);
            return Promise.resolve("exists");
        })
            .catch(() => this.con.put(this.model));
        if (!this.account.login || !this.account.password) {
            return Promise.all([profilePromise, Promise.resolve(false)]);
            ;
        }
        //Create or update account record
        let accPromise = this.accCon.get(this.account._id)
            .then((oldc) => {
            if (this.isUpdate) {
                this.account._rev = oldc._rev;
                winston.info(`Update account with id = ${this.account._id}.`);
                return this.accCon.put(this.account);
            }
            winston.info(`Acount with id = ${this.account._id} is exists in DB. Updates is disabled!`);
            return Promise.resolve("exists");
        })
            .catch(() => this.accCon.put(this.account));
        return Promise.all([profilePromise, accPromise]);
    }
    createModel() {
        try {
            winston.info(`Try to convert model id=${this.character.CharacterId}`);
            //ID Alice. CharacterId
            this.model._id = this.character.CharacterId.toString();
            this.account._id = this.model._id;
            //Login (e-mail). Field: 1905
            //Защита от цифрового логина
            this.model.login = this.findStrFieldValue(1905).split("@")[0];
            if (this.model.login && this.model.login.match(/^\d+$/i)) {
                winston.info(`ERROR: can't convert id=${this.character.CharacterId} login=${this.model.login}`);
                this.model._id = "";
                return;
            }
            this.account.login = this.model.login;
            if (this.model.login) {
                this.model.mail = this.model.login + "@alice.digital";
            }
            else {
                this.model.mail = "";
            }
            //Password. Field: 1905
            this.account.password = this.findStrFieldValue(2039);
            //Тип профиля и Поколение. Field: 498. Если не проставлено, выбирается W
            this.setGenerationAndType();
            //Установить имя песрнажа. Field: 496
            this.setFullName();
            //Локация  Field: 501
            this.model.sweethome = this.findStrFieldValue(501);
            //Блок данных возможных только для типа профиля "Human"
            if (this.model.profileType == "human") {
                //Пол персонажа Field: 696
                this.model.sex = this.findStrFieldValue(696, true);
                //Место работы (корпорация). Field: 2017 (1977 Неправильное)
                this.model.corporation = this.findStrFieldValue(2017);
                //Уровень зарплаты. Field: 1976
                this.model.salaryLevel = Number.parseInt(this.findStrFieldValue(1976, true));
                //Страховка и ее уровень. Field: 1973, 1975
                const insurance = this.findNumFieldValue(1973);
                if (insurance) {
                    this.model.insurance = insurance;
                    this.model.insuranceLevel = Number.parseInt(this.findStrFieldValue(1975, true));
                    this.model.insuranceDiplayName = this.findStrFieldValue(1973, true) + `, Уровень: ${this.model.insuranceLevel}`;
                }
                //TODO: модель сознания. Кубики
                this.setMindModel();
                //Болезни на начало игры. Field: 1949
                //TODO: нужно сгенерировать случайные болезни из списка.
                //Для этого нужен доступный список болезнй в БД, метод поиска по ним и подброра 
                //Геном. Зависит от полей: "Геном" (2042-2053), "Поколение"(498), "Клон"(1948)
                this.setGenome();
                //Воспоминания. Field: 1845,1846,1847
                this.setMemories([1845, 1846, 1847]);
                //Профиль хакера. Field: 1652
                this.model.hackingLogin = this.findStrFieldValue(1652);
                //Защта от хакерства  Field: 1649
                this.model.hackingProtection = Number.parseInt(this.findStrFieldValue(1649, true));
                //Поля для хакеров (ставим всем)
                this.model.lockReduction = 100;
                this.model.proxyRegen = 100;
                this.model.maxProxy = 100;
            }
            //Блок данных только для профиля андроида или программы
            if (this.model.profileType == "robot" ||
                this.model.profileType == "program") {
                //Создатель (для андроидов и программ) Field: 1829
                this.model.creator = this.findStrFieldValue(1829);
                //Владелец (для андроидов и программ) Field: 1830
                this.model.owner = this.findStrFieldValue(1830);
                //Модель андроида (или еще чего-нибудь) Field: 1906
                //TODO: это точно надо переделывать в какой-то внятный список ID моделей
                this.model.model = this.findStrFieldValue(1906);
                //Прошивка андроида. Field: 1907
                //TODO: это точно надо переделывать в какой-то внятный список ID моделей
                this.model.firmware = this.findStrFieldValue(1906);
                //Сохраненные данные. Field: 1845,1846,1847
                this.setMemories([1848, 1849, 1850]);
            }
            //Импланты на начало игры. Field: 1215
            //TODO: нужно получить список ID имплантов из Join (в деталях полей в метаданных)
            //Загрузить детали из БД со списком имплантов и добавить в модель
            //Нужна БД со список имплантов
            this.setImplants();
            //начальное количество хитов
            this.model.maxHp = 2;
            this.model.hp = 2;
            //Технические параметры
            this.model.timestamp = Date.now();
        }
        catch (e) {
            winston.info(`Error in converting model id=${this.character.CharacterId}: ` + e);
            this.model._id = "";
        }
    }
    //Возвращается DisplayString поля, или ""
    //Если convert==true, то тогда возращается выборка по Value из таблицы подставновки
    findStrFieldValue(fieldID, convert = false) {
        const field = this.character.Fields.find(fi => fi.ProjectFieldId == fieldID);
        if (!field)
            return "";
        if (!convert) {
            return field.DisplayString.trim();
        }
        else {
            return join_import_tables_1.joinValues.hasOwnProperty(field.Value) ? join_import_tables_1.joinValues[field.Value] : "";
        }
    }
    //Возвращается Value, которое должно быть цифровым или Number.NaN
    findNumFieldValue(fieldID) {
        const field = this.character.Fields.find(fi => fi.ProjectFieldId == fieldID);
        if (field) {
            let value = Number.parseInt(field.Value);
            if (!Number.isNaN(value)) {
                return value;
            }
        }
        return Number.NaN;
    }
    //Возвращается Value, которое должно быть списком цифр, разделенных запятыми
    //Если в списке встретится что-то не цифровое, в массиве будет Number.NaN
    findNumListFieldValue(fieldID) {
        const field = this.character.Fields.find(fi => fi.ProjectFieldId == fieldID);
        if (field) {
            return field.Value.split(',').map(el => Number.parseInt(el));
        }
        return [];
    }
    //Поколение. Field: 498. Если не проставлено, выбирается W
    //Поколения бывают: 735, 643, 644, 645 (ValueID из списка)
    setGenerationAndType() {
        let generation = this.findStrFieldValue(498, true);
        if (!generation) {
            generation = "W";
        }
        this.model.generation = generation;
        if (generation == "robot") {
            this.model.profileType = "robot";
        }
        else if (generation == "program") {
            this.model.profileType = "program";
        }
        else {
            this.model.profileType = "human";
        }
    }
    //Создает значение поля Геном для модели. 
    //Геном. Зависит от полей: группы "Геном" (2042-2053), "Поколение"(498), "Клон"(1948)
    setGenome() {
        //Снача проставить рандомный геном
        this.setRandomGenome();
        //Теперь пройти по всем полям и проставить их значения, если они есть.
        const FIELD_BASE = 2042;
        for (let n = 0; n < 12; n++) {
            const val = this.findStrFieldValue(FIELD_BASE + n);
            if (val && this.model.genome) {
                this.model.genome[n] = Number.parseInt(val.split(" ")[0]);
            }
        }
        //Проставить значение "Клон" если оно есть
        if (this.findStrFieldValue(1948)) {
            if (this.model.genome)
                this.model.genome[12] = 1;
        }
    }
    setRandomGenome() {
        //Всего 6 систем (полей генома) которые могут быть предрасположены к болезням
        let genome = new Array(13).fill(0);
        //Выбрать нужное количество "потенциально больных" систем организма
        let badSystems = 1;
        if (this.model.generation == "W") {
            badSystems = 2;
        }
        else if (this.model.generation == "Z") {
            badSystems = 3;
        }
        else {
            badSystems = 4;
        }
        while (badSystems > 0) {
            //Get random system number
            let n = this.chance.integer({ min: 0, max: 5 });
            if (genome[n] == 0) {
                genome[n] = 1;
                badSystems--;
            }
        }
        //Проставить случайные значения в остальные позиции
        for (let i = 6; i < 12; i++) {
            genome[i] = this.chance.integer({ min: 0, max: 2 });
        }
        this.model.genome = genome;
    }
    //Получить список имплантов и загрузить их в модель. Field: 1215
    //TODO: пока не возвращаеются Details из списка значений будет заглушка
    setImplants() {
        // this.findNumListFieldValue().map(
        //      (n) => {  }
        // )
        let idList = ["PA_FriendIn1", "S_Snow"];
    }
    //Установить имя песрнажа. Field: 496
    setFullName() {
        const name = this.findStrFieldValue(496);
        let parts = name.match(/^(.*?)\s\"(.*?)\"\s(.*)$/i);
        //Формат имени Имя "Ник" Фамилия
        if (parts) {
            this.model.firstName = parts[1];
            this.model.nicName = parts[2];
            this.model.lastName = parts[3];
            return;
        }
        //Формат имени Имя "Ник"
        parts = name.match(/^(.*?)\s\"(.*?)\"\s*$/i);
        if (parts) {
            this.model.firstName = parts[1];
            this.model.nicName = parts[2];
            this.model.lastName = "";
            return;
        }
        //Формат имени Имя Фамилия
        parts = name.match(/^(.*?)\s(.*)$/i);
        if (parts) {
            this.model.firstName = parts[1];
            this.model.lastName = parts[2];
            this.model.nicName = "";
            return;
        }
        //Формат имени - только имя
        this.model.firstName = name;
        this.model.nicName = "";
        this.model.lastName = "";
    }
    //Воспоминания/сохраненные данные. Список полей передается
    setMemories(fields) {
        fields.map(n => this.findStrFieldValue(n)).filter(m => m)
            .forEach(mem => this.model.memory.push({
            title: mem.substr(0, 30) + (mem.length > 30 ? "..." : ""),
            text: mem
        }));
    }
    //Установка модели кубиков сознания. Field value: 2054, 2055
    setMindModel() {
        this.model.mind = {};
        //Установить случайные значения во все элементы
        Object.keys(mind_model_stub_1.mindModelData).forEach((line) => {
            this.model.mind[line] = mind_model_stub_1.mindModelData[line].names.map(() => this.chance.integer({ min: 40, max: 59 }));
        });
        //Установить некоторые элементы в зависимости от поколения
        if (this.model.generation == "W") {
            this.model.mind.D[4] = this.chance.integer({ min: 60, max: 69 });
        }
        else if (this.model.generation == "Z") {
            this.model.mind.D[5] = this.chance.integer({ min: 30, max: 39 });
        }
        else if (this.model.generation == "A") {
            this.model.mind.C[6] = this.chance.integer({ min: 30, max: 39 });
            this.model.mind.E[1] = this.chance.integer({ min: 60, max: 69 });
        }
        //Установить кастомный кубик, если он задан
        let cName = this.findStrFieldValue(2054);
        let cValue = this.findStrFieldValue(2055);
        if (cName && cValue) {
            let value = Number.parseInt(cValue);
            if (!Number.isNaN(value))
                this.model.mind[cName.charAt(0)][Number.parseInt(cName.charAt(1))] = value;
        }
    }
}
exports.AliceExporter = AliceExporter;
//# sourceMappingURL=alice-exporter.js.map