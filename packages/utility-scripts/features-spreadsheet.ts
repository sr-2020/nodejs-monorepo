// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node packages/utility-scripts/features-spreadsheet.ts
import * as commandLineArgs from 'command-line-args';
import { getDataFromSpreadsheet } from './spreadsheet_helper';
import { ActiveAbility, PassiveAbility, rewriteActiveAbilities, rewritePassiveAbilities, rewriteSpells, Spell } from './reparser';
import { SpellSphere } from '@sr2020/sr2020-model-engine/scripts/character/spells_library';

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
  { name: 'update_db', type: Boolean, defaultValue: false },
  { name: 'row_from', type: Number, defaultValue: 2 },
  { name: 'row_to', type: Number, defaultValue: 800 },
];
const FLAGS = commandLineArgs(optionDefinitions);

const kKindColumn = 0;
const kIdColumn = 4;
const kNameColumn = 5;
const kPlayerDescriptionColumn = 11;
const kMasterDescriptionColumn = 12;
const kCooldownColumn = 15;
const kSpellSphereColumn = 17;

class SpreadsheetProcessor {
  passiveAbilities: PassiveAbility[] = [];
  activeAbilities: ActiveAbility[] = [];
  spells: Spell[] = [];

  async processPassiveAbility(line: number, id: string, row: any[]) {
    const ability: PassiveAbility = {
      id,
      name: row[kNameColumn],
      description: row[kPlayerDescriptionColumn] ?? '',
      gmDescription: row[kMasterDescriptionColumn] ?? '',
      originalLine: line + 1,
    };
    this.passiveAbilities.push(ability);
  }

  async processActiveAbility(line: number, id: string, row: any[]) {
    const ability: ActiveAbility = {
      id,
      humanReadableName: row[kNameColumn],
      description: row[kPlayerDescriptionColumn] ?? '',
      gmDescription: row[kMasterDescriptionColumn] ?? '',
      cooldown: row[kCooldownColumn] ?? 9000,
      originalLine: line + 1,
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
      originalLine: line + 1,
      sphere: this.spellSphereToEnum(row[kSpellSphereColumn]),
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

    if (header[kIdColumn] != 'ID (техническое ID)') {
      throw new Error('Id column was moved! Exiting.');
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
    for (let r = FLAGS.row_from - 1; r < FLAGS.row_to; ++r) {
      const row = data[r];
      if (!row) continue;
      const id = row[kIdColumn];
      const kind = row[kKindColumn];

      if (kind == 'Пассивная абилка') {
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
