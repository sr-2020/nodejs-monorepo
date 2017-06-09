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

            addModifier( loadImplant.apply(this, [data.name]) );
        },

        /*
            Эффект установленного demo-импланта
        */
        demoImplantEffect(data){
            this.debug("====demoImplantEffect()====");            
            addCondition( getCatalogObject("conditions", "demoImplantState") );
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
                this.debug("Add 2 to HP pill!");
                //_changeMaxHP.apply(this, [{ hp: 2 }]);

                this.debug("====addImplant()====");
                this.debug("Implant name: HeartHealthBooster");

                this.addModifier( loadImplant.apply(this, ["HeartHealthBooster"]) );   
            }

            if(data.id == "dad38bc7-a67c-4d78-895d-975d128b9be8"){
                 this.debug("Start illness pill!");
                 _changeMaxHP.apply(this, [{ hp: -10 }]); 
            }
        }
    }
 }