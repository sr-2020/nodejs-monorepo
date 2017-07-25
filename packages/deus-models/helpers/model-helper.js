
/**
 * Хелперы для разных моделей
 */
function loadImplant(api, id){
    let implant = api.getCatalogObject("implants", id.toLowerCase());

    if(!implant){
        api.error(`loadImplant: implant id=${id} not found!`)
        return null;
    }

    let effects = [];

    implant.effects.forEach( eID => {
        let effect = api.getCatalogObject("effects", eID.toLowerCase());
        if(effect){
            effect.enabled = true;
            effects.push(effect);
        }else{
            api.error(`loadImplant: effect id=${eID} not found!`)
        }
    })

    implant.effects = effects;
    implant.enabled = true;

    return implant;
 }

//TODO проверить какой timestamp в модели в момент обработки changes
function addChangeRecord( api, text ){
    if(text){
        api.model.changes.push({
            mID: uuidv4(),
            text: text,
            timestamp: api.model.timestamp
        });
    }
}

//Проверка предиката и возвращение данных для работы эффекта
//Вовращается объект Params (если он есть)
function checkPredicate(api, mID, effectName){
    let implant = api.getModifierById(mID)

    if(implant){
        api.info(`checkPredicate for ${mID}, effect: ${effectName}`);

        let p = implant.predicates.filter( p => p.effect == effectName)
                    .find( p => isGenomeMatch(api, p.variable, p.value) || 
                                isMindCumeMatch(api, p.variable, p.value) );

        if(p){
            return p.params;
        }else{
            return null;
        }
    }
}

function isMindCumeMatch(api, variable, condition){
    let parts = variable.match(/^([A-G])(\d)/i);
    
    if(parts){
        let cube = parts[1];
        let index = Number(parts[2]) - 1;

        //console.log(`isMindCumeMatch: ${cube}${index} ? ${condition} => ${api.model.mind[cube][index]}`);

        if(api.model.mind && api.model.mind[cube]){
            if(checkValue( api.model.mind[cube][index], condition)){
                return true;
            }
        }
    }

    return false;
}

//Condition это условие для проверки value. 
//имеет форматы: <X, >Y, A-B, X
function checkValue(value, condition){
    let l = -1;
    let h = -1;
    let parts = "";
    let v = Number.parseInt(value)

    l = Number.parseInt(condition);
    if( !Number.isNaN(l) ){
        h = l;
    }
    
    if( (parts = condition.match(/^(\d+)\-(\d+)$/i)) ){
        l = Number.parseInt(parts[1]);
        h = Number.parseInt(parts[2]);
    } 
    
    if( (parts = condition.match(/^([<>])(\d+)$/i) ) ){
        if(parts[1] == ">" ){
            l = Number.parseInt(parts[2]) + 1;
            h = Number.MAX_VALUE;
        }else{
            h = parts[2] - 1
            l = 0;
        }
    }
    
    //console.log(`checkValue: ${l} ..  ${v} .. ${h}`)

    if(v >= l && v <= h ){
        return true;
    }else{
        return false;
    }
}

function isGenomeMatch(api, variable, value){
    let parts = variable.match(/^Z(\d\d?)/i);

    if(parts){
        let index = Number.parseInt(parts[1])-1;
        if(api.model.genome &&  (index < api.model.genome.length)){
            if(api.model.genome[index] == Number.parseInt(value)){
                return true;
            }
        }
    }
    return false;
}

/**
 * Модифицирует кубики сознания в переданном объекте Mind,
 * в соответствии с "инструкцией"
 * Формат инструкции из таблицы имплантов:
 * A1+X,B2-Y,C2=Z 
 * 
 * Предполагается что текст инструкции уже нормализован 
 * (верхний регистр, без пробелов, через запятую)
 */
function modifyMindCubes(api, mind, changeText){
    changeText.split(',').forEach( exp => {

        //console.log(`MMC:  Part: ${exp}`);

        let exParts = exp.match(/([A-G])(\d)([\+\-\=])(\d+)/i);
        if(exParts){
            let cube = exParts[1];
            let index = Number(exParts[2]) - 1;
            let op = exParts[3];
            let mod = Number(exParts[4]);

            //console.log(`MMC parsed: ${cube}${index} ${op} ${mod}`);
            let beforeOp = mind[cube][index];

            if(mind[cube] && index < mind[cube].length){
                switch(op){
                    case '+' :  mind[cube][index] += mod;
                                break;
                    case '-' :  mind[cube][index] -= mod;
                                break;
                    default:    mind[cube][index] = mod;
                }
            }

            if(mind[cube][index] < 0 ){
                mind[cube][index] = 0;
            }

            if(mind[cube][index] > 100 ){
                mind[cube][index] = 100;
            }

            api.log(`modifyMindCubes: ${cube}${index} ${beforeOp} => ${mind[cube][index]}` );
        }
    })
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

 
module.exports = () => {
    return {
        loadImplant,
        addChangeRecord,
        uuidv4,
        checkValue,
        isMindCumeMatch,
        isGenomeMatch,
        checkPredicate,
        modifyMindCubes
    };
};

