import { Inject } from './di';
import * as genericPool from 'generic-pool';

import { LoggerInterface } from './logger';
import { Config, PoolConfig } from './config';
import { Event } from './events_source';

import { Worker } from './worker';

export interface WorkersPoolInterface {
    init(): void
    aquire(): Promise<Worker>
    release(worker: Worker): Promise<any>
    withWorker<E>(handler: (worker: Worker) => Promise<E>): Promise<E>
    drain(): Promise<void>
}

@Inject
export class WorkersPool implements WorkersPoolInterface {
    private logger: LoggerInterface;

    private config: PoolConfig;
    private pool: genericPool.Pool<Worker>;

    constructor(config: Config, logger: LoggerInterface) {
        this.config = config.pool;
        this.logger = logger;

        this.init();
    }

    init() {
        const factory: genericPool.Factory<Worker> = {
            create: this.createWorker,
            destroy: this.destroyWorker
        };

        this.pool = genericPool.createPool(factory, this.config.options);
    }

    private createWorker = () => {
        this.logger.debug('manager', 'WorkersPool::createWorker');
        let worker: Worker = new Worker(this.logger, this.config.workerModule, this.config.workerArgs)
            .onExit(() => {
                this.logger.error('manager', 'Worker exit. Last output:\n %s', worker.lastOutput.join());
                this.pool.destroy(worker);
            }).up();
        return worker;
    }

    private destroyWorker = (worker: Worker) => {
        worker.down();
    }

    aquire() {
        return this.pool.acquire();
    }

    async release(worker: Worker) {
        try {
            await this.pool.release(worker);
        } catch (e) {
            // pass
        }
    }

    drain() {
        return this.pool.drain();
    }

    async withWorker<E>(handler: (worker: Worker) => Promise<E>) {
        const worker = await this.aquire();
        try {
            return await handler(worker);
        } catch (e) {
            this.logger.error('manager', 'Error:', e);
            throw e;
        } finally {
            this.release(worker);
        }
    }
}
