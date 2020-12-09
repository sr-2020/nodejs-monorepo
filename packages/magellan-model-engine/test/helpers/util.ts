import * as Path from 'path';
import { Config } from '@alice/alice-model-engine/config';
import { requireDir, TestFolderLoader } from '@alice/alice-model-engine/utils';
import { Worker } from '@alice/alice-model-engine/worker';

import { EngineResult, EngineResultOk, Event } from '@alice/interface/models/alice-model-engine';
import * as Winston from 'winston';
import { OrganismModel } from 'magellan-model-engine/helpers/basic-types';

let WORKER_INSTANCE: Worker | null = null;

function getWorker() {
  if (WORKER_INSTANCE) return WORKER_INSTANCE;

  (Winston as any).level = 'warn';

  const catalogsPath = Path.resolve(__dirname, '../../catalogs');
  const modelsPath = Path.resolve(__dirname, '../../src');

  const config = Config.parse(requireDir(new TestFolderLoader(catalogsPath)));
  return (WORKER_INSTANCE = Worker.load(new TestFolderLoader(modelsPath)).configure(config));
}

function process_(model: OrganismModel, events: Event[]): Promise<EngineResult> {
  return getWorker().process(model, events);
}

export async function process(model: OrganismModel, events: Event[]): Promise<EngineResultOk> {
  const result = await process_(model, events);
  if (result.status == 'error') throw result.error;
  return result;
}

export function findModifier(id: string, model: any): any {
  return model.modifiers.find((m: any) => m.name == id);
}

export function findChangeRecord(text: string, model: any): any {
  return model.changes.find((c: any) => c.text.startsWith(text));
}
