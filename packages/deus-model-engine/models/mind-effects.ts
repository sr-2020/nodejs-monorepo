/**
 * Эффекты, воздействующие на мозг
 */

import { default as helpers } from '../helpers/model-helper';
import { default as consts } from '../helpers/constants';
import { DeusExModel } from '../deus-ex-model';
import { EffectModelApi } from '@alice/interface/models/alice-model-engine';

/**
 * Универсальный эффект "изменение кубиков сознания " (change-mind-cube-effect)
 * Аналогичен changeMindCubeEvent
 */
export function changeMindCubesEffect(api: EffectModelApi<DeusExModel>, modifier) {
  api.debug('changeMindCubesEffect: start, change: ' + JSON.stringify(modifier));
  const changeCommand = modifier.mindCubeChange;

  const timerValue = api.getTimer(consts.NARCO_TIME_PREFIX + modifier.mID);

  if (timerValue) {
    api.debug('Timer: ' + JSON.stringify(timerValue));

    const scale = timerValue.miliseconds < modifier.pushbackDuration ? -110 : 100;

    if (changeCommand) {
      helpers.modifyMindCubes(api, api.model.mind, changeCommand, scale);
    }
  }
}
