/**
 *  В ViewModel для медиков и психологов должны входить:
 *    _id: string;        //id в БД == JoinRPG ID 
 *    mail: string;       //loging@alice.digital
 *    login: string;      //login
 *    profileType: string;    //Тип профиля (human/robot/program)
 *    firstName: string;      //имя 
 *    nicName?: string;       //ник-нейм
 *    lastName?:  string;     //фамилия
 *    hp: number;         //количество хитов
 *    maxHp: number;      //макстмальное количество хитов персонажа
 *  
 *    sex?: string;            //пол
 *    generation?: string;     //Поколение (A / W / Z / X/Y)
 *    genome?: number[];  
 *    memory: Array<MemoryElement> = [];
 *    mind?: MindData; 
 * 
 *    mindBase: MindData
 * 
 *  export interface MindData {
 *   [index: string]: number[];
 *  }
 * 
 * export interface MemoryElement {
 *   title: string,
 *   text?: string,
 *   url?: string
*  }
 *  
 */


function getViewModel(api, data) {
    let props = [ '_id', 'login', 'mail', 'profileType', 'firstName', 'lastName', 'hp', 'maxHp', 'sex','generation'];
    let ret = {}

    props.forEach( e => { ret[e] = api.model[e] ? api.model[e] : ""});
 
    if(api.model.genome) {
        ret.genome = Array.from(api.model.genome)
    }

    if(api.model.systems){
        ret.systems = Array.from(api.model.systems)
    }

    if(api.model.memory){
        ret.memory = Array.from(api.model.memory, m => ({
            title : m.title, 
            text : m.text ? m.text : "",
            url : m.url ? m.url : ""
        }));
    }

    if(api.model.mind){
        ret.mind = {};
        
        for(key in api.model.mind){
            ret.mind[key] = Array.from(api.model.mind[key]);
        }
     }

    if(api.baseModel.mind){
        ret.mindBase = {};
    
        for(key in api.baseModel.mind){
            ret.mindBase[key] = Array.from(api.baseModel.mind[key]);
        }
    }

    if(api.model.modifiers){
        ret.implants = [];

        api.model.modifiers.filter( m => m.system )
                        .forEach( m => ret.implants.push( { 
                                    id: m.id,
                                    displayName: m.displayName,
                                    system: m.system,
                                    enabled: m.enabled
                        }));
    }

    return ret;
}

module.exports = () => {
    return {
        view_medic_viewmodel(api, model) {
            return getViewModel(api, model);
        }
    }
}

