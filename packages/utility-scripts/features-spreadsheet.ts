// Prerequisite: GOOGLE_APPLICATION_CREDENTIALS environment variable should point to the key file for the service account with an access
// to the spreadsheet and Firestore.
// Running:
//   npx ts-node packages/utility-scripts/features-spreadsheet.ts
import { Firestore } from '@google-cloud/firestore';
import * as commandLineArgs from 'command-line-args';
import { getDataFromSpreadsheet } from './spreadsheet_helper';

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
  { name: 'update_db', type: Boolean, defaultValue: false },
  { name: 'row_from', type: Number, defaultValue: 2 },
  { name: 'row_to', type: Number, defaultValue: 600 },
];
const FLAGS = commandLineArgs(optionDefinitions);

const kKindColumn = 0;
const kIdColumn = 5;
const kNameColumn = 6;
const kPlayerDescriptionColumn = 12;
const kMasterDescriptionColumn = 13;
const kCooldownColumn = 16;

interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  originalLine: number;
  gmDescription: string;
}

interface ActiveAbility {
  id: string;
  humanReadableName: string;
  description: string;
  originalLine: number;
  gmDescription: string;
  cooldown: number;
}

interface Spell {
  id: string;
  humanReadableName: string;
  description: string;
  originalLine: number;
  gmDescription: string;
}

const db = new Firestore();

class SpreadsheetProcessor {
  passiveAbilitiesRef = db.collection('passive_abilities');
  activeAbilitiesRef = db.collection('active_abilities');
  spellsRef = db.collection('spells');
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
    const existingDoc = await this.passiveAbilitiesRef.doc(id).get();
    if (
      existingDoc.data()?.name != ability.name ||
      existingDoc.data()?.description != ability.description ||
      existingDoc.data()?.gmDescription != ability.gmDescription
    ) {
      this.passiveAbilities.push(ability);
    }
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
    const existingDoc = await this.activeAbilitiesRef.doc(id).get();
    if (
      existingDoc.data()?.humanReadableName != ability.humanReadableName ||
      existingDoc.data()?.description != ability.description ||
      existingDoc.data()?.gmDescription != ability.gmDescription ||
      existingDoc.data()?.cooldown != ability.cooldown
    ) {
      this.activeAbilities.push(ability);
    }
  }

  async processSpell(line: number, id: string, row: any[]) {
    const spell: Spell = {
      id,
      humanReadableName: row[kNameColumn],
      description: row[kPlayerDescriptionColumn] ?? '',
      gmDescription: row[kMasterDescriptionColumn] ?? '',
      originalLine: line + 1,
    };
    const existingDoc = await this.spellsRef.doc(id).get();
    if (
      existingDoc.data()?.humanReadableName != spell.humanReadableName ||
      existingDoc.data()?.description != spell.description ||
      existingDoc.data()?.gmDescription != spell.gmDescription
    ) {
      this.spells.push(spell);
    }
  }

  async printAndSavePassiveAbilities() {
    console.log('//*************************** Passive abilities ***************************//');
    for (const ability of this.passiveAbilities) {
      console.log(`
      {
        id: '${ability.id}',
        name: '${ability.name}',
        description: '${ability.description.replace(/\n/g, '\\n')}',
        // ${ability.originalLine}
        // ${ability.gmDescription.replace(/\n/g, '\n          // ')}
        // TODO(aeremin): Implement and add modifier here
        modifier: [],
      },`);
      if (FLAGS.update_db) await this.passiveAbilitiesRef.doc(ability.id).set(ability);
    }
  }

  async printAndSaveActiveAbilities() {
    console.log('//*************************** Active abilities ***************************//');
    for (const ability of this.activeAbilities) {
      console.log(`
      {
        id: '${ability.id}',
        humanReadableName: '${ability.humanReadableName}',
        description: '${ability.description.replace(/\n/g, '\\n')}',
        // ${ability.originalLine}
        // ${ability.gmDescription.replace(/\n/g, '\n          // ')}
        // TODO(aeremin): Add proper implementation
        target: 'scan',
        targetsSignature: kNoTarget,
        cooldownMinutes: ${ability.cooldown},
        minimalEssence: 0,
        eventType: dummyAbility.name,
      },`);
      if (FLAGS.update_db) await this.activeAbilitiesRef.doc(ability.id).set(ability);
    }
  }

  async printAndSaveSpells() {
    console.log('//********************************* Spells ********************************//');
    for (const spell of this.spells) {
      console.log(`
      {
        id: '${spell.id}',
        humanReadableName: '${spell.humanReadableName}',
        description: '${spell.description.replace(/\n/g, '\\n')}',
        // ${spell.originalLine}
        // ${spell.gmDescription.replace(/\n/g, '\n          // ')}
        // TODO(aeremin): Add proper implementation
        eventType: dummySpell.name,
      },`);
      if (FLAGS.update_db) await this.spellsRef.doc(spell.id).set(spell);
    }
  }

  async run() {
    // https://docs.google.com/spreadsheets/d/1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A
    const spreadsheetId = '1G-GrHGf-iNp9YDOiPe97EkgY4g7FZbu_YfWO5TS_Q6A';
    const data = await getDataFromSpreadsheet(spreadsheetId, 'Фичи!A1:AE700');

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

    if (!header[kMasterDescriptionColumn].startsWith('Описание МАСТЕРСКОЕ')) {
      throw new Error('Master description column was moved! Exiting.');
    }

    if (!header[kCooldownColumn].startsWith('Кулдаун')) {
      throw new Error('Column column was moved! Exiting.');
    }
    console.log(`[${FLAGS.row_from}, ${FLAGS.row_to})`);
    for (let r = FLAGS.row_from - 1; r < FLAGS.row_to; ++r) {
      const row = data[r];
      if (!row) continue;
      console.log(row);
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
