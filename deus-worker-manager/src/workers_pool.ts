import * as genericPool from 'generic-pool';

import { DIInterface } from './di';
import { LoggerInterface } from './logger';
import { PoolConfig } from './config';

import Worker from './worker';

export interface WorkersPoolInterface {
    aquire(): Promise<Worker>;
    release(worker: Worker): Promise<any>;
    withWorker(handler: (worker: Worker) => Promise<void>): Promise<void>
}

export class WorkersPool implements WorkersPoolInterface {
    private pool: genericPool.Pool<Worker>;

    constructor(private config: PoolConfig, private logger: LoggerInterface) {
        this.initPool();
    }

    private initPool() {
        const factory: genericPool.Factory<Worker> = {
            create: this.createWorker,
            destroy: this.destroyWorker
        };

        this.pool = genericPool.createPool(factory, this.config.options);
    }

    private createWorker = () => {
        this.logger.debug('manager', 'WorkersPool::createWorker');
        let worker: Worker = new Worker(this.logger, this.config.workerModule, this.config.workerArgs)
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
