import * as ts from 'typescript';
import * as fs from 'fs';

export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  originalLine: number;
  gmDescription: string;
}

const PASSIVE_ABILITIES_FILENAME = './packages/sr2020-model-engine/scripts/character/passive_abilities_library.ts';

function readSourceFileWithoutComments(): ts.SourceFile {
  // Black magic fuckery to remove comments corresponding to gamemaster descriptions, but keep TODOs.
  const contents = fs
    .readFileSync(PASSIVE_ABILITIES_FILENAME, 'utf8')
    .replace(/ {4}\/\/ TODO\(/gm, '    %% TODO(')
    .replace(/ {4}\/\/.*$\r?\n/gm, '')
    .replace(/ {4}%%/gm, '    //');
  return ts.createSourceFile('input.ts', contents, ts.ScriptTarget.Latest, true);
}

function writeSourceFile(file: ts.SourceFile) {
  const printer = ts.createPrinter({
    removeComments: false,
  });
  fs.writeFileSync(PASSIVE_ABILITIES_FILENAME, unescape(printer.printFile(file).replace(/\\u/g, '%u')), {
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

export function rewritePassiveAbilities(abilities: PassiveAbility[]) {
  const file = readSourceFileWithoutComments();

  const transformer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile): ts.SourceFile => {
    let currentAbility: PassiveAbility | undefined = undefined;
    const abilityVisit = (node: ts.Node): ts.Node => {
      if (ts.isPropertyAssignment(node)) {
        const propertyName = (node.name as ts.Identifier).text;
        if (propertyName == 'id') {
          const currentAbilityId = (node.initializer as ts.StringLiteral).text;
          currentAbility = abilities.find((it) => it.id == currentAbilityId);
          if (!currentAbility) {
            console.log(`No data for ${currentAbilityId} in the spreadsheet`);
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
            for (const line of currentAbility.gmDescription.split('\n')) {
              ts.addSyntheticLeadingComment(node, ts.SyntaxKind.SingleLineCommentTrivia, ` ${line}`, true);
            }
            return node;
          }
        }
      }
      return ts.visitEachChild(node, abilityVisit, context);
    };

    const topLevelVisit = (node: ts.Node): ts.Node => {
      if (ts.isVariableDeclaration(node) && getName(node) == 'kAllPassiveAbilitiesList') {
        return ts.visitEachChild(node, abilityVisit, context);
      } else {
        return ts.visitEachChild(node, topLevelVisit, context);
      }
    };

    return ts.visitNode(rootNode, topLevelVisit);
  };

  writeSourceFile(ts.transform(file, [transformer]).transformed[0]);
}
