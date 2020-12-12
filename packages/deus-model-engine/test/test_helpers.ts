import * as Path from 'path';
import { Worker } from '@alice/alice-model-engine/worker';
import { Config } from '@alice/alice-model-engine/config';
import { requireDir, TestFolderLoader } from '@alice/alice-model-engine/utils';
import * as Winston from 'winston';

import { EmptyModel, EngineResult, EngineResultOk, Event } from '@alice/alice-common/models/alice-model-engine';

let WORKER_INSTANCE: Worker | null = null;

export function getWorker() {
  if (WORKER_INSTANCE) return WORKER_INSTANCE;

  (Winston as any).level = 'error';

  const catalogsPath = Path.resolve(__dirname, '../catalogs');
  const modelsPath = Path.resolve(__dirname, '../models');

  const config = Config.parse(requireDir(new TestFolderLoader(catalogsPath)));
  return (WORKER_INSTANCE = Worker.load(new TestFolderLoader(modelsPath)).configure(config));
}

export function process_(model: EmptyModel, events: Event[]): Promise<EngineResult> {
  return getWorker().process(model, events);
}

export async function process(model: EmptyModel, events: Event[]): Promise<EngineResultOk> {
  const result = await process_(model, events);
  if (result.status == 'error') throw result.error;
  return result;
}

export function printModel(model: any) {
  console.log(JSON.stringify(model, null, 4));
}

export function findModifier(id: string, model: any): any {
  return model.modifiers.find((m: any) => m.name == id);
}

export function findChangeRecord(text: string, model: any): any {
  return model.changes.find((c: any) => c.text.startsWith(text));
}
