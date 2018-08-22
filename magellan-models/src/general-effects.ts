/**
 * Разные универсальный эффекты
 */

import { ModelApiInterface } from 'deus-engine-manager-api';
import helpers = require('../helpers/model-helper');

/**
 * Эффект, показывающий состояния, вне зависимости от предикатов
 * modifier.conditions = ["cond-id"]
 */

function showAlwaysCondition(api: ModelApiInterface, modifier) {
  api.debug('Show always condition ' + JSON.stringify(modifier.conditions));
  if (modifier.conditions) {
    // Пройти по всем совпадаениям в предикатах и показать все состояния
    modifier.conditions.forEach((condition) => {
      helpers.addCharacterCondition(api, condition);
    });
  }
}

module.exports = () => {
  return {
    showAlwaysCondition,
  };
};
