//=====================================================
// Модельный код для LiveDemo 10.06.2017
//=====================================================

function loadImplant( name ){
    let implant = this.getCatalogObject("implants", name);
    let effects = [];

    this.debug(`Implant effects ${implant.effects} `);

    for (let eID of implant.effects) {
        let effect = this.getCatalogObject("effects", eID);
        effect.enabled = true;
        effects.push(effect);
    }

    implant.effects = effects;
    implant.enabled = true;

    return implant;
}

function loadIllness( id ){
    let illness = this.getCatalogObject("illnesses", id);
    this.debug(`Loaded illness ${illness.displayName}`);

    illness.currentStage = 0;
    illness.timerName = "illTimer" + Math.floor((Math.random() * 100000)).toString();

    return illness;
}


function _changeMaxHP( data ){
    let hp = this.get("hp") + data.hp;
    let maxHp = this.get("maxHp") + data.hp;
    
    if(hp < 1) { hp = 1;  }
    if(maxHp < 1) { maxHp = 1;  }
    
    this.set("hp", hp);
    this.set("maxHp", maxHp);
}

function setModifierState(id, enabled) {
    let modifiers = this.get('modifiers');
    let index = modifiers.findIndex((m) => m.mID == id);
    
    if (index >= 0) {
        modifiers[index].enabled = enabled;
        this.set('modifiers', modifiers);
    }    
}

//Обработчик таймера болезни
// Данные {  mID = GUID //mID болезни  }
function illnessTimerHandler( data ){
    this.debug(`====illnessTimerHandler() illness: ${data.mID} ====`);

    let modifiers = this.get('modifiers');
    let index = modifiers.findIndex((m) => m.mID == data.mID);

    if (index >= 0) {
        if(modifiers[index].currentStage < modifiers[index].stages.length - 1){
            modifiers[index].currentStage += 1;
            this.debug(`Set next stage: ${modifiers[index].currentStage}`);
        
            this.set('modifiers', modifiers);
        }
    }    
}

//Показать все симптомы для всех болезней (без проверок)
function illnessStageShow( data ){
    this.debug("====illnessStageShow()====");
    for(let ill of this.getModifiersByClass("illness")){
        this.debug(`Found illness: ${ill.displayName}`);
        for(let condID of ill.stages[ill.currentStage].conditions){
            this.addCondition( this.getCatalogObject("conditions", condID) );
        }
    }
}

module.exports = () => {
    return {

        /*
            Эффект для изменения максимального числа HP
            Так же изменяется и текущее.

            Параметры:
            {
                "hp" : xx  //xx целое число (может быть отрицательным)
            }
        */
        changeMaxHP(data){
            this.debug("====changeMaxHP()====");
            this.debug(`Change HP: ${data.hp}`);

            _changeMaxHP.apply(this, data);
        },

        /*
            Добавление импланта по названию (демо)
            {
                "name" : name  //название из справочника 
            }
        */
        addImplant(data){
            this.debug("====addImplant()====");
            this.debug(`Implant name: ${data.name}`);

            this.addModifier( loadImplant.apply(this, [data.name]) );
        },

        /*
            Эффект установленного demo-импланта
        */
        demoImplantEffect(data){
            this.debug("====demoImplantEffect()====");            
            this.addCondition( this.getCatalogObject("conditions", "demoImplantState") );
        },

        /*
            Отключение и включение импланта
            {
                "id" : xx  //mID конкретного импланта
            }
        */
        disableImplant(data) {
            this.debug("====disableImplant()====");
            setModifierState.apply(this, [ data.id, false ])
        },

        enableImplant(data) {
            this.debug("====enableImplant()====");
            setModifierState.apply(this, [ data.id, true ])
        },

        /*
            Общий эффект обработки всех таблеток.
            {
                "id" : guid  //id таблетки
            }
        */
        usePill(data){
            this.debug("====usePill()====");
            this.debug(`Pill ID: ${data.id}`);
            
            if(data.id == "f1c4c58e-6c30-4084-87ef-e8ca318b23e7"){
                this.debug("Add implant with name: HeartHealthBooster");

                this.addModifier( loadImplant.apply(this, ["HeartHealthBooster"]) );   
            }

            if(data.id == "dad38bc7-a67c-4d78-895d-975d128b9be8"){
                 this.debug("Start illness with name: anthrax");

                 let illness = loadIllness.apply(this, ["anthrax"]);
                 let _mID = this.addModifier( illness ); 
                 
                 this.debug(`Set illness timer ${illness.timerName} with mID: ${_mID} and delay ${illness.stages[0].delay*1000} `)
                 this.setTimer(illness.timerName, illness.stages[0].delay*1000, "illnessTimerHandler", { mId : _mID });
            }

             if(data.id == "38530a0d-99fc-4866-9653-8aea46ffa47e"){
                this.debug("Add 2 to HP pill!");

                _changeMaxHP.apply(this, [{ hp: 2 }]);
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
    }
 }