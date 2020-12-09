import * as _ from 'lodash';
import { default as consts } from '../helpers/constants';
import { default as helpers } from '../helpers/model-helper';

const systemCount = consts.medicSystems.length;

export function getSystemFailureChance(generation: string) {
  if (generation == 'A') {
    return 1;
  }
  if (generation == 'W') {
    return 2;
  }
  if (generation == 'Z') {
    return 3;
  }
  if (generation == 'X/Y') {
    return 10;
  }
  return 100;
}

export function getPotentialSystemsIds(model) {
  const systems = _.zip(_.take(model.genome, systemCount), [0, 1, 2, 3, 4, 5]);

  return systems
    .filter((s) => s[0] == 1)
    .map((val) => {
      return val[1];
    });
}

export function getTotalChance(model) {
  const systemFailureChance = getSystemFailureChance(model.generation);
  return 1 - Math.pow(1 - systemFailureChance / 100, getPotentialSystemsIds(model).length);
}

export function whatSystemShouldBeInfected(model) {
  const failureChance = getTotalChance(model);

  const chance = helpers.getChanceFromModel(model);

  if (chance.floating({ min: 0, max: 1 }) < failureChance) {
    const candidates = getPotentialSystemsIds(model);
    if (candidates.length == 0) {
      return -1;
    }
    const system = chance.pickone(candidates);
    return system;
  } else {
    return -1;
  }
}
