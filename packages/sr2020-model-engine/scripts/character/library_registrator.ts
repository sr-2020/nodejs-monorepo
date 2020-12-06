// *_library.ts files tend to have a lot of dependencies (as they import all import handler to use their name in
// a safe way). On the other hand, some other files need to depend on *_library.ts files (e.g. to find specific
// ability by id. This file is a poor man's inversion of control container which allow to depend on *_library.ts files
// indirectly.

import { ActiveAbility } from '@alice/sr2020-model-engine/scripts/character/active_abilities_library';

let allActiveAbilities = new Map<string, ActiveAbility>();

export function setAllActiveAbilities(v: Map<string, ActiveAbility>) {
  allActiveAbilities = v;
}

export function getAllActiveAbilities() {
  return allActiveAbilities;
}
