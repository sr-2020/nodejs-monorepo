import * as Path from 'path';
import { Worker } from 'deus-model-engine/lib/worker';
import { Config } from 'deus-model-engine/lib/config';
import { requireDir } from 'deus-model-engine/lib/utils';

let WORKER_INSTANCE: Worker | null = null;

export function getWorker() {
    if (WORKER_INSTANCE) return WORKER_INSTANCE;

    const catalogsPath = Path.resolve(__dirname, '../catalogs');
    const modelsPath = Path.resolve(__dirname, '../src');

    const config = Config.parse(requireDir(catalogsPath));
    return WORKER_INSTANCE = Worker.load(modelsPath).configure(config);
}

export function process_(model: any, events: any) {
    return getWorker().process(model, events);
}

export function process(model: any, events: any) {
    let result = process_(model, events);
    if (result.status == 'error') throw result.error;
    return result;
}
