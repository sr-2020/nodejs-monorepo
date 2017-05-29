import * as genericPool from 'generic-pool';
import Worker from './worker';

export default class WorkersPool {
    private pool: genericPool.Pool<Worker>;

    constructor(private workerModule: string, private args?: string[], private opts?: genericPool.Options) {
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
        console.log('>>> WorkersPool::createWorker');
        return new Worker(this.workerModule, this.args).up();
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
            console.log('>>> Error:', e);
        } finally {
            return this.release(worker);
        }
    }
}
