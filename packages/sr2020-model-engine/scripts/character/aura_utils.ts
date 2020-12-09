import { AURA_LENGTH } from './consts';
import * as Chance from 'chance';

const chance = new Chance();

export const kUnknowAuraCharacter = '*';

function getAllAuraPositions(): number[] {
  return Array.from(Array(AURA_LENGTH).keys());
}

function getRandomAuraPositions(percentage: number): number[] {
  const symbolsRead = Math.min(AURA_LENGTH, Math.floor((AURA_LENGTH * percentage) / 100));
  return chance.pickset(getAllAuraPositions(), symbolsRead);
}

export function generateAuraSubset(fullAura: string, percentage: number): string {
  const picked = getRandomAuraPositions(percentage);
  return getAllAuraPositions()
    .map((i) => (picked.includes(i) ? fullAura[i] : kUnknowAuraCharacter))
    .join('');
}

export function generateRandomAuraMask(percentage: number): string {
  const picked = getRandomAuraPositions(percentage);
  return getAllAuraPositions()
    .map((i) => (picked.includes(i) ? chance.character({ pool: 'abcdefghijklmnopqrstuvwxyz' }) : kUnknowAuraCharacter))
    .join('');
}

export function splitAuraByDashes(aura: string): string {
  return aura.substr(0, 4) + '-' + aura.substr(4, 4) + '-' + aura.substr(8, 4) + '-' + aura.substr(12, 4) + '-' + aura.substr(16, 4);
}
