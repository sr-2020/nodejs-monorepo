import { MetaRace, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';

export function isHmhvv(model: Sr2020Character) {
  const hmhvvRaces: MetaRace[] = ['meta-vampire', 'meta-ghoul'];
  return hmhvvRaces.includes(model.metarace);
}
