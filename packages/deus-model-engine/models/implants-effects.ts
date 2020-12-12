/**
 * Эффекты работы имплантов
 */

import { default as helpers } from '../helpers/model-helper';
import { EffectModelApi, Modifier } from '@alice/alice-common/models/alice-model-engine';
import { DeusExModel } from '../deus-ex-model';

/**
 * Эффект показывающий состояние пока работает импланта.
 * Работа эффекта зависит от состояния предикатов в описание импланта
 * т.е. при каких данных генома и сознания что показывать
 * Параметры в предикате:
 *
 * "params": {
 *   "condition": "s_stability-0"
 * }
 */

export function showCondition(api: EffectModelApi<DeusExModel>, modifier: Modifier) {
  //Получить СПИСОК предикатов для показа (может быть несколько состояний)
  const params = helpers.checkPredicate(api, modifier.mID, 'show-condition', true);
  api.info('showCondition: start, predicate: ' + JSON.stringify(params));

  if (params) {
    //Пройти по всем совпадаениям в предикатах и показать все состояния
    params.forEach((data) => {
      helpers.addCharacterCondition(api, data.condition);
    });
  }
}

/**
 * Эффект, показывающий состояния, вне зависимости от предикатов
 * modifier.conditions = ["cond-id"]
 */

export function showAlwaysCondition(api: EffectModelApi<DeusExModel>, modifier: Modifier & { conditions: string[] }) {
  api.debug('Show always condition ' + JSON.stringify(modifier.conditions));
  if (modifier.conditions) {
    //Пройти по всем совпадаениям в предикатах и показать все состояния
    modifier.conditions.forEach((condition: string) => {
      helpers.addCharacterCondition(api, condition);
    });
  }
}

/**
 * Универсальный эффект "изменение свойства модели" (change-properties)
 * Эффект позволяет импланту изменить любое простое свойство в модели (или несоклько )
 * на то время пока он действует.
 * Функционально аналогичен событию changeModelVariableEvent, за исключением того
 * что может менять несколько переменных сразу
 * Использует предикаты для определения что и как менять
 *
 * В предикате в параметрах должна быть строка вида:
 *  propertyName1+X,propertyName2-Y,propertyName3=Z
 *
 */
export function changeProperties(api: EffectModelApi<DeusExModel>, modifier: Modifier) {
  const params = helpers.checkPredicate(api, modifier.mID, 'change-properties');
  api.info('changeProperties: start, predicate: ' + JSON.stringify(params));

  if (params) {
    helpers.modifyModelProperties(api, params.operations);
  }
}
