import * as Path from 'path';
import { Worker } from '@sr2020/alice-model-engine/worker';
import { Config } from '@sr2020/alice-model-engine/config';
import { requireDir } from '@sr2020/alice-model-engine/utils';
import * as Winston from 'winston';

import { EngineContext, Event, EngineResult, EngineResultOk } from '@sr2020/alice-model-engine-api/index';

let WORKER_INSTANCE: Worker | null = null;

export function getWorker() {
  if (WORKER_INSTANCE) return WORKER_INSTANCE;

  (Winston as any).level = 'error';

  const catalogsPath = Path.resolve(__dirname, '../catalogs');
  const modelsPath = Path.resolve(__dirname, '../src');

  const config = Config.parse(requireDir(catalogsPath));
  return (WORKER_INSTANCE = Worker.load(modelsPath).configure(config));
}

export function process_(model: EngineContext, events: Event[]): Promise<EngineResult> {
  return getWorker().process(model, events);
}

export async function process(model: EngineContext, events: Event[]): Promise<EngineResultOk> {
  let result = await process_(model, events);
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
