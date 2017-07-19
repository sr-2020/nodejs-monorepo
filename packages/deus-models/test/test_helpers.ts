import * as Path from 'path';
import { Worker } from 'deus-model-engine/lib/worker';
import { Config } from 'deus-model-engine/lib/config';
import { requireDir } from 'deus-model-engine/lib/utils';

import { EngineContext, Event, EngineResult, EngineResultOk } from 'deus-engine-manager-api';

let WORKER_INSTANCE: Worker | null = null;

export function getWorker() {
    if (WORKER_INSTANCE) return WORKER_INSTANCE;

    const catalogsPath = Path.resolve(__dirname, '../catalogs');
    const modelsPath = Path.resolve(__dirname, '../src');

    const config = Config.parse(requireDir(catalogsPath));
    return WORKER_INSTANCE = Worker.load(modelsPath).configure(config);
}

export function process_(model: EngineContext, events: Event[]): EngineResult {
    return getWorker().process(model, events);
}

export function process(model: EngineContext, events: Event[]): EngineResultOk {
    let result = process_(model, events);
    if (result.status == 'error') throw result.error;
    return result;
}
