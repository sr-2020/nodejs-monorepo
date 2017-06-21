import * as genericPool from 'generic-pool';

import Logger from './logger';
import Worker from './worker';

export default class WorkersPool {
    private pool: genericPool.Pool<Worker>;

    constructor(private logger: Logger, private workerModule: string, private args?: string[], private opts?: genericPool.Options) {
        this.initPool();
    }

    private initPool() {
        const factory: genericPool.Factory<Worker> = {
            create: this.createWorker,
            destroy: this.destroyWorker
        };

        this.pool = genericPool.createPool(factory, this.opts);
    }

    private createWorker = () => {
        this.logger.debug('manager', 'WorkersPool::createWorker');
        let worker: Worker = new Worker(this.logger, this.workerModule, this.args)
            .onExit(() => this.pool.destroy(worker))
            .up();
        return worker;
    }

    private destroyWorker = (worker: Worker) => {
        worker.down();
    }

    async aquire() {
        return this.pool.acquire();
    }

    async release(worker: Worker) {
        return this.pool.release(worker);
    }

    async withWorker(handler: (worker: Worker) => Promise<void>) {
        const worker = await this.aquire();
        try {
            await handler(worker);
        } catch (e) {
            this.logger.error('manager', 'Error:', e);
        } finally {
            return this.release(worker);
        }
    }
}
