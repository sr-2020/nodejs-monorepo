import { Config } from 'deus-model-engine/lib/config';
import { requireDir } from 'deus-model-engine/lib/utils';
import { Worker } from 'deus-model-engine/lib/worker';
import * as Path from 'path';

import { EngineContext, EngineResult, EngineResultOk, Event } from 'alice-model-engine-api';

let WORKER_INSTANCE: Worker | null = null;

function getWorker() {
    if (WORKER_INSTANCE) return WORKER_INSTANCE;

    const catalogsPath = Path.resolve(__dirname, '../../../catalogs');
    const modelsPath = Path.resolve(__dirname, '../../src');

    const config = Config.parse(requireDir(catalogsPath));
    return WORKER_INSTANCE = Worker.load(modelsPath).configure(config);
}

function process_(model: EngineContext, events: Event[]): Promise<EngineResult> {
    return getWorker().process(model, events);
}

export async function process(model: EngineContext, events: Event[]): Promise<EngineResultOk> {
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
