//=====================================================
// Модельный код для LiveDemo 10.06.2017
//=====================================================

function loadImplant( api, id ){
    let implant = api.getCatalogObject("implants", id);
    let effects = [];

    api.debug("implant name: " + id + ", JSON: " + JSON.stringify(implant));
    api.debug(`Implant effects ${implant.effects} `);

    for (let eID of implant.effects) {
        let effect = api.getCatalogObject("effects", eID);
        effect.enabled = true;
        effects.push(effect);
    }

    implant.effects = effects;
    implant.enabled = true;

    return implant;
}

function loadIllness( api, id ){
    let illness = api.getCatalogObject("illnesses", id);
    api.debug(`Loaded illness ${illness.displayName}`);

    illness.currentStage = 0;
    illness.timerName = "illTimer" + Math.floor((Math.random() * 100000)).toString();

    return illness;
}


function _changeMaxHP(api, data ){
    api.debug(`====_changeMaxHP(): ${data.hp} ====`);

    api.model.hp += data.hp;
    api.model.maxHp += data.hp;

    if(api.model.hp < 1) { api.model.hp = 1;  }
    if(api.model.maxHp < 1) { api.model.maxHp = 1;  }
}

function setModifierState(api, id, enabled) {
    let modifier = api.getModifierById(id);
    modifier.enabled = enabled;
}

//Обработчик таймера болезни
// Данные {  mID = GUID //mID болезни  }
function illnessTimerHandler( api, data ){
    api.debug(`====illnessTimerHandler() illness: ${data.mID} ====`);

    let modifier = api.getModifierById(data.mID);

    if (modifier) {
        if(modifier.currentStage < modifier.stages.length - 1){
            modifier.currentStage ++;
            api.debug(`Set next stage: ${modifier.currentStage}`);

            api.setTimer(modifier.timerName, modifier.stages[modifier.currentStage].delay*1000, "illnessTimerHandler", { mID : modifier.mID });
        }else if(modifier.currentStage == modifier.stages.length-1){
            modifier.currentStage ++;
            api.debug(`Last stage: ${modifier.currentStage}`);
        }
    }
}

//Показать все симптомы для всех болезней (без проверок)
function illnessStageShow(api, data ){
    api.debug("====illnessStageShow()====");

    for(let ill of api.getModifiersByClass("illness")){
        api.debug(`Found illness: ${ill.displayName}, stage ${ill.currentStage}`);

        if(ill.currentStage < ill.stages.length) {
            for(let condID of ill.stages[ill.currentStage].conditions){
                api.addCondition( api.getCatalogObject("conditions", condID) );
            }
        }
    }
}

module.exports = {
    /*
      Эффект для изменения максимального числа HP
      Так же изменяется и текущее.

      Параметры:
      {
      "hp" : xx  //xx целое число (может быть отрицательным)
      }
    */
    changeMaxHP(api, data){
        api.debug("====changeMaxHP()====");
        api.debug(`Change HP: ${data.hp}`);

        _changeMaxHP(api, data);
    },

    /*
      Добавление импланта по названию (демо)
      {
      "name" : name  //название из справочника
      }
    */
    addImplant(api, data){
        api.debug("====addImplant()====");
        api.debug(`Implant name: ${data.name}`);

        api.addModifier(loadImplant(api, [data.name]) );
    },

    /*
      Эффект установленного demo-импланта
    */
    demoImplantEffect(api, data){
        api.debug("====demoImplantEffect()====");
        var condition = api.getCatalogObject("conditions", "demoImplantState");
        api.addCondition( condition );
    },

    /*
      Отключение и включение импланта
      {
      "id" : xx  //mID конкретного импланта
      }
    */
    disableImplant(api, data) {
        api.debug(`====disableImplant( mid : ${data.mID} )====`);
        setModifierState(api, data.mID, false)
    },

    enableImplant(api, data) {
        api.debug(`====enableImplant( mid : ${data.mID} )====`);
        setModifierState(api, data.mID, true )
    },

    /*
      Общий эффект обработки всех таблеток.
      {
      "id" : guid  //id таблетки
      }
    */
    usePill(api, data){
        api.debug("====usePill()====");
        api.debug(`Pill ID: ${data.id}`);

        if(data.id == "f1c4c58e-6c30-4084-87ef-e8ca318b23e7"){
            api.debug("Add implant with name: HeartHealthBooster");

            api.addModifier( loadImplant(api, "TestImplant01") );
        }

        if(data.id == "dad38bc7-a67c-4d78-895d-975d128b9be8"){
            api.debug("Start illness with name: anthrax");

            let illness = loadIllness(api, "anthrax");
            let m = api.addModifier( illness );

            api.debug(`Set illness timer ${illness.timerName} with mID: ${m.mID} and delay ${illness.stages[0].delay*1000} `);
            api.setTimer(illness.timerName, illness.stages[0].delay*1000, "illnessTimerHandler", { mID : m.mID });

            api.debug("  Timers: " + JSON.stringify(api.model.timers));
        }

        if(data.id == "3a0867ad-b9c9-4d6e-bc3e-c9c250be0ec3"){
            api.debug("Add 2 to HP pill!");

            _changeMaxHP(api, { hp: 2 });
        }


    },

    /*
      Обработчик таймера болезни. Переводит болезнь на следующую стадию
    */
    illnessTimerHandler,

    /*
      Общий эффект для показа симптомов болезней
    */
    illnessStageShow
};
