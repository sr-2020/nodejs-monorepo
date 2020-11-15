// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node packages/utility-scripts/features-spreadsheet.ts
import * as commandLineArgs from 'command-line-args';
import { getDataFromSpreadsheet } from './spreadsheet_helper';
import { ActiveAbility, PassiveAbility, rewriteActiveAbilities, rewritePassiveAbilities, rewriteSpells, Spell } from './reparser';
import { FeatureAvailability, PackInfo, SpellSphere } from '@sr2020/sr2020-common/models/sr2020-character.model';

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
  { name: 'update_db', type: Boolean, defaultValue: false },
  { name: 'row_from', type: Number, defaultValue: 2 },
  { name: 'row_to', type: Number, defaultValue: 800 },
];
const FLAGS = commandLineArgs(optionDefinitions);

const kKindColumn = 0;
const kNameColumn = 4;
const kIdColumn = 5;
const kPrerequisitesColumn = 6;
const kPackIdColumn = 7;
const kPackLevelColumn = 8;
const kPlayerDescriptionColumn = 12;
const kMasterDescriptionColumn = 13;
const kCooldownColumn = 16;
const kSpellSphereColumn = 18;
const kKarmaCostColumn = 9;
const kAvailabilityColumn = 10;

class SpreadsheetProcessor {
  passiveAbilities: PassiveAbility[] = [];
  activeAbilities: ActiveAbility[] = [];
  spells: Spell[] = [];

  parseKarmaCost(id: string, input: string | undefined): number {
    if (!input) return 0;
    const result = Number(input);
    if (isNaN(result)) {
      console.log(`Unexpected karma cost for ${id}: ${input}`);
      return 0;
    }
    return result;
  }

  parseCooldown(id: string, input: string | undefined): number {
    if (!input || !/^\d+$/.test(input)) {
      console.error(`Ability ${id} cooldown is non-numeric, setting to 9000.`);
      return 9000;
    }
    return Number(input);
  }

  parseAvailability(id: string, input: string | undefined): FeatureAvailability {
    if (!input) return 'master';
    input = input.toLowerCase();
    const result: FeatureAvailability | undefined = {
      открытая: 'open',
      закрытая: 'closed',
      мастерская: 'master',
    }[input];
    if (!result) {
      console.error(`Unexpected availability value for ${id}: ${input}`);
      return 'master';
    }
    return result;
  }

  parsePrerequisites(id: string, input: string | undefined): string[] {
    if (!input || input.trim() == 'null') return [];
    return input
      .split('\n')
      .map((s) => s.trim())
      .map((s) => s.replace('НЕТ ', '!'));
  }

  parsePack(id: string, input1: string | undefined, input2: string | undefined): PackInfo | undefined {
    if (input1?.includes('\n') || input2?.includes('\n')) {
      console.error(`Unexpected new line in packet info for ${id}`);
    }

    if (!input1 && !input2) {
      return undefined;
    }

    if (input1 == 'null' && (input2 == 'null' || !input2)) {
      return undefined;
    }

    if (input1 && input2) {
      return {
        id: input1,
        level: Number(input2),
      };
    }

    console.error(`Feature ${id} has partial pack data`);
    return undefined;
  }

  async processPassiveAbility(line: number, id: string, row: any[]) {
    const ability: PassiveAbility = {
      id,
      humanReadableName: row[kNameColumn],
      description: row[kPlayerDescriptionColumn] ?? '',
      gmDescription: row[kMasterDescriptionColumn] ?? '',
      karmaCost: this.parseKarmaCost(id, row[kKarmaCostColumn]),
      prerequisites: this.parsePrerequisites(id, row[kPrerequisitesColumn]),
      pack: this.parsePack(id, row[kPackIdColumn], row[kPackLevelColumn]),
      availability: this.parseAvailability(id, row[kAvailabilityColumn]),
    };
    this.passiveAbilities.push(ability);
  }

  async processActiveAbility(line: number, id: string, row: any[]) {
    const ability: ActiveAbility = {
      id,
      humanReadableName: row[kNameColumn],
      description: row[kPlayerDescriptionColumn] ?? '',
      gmDescription: row[kMasterDescriptionColumn] ?? '',
      cooldown: this.parseCooldown(id, row[kCooldownColumn]),
      karmaCost: this.parseKarmaCost(id, row[kKarmaCostColumn]),
      prerequisites: this.parsePrerequisites(id, row[kPrerequisitesColumn]),
      pack: this.parsePack(id, row[kPackIdColumn], row[kPackLevelColumn]),
      availability: this.parseAvailability(id, row[kAvailabilityColumn]),
    };
    this.activeAbilities.push(ability);
  }

