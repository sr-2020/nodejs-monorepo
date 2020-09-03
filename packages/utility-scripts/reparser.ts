import * as ts from 'typescript';
import * as fs from 'fs';

export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  originalLine: number;
  gmDescription: string;
}

export interface ActiveAbility {
  id: string;
  humanReadableName: string;
  description: string;
  originalLine: number;
  gmDescription: string;
  cooldown: number;
}

export interface Spell {
  id: string;
  humanReadableName: string;
  description: string;
  sphere: string;
  originalLine: number;
  gmDescription: string;
}

const PASSIVE_ABILITIES_FILENAME = './packages/sr2020-model-engine/scripts/character/passive_abilities_library.ts';
const ACTIVE_ABILITIES_FILENAME = './packages/sr2020-model-engine/scripts/character/active_abilities_library.ts';
const SPELLS_FILENAME = './packages/sr2020-model-engine/scripts/character/spells_library.ts';

function readSourceFileWithoutComments(filename: string): ts.SourceFile {
  // Black magic fuckery to remove comments corresponding to gamemaster descriptions, but keep TODOs.
  const contents = fs
    .readFileSync(filename, 'utf8')
    .replace(/ {4}\/\/ TODO\(/gm, '    %% TODO(')
    .replace(/ {4}\/\/.*$\r?\n/gm, '')
    .replace(/ {4}%%/gm, '    //');
  return ts.createSourceFile('input.ts', contents, ts.ScriptTarget.Latest, true);
}

function writeSourceFile(file: ts.SourceFile, filename: string) {
  const printer = ts.createPrinter({
    removeComments: false,
  });
  fs.writeFileSync(filename, unescape(printer.printFile(file).replace(/\\u/g, '%u')), {
    encoding: 'utf8',
  });
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

export function rewritePassiveAbilities(abilities: PassiveAbility[]) {
  const file = readSourceFileWithoutComments(PASSIVE_ABILITIES_FILENAME);

  const transformer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
    let currentAbility: PassiveAbility | undefined = undefined;
    const abilityVisit = (node: ts.Node): ts.Node => {
      if (ts.isArrayLiteralExpression(node)) {
        const existingAbilities = ts.visitEachChild(node, abilityVisit, context);
        const elements: ts.Expression[] = [...existingAbilities.elements];
        for (const ability of abilities) {
          const prereqsAssignment = ts.createPropertyAssignment(ts.createIdentifier('prerequisites'), ts.createArrayLiteral([]));
          const element = ts.createObjectLiteral(
            [
              ts.createPropertyAssignment(ts.createIdentifier('id'), ts.createStringLiteral(ability.id)),
              ts.createPropertyAssignment(ts.createIdentifier('name'), ts.createStringLiteral(ability.name)),
              ts.createPropertyAssignment(ts.createIdentifier('description'), ts.createStringLiteral(ability.description)),
              prereqsAssignment,
              ts.createPropertyAssignment(ts.createIdentifier('modifier'), ts.createArrayLiteral([])),
            ],
            true,
          );
          addComment(prereqsAssignment, 'TODO(aeremin): Implement and add modifier here');
          addComment(prereqsAssignment, ability.gmDescription);
          elements.push(element);
        }
        return ts.createArrayLiteral(elements);
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

        if (currentAbility) {
          if (propertyName == 'name') {
            return ts.createPropertyAssignment('name', ts.createStringLiteral(currentAbility.name));
          }
          if (propertyName == 'description') {
            return ts.createPropertyAssignment('description', ts.createStringLiteral(currentAbility.description));
          }
          if (propertyName == 'prerequisites') {
            addComment(node, currentAbility.gmDescription);
            return node;
          }
        }
        if (propertyName == 'modifier' || propertyName == 'prerequisites') {
          return node;
        }
      }
      return ts.visitEachChild(node, abilityVisit, context);
    };

    const topLevelVisit = (node: ts.Node): ts.Node => {
      if (ts.isVariableDeclaration(node) && getName(node) == 'kAllPassiveAbilitiesList') {
        const result = ts.visitEachChild(node, abilityVisit, context);
        return result;
      } else {
        return ts.visitEachChild(node, topLevelVisit, context);
      }
    };

    return ts.visitNode(rootNode, topLevelVisit);
  };
  writeSourceFile(ts.transform(file, [transformer]).transformed[0], PASSIVE_ABILITIES_FILENAME);
}

export function rewriteActiveAbilities(abilities: ActiveAbility[]) {
  const file = readSourceFileWithoutComments(ACTIVE_ABILITIES_FILENAME);

  const transformer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
    let currentAbility: ActiveAbility | undefined = undefined;
    const abilityVisit = (node: ts.Node): ts.Node => {
      if (ts.isArrayLiteralExpression(node)) {
        const existingAbilities = ts.visitEachChild(node, abilityVisit, context);
        const elements: ts.Expression[] = [...existingAbilities.elements];
        for (const ability of abilities) {
          const targetAssignment = ts.createPropertyAssignment(ts.createIdentifier('target'), ts.createStringLiteral('scan'));
          const element = ts.createObjectLiteral(
            [
              ts.createPropertyAssignment(ts.createIdentifier('id'), ts.createStringLiteral(ability.id)),
              ts.createPropertyAssignment(ts.createIdentifier('humanReadableName'), ts.createStringLiteral(ability.humanReadableName)),
              ts.createPropertyAssignment(ts.createIdentifier('description'), ts.createStringLiteral(ability.description)),
              targetAssignment,
              ts.createPropertyAssignment(ts.createIdentifier('targetsSignature'), ts.createIdentifier('kNoTarget')),
              ts.createPropertyAssignment(ts.createIdentifier('cooldownMinutes'), ts.createNumericLiteral(ability.cooldown)),
              ts.createPropertyAssignment(ts.createIdentifier('minimalEssence'), ts.createNumericLiteral(0)),
              ts.createPropertyAssignment(
                ts.createIdentifier('eventType'),
                ts.createPropertyAccess(ts.createIdentifier('dummyAbility'), ts.createIdentifier('name')),
              ),
            ],
            true,
          );

          addComment(targetAssignment, 'TODO(aeremin): Add proper implementation');
          addComment(targetAssignment, ability.gmDescription);
          elements.push(element);
        }
        return ts.createArrayLiteral(elements);
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

        if (currentAbility) {
          if (propertyName == 'humanReadableName') {
            return ts.createPropertyAssignment('humanReadableName', ts.createStringLiteral(currentAbility.humanReadableName));
          }
          if (propertyName == 'description') {
            return ts.createPropertyAssignment('description', ts.createStringLiteral(currentAbility.description));
          }
          if (propertyName == 'target') {
            addComment(node, currentAbility.gmDescription);
            return node;
          }
        }
        if (
          propertyName == 'target' ||
          propertyName == 'targetsSignature' ||
          propertyName == 'prerequisites' ||
          propertyName == 'minimalEssence' ||
          propertyName == 'eventType' ||
          propertyName == 'cooldownMinutes'
        ) {
          return node;
        }
      }
      return ts.visitEachChild(node, abilityVisit, context);
    };

    const topLevelVisit = (node: ts.Node): ts.Node => {
      if (ts.isVariableDeclaration(node) && getName(node) == 'kAllActiveAbilitiesList') {
        const result = ts.visitEachChild(node, abilityVisit, context);
        return result;
      } else {
        return ts.visitEachChild(node, topLevelVisit, context);
      }
    };

    return ts.visitNode(rootNode, topLevelVisit);
  };

  writeSourceFile(ts.transform(file, [transformer]).transformed[0], ACTIVE_ABILITIES_FILENAME);
}

