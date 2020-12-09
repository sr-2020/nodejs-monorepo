import { default as consts } from '../helpers/constants';
import { default as helpers } from '../helpers/model-helper';
import { default as medhelpers } from '../helpers/medic-helper';
import { DeusExModel } from '../deus-ex-model';
import { EffectModelApi, EventModelApi } from '@alice/interface/models/alice-model-engine';

/**
 * Обработчик события "serenity-immortality-ready"
 *
 * Вызывается по таймеру через час после установки импланта s_immortal01
 * Ставит флаг "immortalityReady" в импланте (а по этому флагу показывается сообщение о готовности)
 */
export function serenityImmortalityReadyEvent(api: EventModelApi<DeusExModel>, data) {
  const implant = api.getModifierById(data.mID);

  if (implant) {
    implant.immortalityReady = 'true';

    api.info(`serenityImmortalityReady: Serenity "Stage01" implant set to ready state`);
    helpers.addChangeRecord(api, 'Обучение кибернетической нейронной сети завершено', api.model.timestamp);
  }
}

/**
 * Эффект serenity_immortality_s01
 * Показывает состояние готовности, когда immortalityReady == "true"
 */
export function serenityImmortalityS01Effect(api: EffectModelApi<DeusExModel>, implant) {
  api.debug(`serenityImmortalityS01Effect: start stage 01 visibility effect`);

  if (implant && implant.id == consts.S_IMMORTAL_NAME_01 && implant.immortalityReady) {
    helpers.addCharacterCondition(api, 'serenity-immortality-ready');
  }
}

/**
 * Обработчик события "serenity-immortality-go"
 *
 * Событие вызывается по "таблетке" и выполняет конвертацию в Serenety-style бессмертного
 * Выполняется только при наличии импланта s_immortal01 с установленным флагом immortalityReady
 */
export function serenityImmortalityGoEvent(api: EventModelApi<DeusExModel>, data) {
  const implant = api.model.modifiers.find((m) => m.id == consts.S_IMMORTAL_NAME_01);

  if (!implant || !implant.immortalityReady) {
    api.info(`serenityImmortalityGo: character not ready (no s_immortal01 implant or no ready flag). Stop processing`);
    helpers.addChangeRecord(api, 'Модернизация не может быть проведена', api.model.timestamp);

    return;
  }

  ///Профиль и хиты
  api.model.profileType = 'ex-human-robot';
  api.model.maxHp = 4;

  const dmg = api.getModifierById(consts.DAMAGE_MODIFIER_MID);
  if (dmg) {
    dmg.damage = 0;
  }

  if (api.getTimer(consts.DEATH_TIMER)) {
    api.removeTimer(consts.DEATH_TIMER);
  }

  api.info(`serenityImmortalityGo: character new profile type ${api.model.profileType}, maxhp=${api.model.maxHp}`);

  //Убрать все болезни
  const illnesses = api.model.modifiers.filter((m) => helpers.isIllness(m));
  illnesses.forEach((ill) => medhelpers.removeIllness(api, ill.mID));

  //Убрать все импланты
  api.model.modifiers = api.model.modifiers.filter((m) => !helpers.isImplant(m));

  api.info(`serenityImmortalityGo: character modifiers after transform ${api.model.modifiers.map((m) => m.id).join(',')}`);

  //Убрать системы и прочее лишнее
  delete api.model.systems;
  delete api.model.generation;

  //Атрибуты роботов
  api.model.model = 'Serenity ExHuman 1.0';
  api.model.maxSecondsInVr = 86400;

  //Поправить кубики сознания
  api.model.mind.C[7] = 100;
  api.model.mind.D[8] = 100;

  helpers.addChangeRecord(api, 'Модернизация организма завершена', api.model.timestamp);
}