  spellSphereToEnum(sphere: string): SpellSphere {
    if (sphere == 'Защита') return 'protection';
    if (sphere == 'Лечение') return 'healing';
    if (sphere == 'Боевая') return 'fighting';
    if (sphere == 'Анализ астрала') return 'astral';
    if (sphere == 'Анализ ауры') return 'aura';
    if (sphere == 'Влияние на характеристики') return 'stats';
    throw new Error(`Unsupported spell sphere: ${sphere}`);
  }

  async processSpell(line: number, id: string, row: any[]) {
    const spell: Spell = {
      id,
      humanReadableName: row[kNameColumn],
      description: row[kPlayerDescriptionColumn] ?? '',
      gmDescription: row[kMasterDescriptionColumn] ?? '',
      sphere: this.spellSphereToEnum(row[kSpellSphereColumn]),
      karmaCost: this.parseKarmaCost(id, row[kKarmaCostColumn]),
      prerequisites: this.parsePrerequisites(id, row[kPrerequisitesColumn]),
      pack: this.parsePack(id, row[kPackIdColumn], row[kPackLevelColumn]),
      availability: this.parseAvailability(id, row[kAvailabilityColumn]),
    };
    this.spells.push(spell);
  }

  async printAndSavePassiveAbilities() {
    console.log('//*************************** Passive abilities ***************************//');
    rewritePassiveAbilities(this.passiveAbilities);
  }

  async printAndSaveActiveAbilities() {
    console.log('//*************************** Active abilities ***************************//');
    rewriteActiveAbilities(this.activeAbilities);
  }

  async printAndSaveSpells() {
    console.log('//********************************* Spells ********************************//');
    rewriteSpells(this.spells);
  }

  async run() {
    // https://docs.google.com/spreadsheets/d/1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A
    const spreadsheetId = '1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A';
    const data = await getDataFromSpreadsheet(spreadsheetId, 'Фичи!A1:AE800');

    const header = data[0];
    if (!header[kKindColumn].startsWith('Сущность')) {
      throw new Error('Kind column was moved! Exiting.');
    }

    if (header[kIdColumn] != 'Feature_ID') {
      throw new Error('Id column was moved! Exiting.');
    }

    if (header[kPrerequisitesColumn] != 'Prerequisites') {
      throw new Error('Prerequisites column was moved! Exiting.');
    }

    if (header[kPackIdColumn] != 'Pack_ID') {
      throw new Error('Pack_ID column was moved! Exiting.');
    }

    if (header[kPackLevelColumn] != 'Stars') {
      throw new Error('Stars column was moved! Exiting.');
    }

    if (header[kNameColumn] != 'Название') {
      throw new Error('Name column was moved! Exiting.');
    }

    if (!header[kPlayerDescriptionColumn].startsWith('Описание игроцкое')) {
      throw new Error('Player description column was moved! Exiting.');
    }

    if (!header[kMasterDescriptionColumn].startsWith('Описание мастерское')) {
      throw new Error('Master description column was moved! Exiting.');
    }

    if (!header[kCooldownColumn].startsWith('Кулдаун')) {
      throw new Error('Cooldown column was moved! Exiting.');
    }

    if (!header[kSpellSphereColumn].startsWith('Сфера спелла')) {
      throw new Error('Spell sphere column was moved! Exiting.');
    }

    if (!header[kKarmaCostColumn].startsWith('Karma')) {
      throw new Error('Karma cost column was moved! Exiting.');
    }

    if (!header[kAvailabilityColumn].startsWith('Доступность')) {
      throw new Error('Availability column was moved! Exiting.');
    }

    for (let r = FLAGS.row_from - 1; r < FLAGS.row_to; ++r) {
      const row = data[r];
      if (!row) continue;
      const id = row[kIdColumn];
      const kind = row[kKindColumn];

      if (kind == 'Пассивная абилка' || kind == 'Аспект') {
        if (!id) throw new Error(`Entity in the line ${r + 1} has no ID`);
        await this.processPassiveAbility(r, id, row);
      }

      if (kind == 'Активная абилка') {
        if (!id) throw new Error(`Entity in the line ${r + 1} has no ID`);
        await this.processActiveAbility(r, id, row);
      }

      if (kind == 'Заклинание') {
        if (!id) throw new Error(`Entity in the line ${r + 1} has no ID`);
        await this.processSpell(r, id, row);
      }
    }
    await this.printAndSavePassiveAbilities();
    await this.printAndSaveActiveAbilities();
    await this.printAndSaveSpells();
  }
}

new SpreadsheetProcessor().run().then(
  () => console.log('Finished OK'),
  (e) => console.log(`Finished with error: ${e}`),
);