export function rewriteSpells(abilities: Spell[]) {
  const file = readSourceFileWithoutComments(SPELLS_FILENAME);

  const transformer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
    let currentAbility: Spell | undefined = undefined;
    const abilityVisit = (node: ts.Node): ts.Node => {
      if (ts.isArrayLiteralExpression(node)) {
        const existingAbilities = ts.visitEachChild(node, abilityVisit, context);
        const elements: ts.Expression[] = [...existingAbilities.elements];
        for (const ability of abilities) {
          const sphereAssignment = ts.createPropertyAssignment(ts.createIdentifier('sphere'), ts.createStringLiteral(ability.sphere));
          const element = ts.createObjectLiteral(
            [
              ts.createPropertyAssignment(ts.createIdentifier('id'), ts.createStringLiteral(ability.id)),
              ts.createPropertyAssignment(ts.createIdentifier('humanReadableName'), ts.createStringLiteral(ability.humanReadableName)),
              ts.createPropertyAssignment(ts.createIdentifier('description'), ts.createStringLiteral(ability.description)),
              sphereAssignment,
              ts.createPropertyAssignment(
                ts.createIdentifier('eventType'),
                ts.createPropertyAccess(ts.createIdentifier('dummySpell'), ts.createIdentifier('name')),
              ),
              ts.createPropertyAssignment(ts.createIdentifier('hasTarget'), ts.createFalse()),
            ],
            true,
          );
          addComment(sphereAssignment, 'TODO(aeremin): Add proper implementation');
          addComment(sphereAssignment, ability.gmDescription);
          elements.push(element);
        }
        return ts.createArrayLiteral(elements);
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

        if (currentAbility) {
          if (propertyName == 'humanReadableName') {
            return ts.createPropertyAssignment('humanReadableName', ts.createStringLiteral(currentAbility.humanReadableName));
          }
          if (propertyName == 'description') {
            return ts.createPropertyAssignment('description', ts.createStringLiteral(currentAbility.description));
          }
          if (propertyName == 'sphere') {
            addComment(node, currentAbility.gmDescription);
            return node;
          }
        }
        if (propertyName == 'eventType' || propertyName == 'hasTarget') {
          return node;
        }
      }
      return ts.visitEachChild(node, abilityVisit, context);
    };

    const topLevelVisit = (node: ts.Node): ts.Node => {
      if (ts.isVariableDeclaration(node) && getName(node) == 'kAllSpellsList') {
        const result = ts.visitEachChild(node, abilityVisit, context);
        return result;
      } else {
        return ts.visitEachChild(node, topLevelVisit, context);
      }
    };

    return ts.visitNode(rootNode, topLevelVisit);
  };

  writeSourceFile(ts.transform(file, [transformer]).transformed[0], SPELLS_FILENAME);
}
