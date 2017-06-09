//=====================================================
// Модельный код для LiveDemo 10.06.2017
//=====================================================

function setMaxHP( oldHP, modHP ){
    let hp = oldHP + modHP;
    
    if(hp < 1) { hp = 1;  }

    return hp;
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

            let oldHP = this.get()

            this.udpdate("hp", (oldHP) => setMaxHP(oldHP,data.hp) );
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
                changeMaxHP({ hp: 2 });                   
            }

            if(data.id == "dad38bc7-a67c-4d78-895d-975d128b9be8"){
                 this.debug("Start illness pill!");
            }
        }
    }
 }