import { AURA_LENGTH } from './consts';
import Chance = require('chance');
const chance = new Chance();

const kUnknowAuraCharacter = '*';

export function generateAuraSubset(fullAura: string, percentage: number): string {
  const symbolsRead = Math.min(AURA_LENGTH, Math.floor((AURA_LENGTH * percentage) / 100));
  const positions = Array.from(Array(AURA_LENGTH).keys());
  const picked = chance.pickset(positions, symbolsRead);
  return positions.map((i) => (picked.includes(i) ? fullAura[i] : kUnknowAuraCharacter)).join('');
}

export function splitAuraByDashes(aura: string): string {
  return aura.substr(0, 4) + '-' + aura.substr(4, 4) + '-' + aura.substr(8, 4) + '-' + aura.substr(12, 4) + '-' + aura.substr(16, 4);
}
