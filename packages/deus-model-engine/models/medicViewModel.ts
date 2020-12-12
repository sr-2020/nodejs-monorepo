import { ViewModelApiInterface } from '@alice/alice-common/models/alice-model-engine';
import { DeusExModel } from '../deus-ex-model';

/**
 *  В ViewModel для медиков и психологов должны входить:
 *    modelId: string;     // JoinRPG ID
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
 */

export interface MindData {
  [index: string]: number[];
}
export function view_medic_viewmodel(api: ViewModelApiInterface<DeusExModel>, _) {
  const props = ['modelId', 'login', 'mail', 'profileType', 'firstName', 'lastName', 'hp', 'maxHp', 'sex', 'generation'];
  const ret: any = {};

  props.forEach((e) => {
    ret[e] = api.model[e] ? api.model[e] : '';
  });

  if (api.model.genome) {
    ret.genome = Array.from(api.model.genome);
  }

  if (api.model.systems) {
    ret.systems = Array.from(api.model.systems);
  }

  if (api.model.memory) {
    ret.memory = Array.from(api.model.memory, (m) => ({
      title: m.title,
      text: m.text ? m.text : '',
      url: m.url ? m.url : '',
      mID: m.mID,
    }));
  }

  if (api.model.mind) {
    ret.mind = {};

    for (const key in api.model.mind) {
      ret.mind[key] = Array.from(api.model.mind[key]);
    }
  }

  if (api.baseModel.mind) {
    ret.mindBase = {};

    for (const key in api.baseModel.mind) {
      ret.mindBase[key] = Array.from(api.baseModel.mind[key]);
    }
  }

  ret.implants = [];

  api.model.modifiers
    .filter((m) => m.system)
    .forEach((m) =>
      ret.implants.push({
        id: m.id,
        displayName: m.displayName,
        system: m.system,
        enabled: m.enabled,
      }),
    );

  return ret;
}
