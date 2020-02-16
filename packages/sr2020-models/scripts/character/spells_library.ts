import {
  increaseResonanceSpell,
  densityHalveSpell,
  fullHealSpell,
  lightHealSpell,
  groundHealSpell,
  fireballSpell,
  fieldOfDenialSpell,
  liveLongAndProsperSpell,
  trackpointSpell,
} from './spells';

export interface Spell {
  id: string;
  humanReadableName: string;
  description: string;
  prerequisites?: string[];
  eventType: string;
}

// Not exported by design, use kAllSpells instead.
const kAllSpellsList: Spell[] = [
  {
    id: 'dummy-spell',
    humanReadableName: 'Заглушка',
    description: 'Спелл-заглушка.',
    eventType: increaseResonanceSpell.name,
  },
  {
    id: 'dummy-halve-density',
    humanReadableName: 'Плотность пополам!',
    description: 'Уменьшает плотность маны в локации вдвое. Может быть наложен на артефакт.',
    eventType: densityHalveSpell.name,
  },
  {
    id: 'dummy-full-heal',
    humanReadableName: 'Исцеление',
    description: 'Восстанавливает все хиты.',
    eventType: fullHealSpell.name,
  },
  {
    id: 'dummy-light-heal',
    humanReadableName: 'Light Heal',
    description: 'Восстанавливает текущие хиты.',
    eventType: lightHealSpell.name,
  },
  {
    id: 'ground-heal',
    humanReadableName: 'Ground Heal',
    description: 'Дает временную одноразовую способность поднять одну цель из КС/тяжрана в полные хиты',
    eventType: groundHealSpell.name,
  },
  {
    id: 'fireball',
    humanReadableName: 'Fireball',
    description: 'Дает временную возможность кинуть несколько огненных шаров',
    eventType: fireballSpell.name,
  },
  {
    id: 'field-of-denial',
    humanReadableName: 'Field of denial',
    description: 'Дает частичную защиту от тяжелого оружия',
    eventType: fieldOfDenialSpell.name,
  },
  {
    id: 'live-long-and-prosper',
    humanReadableName: 'Live long and prosper',
    description: 'Увеличивает текущие и максимальные хиты',
    eventType: liveLongAndProsperSpell.name,
  },
  {
    id: 'trackpoint',
    humanReadableName: 'Trackpoint',
    description: 'Получает информацию о скастванных в локации заклинаниях',
    eventType: trackpointSpell.name,
  },
];

export const kAllSpells: Map<string, Spell> = (() => {
  const result = new Map<string, Spell>();
  kAllSpellsList.forEach((f) => {
    if (result.has(f.id)) throw new Error('Non-unique passive ability id: ' + f.id);
    result.set(f.id, f);
  });
  return result;
})();
