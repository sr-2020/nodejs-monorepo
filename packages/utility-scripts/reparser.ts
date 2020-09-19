import * as ts from 'typescript';
import * as fs from 'fs';
import * as prettier from 'prettier';

export interface PassiveAbility {
  id: string;
  humanReadableName: string;
  description: string;
  gmDescription: string;
  karmaCost: number;
}

export interface ActiveAbility {
  id: string;
  humanReadableName: string;
  description: string;
  gmDescription: string;
  cooldown: number;
  karmaCost: number;
}

export interface Spell {
  id: string;
  humanReadableName: string;
  description: string;
  sphere: string;
  gmDescription: string;
  karmaCost: number;
}

const PASSIVE_ABILITIES_FILENAME = './packages/sr2020-model-engine/scripts/character/passive_abilities_library.ts';
const ACTIVE_ABILITIES_FILENAME = './packages/sr2020-model-engine/scripts/character/active_abilities_library.ts';
const SPELLS_FILENAME = './packages/sr2020-model-engine/scripts/character/spells_library.ts';

function readSourceFileWithoutComments(filename: string): ts.SourceFile {
  // Black magic fuckery to remove comments corresponding to gamemaster descriptions, but keep TODOs.
  const contents = fs
    .readFileSync(filename, 'utf8')
    .replace(/ {2}\/\/ TODO\(/gm, '  %% TODO(')
    .replace(/ {2}\/\/.*$\r?\n/gm, '')
    .replace(/ {2}%%/gm, '  //');
  return ts.createSourceFile('input.ts', contents, ts.ScriptTarget.Latest, true);
}

function writeSourceFile(file: ts.SourceFile, filename: string) {
  const printer = ts.createPrinter({
    removeComments: false,
    newLine: ts.NewLineKind.CarriageReturnLineFeed,
  });

  fs.writeFileSync(
    filename,
    prettier.format(unescape(printer.printFile(file).replace(/\\u/g, '%u')), {
      ...prettier.resolveConfig.sync(filename),
      parser: 'typescript',
    }),
    {
      encoding: 'utf8',
    },
  );
}

function getName(node: ts.VariableDeclaration | ts.ObjectLiteralElementLike): string {
  if (node.name && ts.isIdentifier(node.name)) {
    return node.name.escapedText as string;
  } else {
    throw new Error('Trying to get a name of non-named entity');
  }
}

function addComment(node: ts.Node, comment: string) {
  for (const line of comment.split('\n')) {
    ts.addSyntheticLeadingComment(node, ts.SyntaxKind.SingleLineCommentTrivia, ` ${line}`, true);
  }
}

type AnyAbility = PassiveAbility | ActiveAbility | Spell;

function createTransformer<T extends AnyAbility>(
  listName: string,
  abilities: T[],
  abilityToObjectLiteral: (ability: T) => ts.ObjectLiteralExpression,
  abilityPropertyToLiteral: (ability: T, propertyName: string) => ts.LiteralExpression,
  spreadsheetProperties: string[],
) {
  return (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
    let currentAbility: T | undefined = undefined;

    const abilityVisit = (node: ts.Node): ts.Node => {
      if (ts.isArrayLiteralExpression(node)) {
        const existingAbilities = ts.visitEachChild(node, abilityVisit, context);
        const elements: ts.Expression[] = [...existingAbilities.elements];
        for (const ability of abilities) {
          const element = abilityToObjectLiteral(ability);
          addComment(element, ability.gmDescription);
          elements.push(element);
        }
        return ts.createArrayLiteral(elements);
      }

      if (ts.isObjectLiteralExpression(node)) {
        const result = ts.visitEachChild(node, abilityVisit, context);
        if (currentAbility) addComment(result, currentAbility.gmDescription);
        return result;
      }

      if (ts.isPropertyAssignment(node)) {
        const propertyName = (node.name as ts.Identifier).text;
        if (propertyName == 'id') {
          const currentAbilityId = (node.initializer as ts.StringLiteral).text;
          currentAbility = abilities.find((it) => it.id == currentAbilityId);
          if (!currentAbility) {
            console.log(`No data for ${currentAbilityId} in the spreadsheet`);
          } else {
            abilities = abilities.filter((it) => it.id != currentAbilityId);
          }
        }

        if (currentAbility && spreadsheetProperties.includes(propertyName)) {
          return ts.createPropertyAssignment(propertyName, abilityPropertyToLiteral(currentAbility, propertyName));
        }
        return node;
      }
      return ts.visitEachChild(node, abilityVisit, context);
    };

    const topLevelVisit = (node: ts.Node): ts.Node => {
      if (ts.isVariableDeclaration(node) && getName(node) == listName) {
        const result = ts.visitEachChild(node, abilityVisit, context);
        return result;
      } else {
        return ts.visitEachChild(node, topLevelVisit, context);
      }
    };

    return ts.visitNode(rootNode, topLevelVisit);
  };
}

export function rewritePassiveAbilities(abilities: PassiveAbility[]) {
  const file = readSourceFileWithoutComments(PASSIVE_ABILITIES_FILENAME);

  const transformer = createTransformer(
    'kAllPassiveAbilitiesList',
    abilities,
    (ability) => {
      const element = ts.createObjectLiteral(
        [
          ts.createPropertyAssignment(ts.createIdentifier('id'), ts.createStringLiteral(ability.id)),
          ts.createPropertyAssignment(ts.createIdentifier('humanReadableName'), ts.createStringLiteral(ability.humanReadableName)),
          ts.createPropertyAssignment(ts.createIdentifier('description'), ts.createStringLiteral(ability.description)),
          ts.createPropertyAssignment(ts.createIdentifier('karmaCost'), ts.createNumericLiteral(ability.karmaCost)),
          ts.createPropertyAssignment(ts.createIdentifier('prerequisites'), ts.createArrayLiteral([])),
          ts.createPropertyAssignment(ts.createIdentifier('modifier'), ts.createArrayLiteral([])),
        ],
        true,
      );
      addComment(element, 'TODO(aeremin): Implement and add modifier here');
      return element;
    },
    (ability, propertyName) => {
      if (propertyName == 'name') {
        return ts.createStringLiteral(ability.humanReadableName);
      }
      if (propertyName == 'description') {
        return ts.createStringLiteral(ability.description);
      }
      if (propertyName == 'karmaCost') {
        return ts.createNumericLiteral(ability.karmaCost);
      }
      throw new Error(`Unexpected property name: ${propertyName}`);
    },
    ['name', 'description', 'karmaCost'],
  );
  writeSourceFile(ts.transform(file, [transformer]).transformed[0], PASSIVE_ABILITIES_FILENAME);
}

export function rewriteActiveAbilities(abilities: ActiveAbility[]) {
  const file = readSourceFileWithoutComments(ACTIVE_ABILITIES_FILENAME);

  const transformer = createTransformer(
    'kAllActiveAbilitiesList',
    abilities,
    (ability) => {
      const element = ts.createObjectLiteral(
        [
          ts.createPropertyAssignment(ts.createIdentifier('id'), ts.createStringLiteral(ability.id)),
          ts.createPropertyAssignment(ts.createIdentifier('humanReadableName'), ts.createStringLiteral(ability.humanReadableName)),
          ts.createPropertyAssignment(ts.createIdentifier('description'), ts.createStringLiteral(ability.description)),
          ts.createPropertyAssignment(ts.createIdentifier('target'), ts.createStringLiteral('scan')),
          ts.createPropertyAssignment(ts.createIdentifier('targetsSignature'), ts.createIdentifier('kNoTarget')),
          ts.createPropertyAssignment(ts.createIdentifier('cooldownMinutes'), ts.createNumericLiteral(ability.cooldown)),
          ts.createPropertyAssignment(ts.createIdentifier('prerequisites'), ts.createArrayLiteral([])),
          ts.createPropertyAssignment(ts.createIdentifier('karmaCost'), ts.createNumericLiteral(ability.karmaCost)),
          ts.createPropertyAssignment(ts.createIdentifier('minimalEssence'), ts.createNumericLiteral(0)),
          ts.createPropertyAssignment(
            ts.createIdentifier('eventType'),
            ts.createPropertyAccess(ts.createIdentifier('dummyAbility'), ts.createIdentifier('name')),
          ),
        ],
        true,
      );
      addComment(element, 'TODO(aeremin): Add proper implementation');
      return element;
    },
    (ability, propertyName) => {
      if (propertyName == 'humanReadableName') {
        return ts.createStringLiteral(ability.humanReadableName);
      }
      if (propertyName == 'description') {
        return ts.createStringLiteral(ability.description);
      }
      if (propertyName == 'karmaCost') {
        return ts.createNumericLiteral(ability.karmaCost);
      }
      throw new Error(`Unexpected property name: ${propertyName}`);
    },
    ['humanReadableName', 'description', 'karmaCost'],
  );

  writeSourceFile(ts.transform(file, [transformer]).transformed[0], ACTIVE_ABILITIES_FILENAME);
}

export function rewriteSpells(abilities: Spell[]) {
  const file = readSourceFileWithoutComments(SPELLS_FILENAME);

  const transformer = createTransformer(
    'kAllSpellsList',
    abilities,
    (ability) => {
      const element = ts.createObjectLiteral(
        [
          ts.createPropertyAssignment(ts.createIdentifier('id'), ts.createStringLiteral(ability.id)),
          ts.createPropertyAssignment(ts.createIdentifier('humanReadableName'), ts.createStringLiteral(ability.humanReadableName)),
          ts.createPropertyAssignment(ts.createIdentifier('description'), ts.createStringLiteral(ability.description)),
          ts.createPropertyAssignment(ts.createIdentifier('prerequisites'), ts.createArrayLiteral([])),
          ts.createPropertyAssignment(ts.createIdentifier('karmaCost'), ts.createNumericLiteral(ability.karmaCost)),
          ts.createPropertyAssignment(ts.createIdentifier('sphere'), ts.createStringLiteral(ability.sphere)),
          ts.createPropertyAssignment(
            ts.createIdentifier('eventType'),
            ts.createPropertyAccess(ts.createIdentifier('dummySpell'), ts.createIdentifier('name')),
          ),
          ts.createPropertyAssignment(ts.createIdentifier('hasTarget'), ts.createFalse()),
        ],
        true,
      );
      addComment(element, 'TODO(aeremin): Add proper implementation');
      return element;
    },
    (ability, propertyName) => {
      if (propertyName == 'humanReadableName') {
        return ts.createStringLiteral(ability.humanReadableName);
      }
      if (propertyName == 'description') {
        return ts.createStringLiteral(ability.description);
      }
      if (propertyName == 'karmaCost') {
        return ts.createNumericLiteral(ability.karmaCost);
      }
      if (propertyName == 'sphere') {
        return ts.createStringLiteral(ability.sphere);
      }
      throw new Error(`Unexpected property name: ${propertyName}`);
    },
    ['humanReadableName', 'description', 'karmaCost', 'sphere'],
  );

  writeSourceFile(ts.transform(file, [transformer]).transformed[0], SPELLS_FILENAME);
}
