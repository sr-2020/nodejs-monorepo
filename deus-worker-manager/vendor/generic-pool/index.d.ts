declare module 'generic-pool' {
    import { EventEmitter } from 'events';

    export interface Factory<T> {

        /** name of pool */
        name?: string;

        /**
         * A function that the pool will call when it wants a new resource. It should return a `Promise` that either resolves to a `resource` or rejects to an `Error` if it is unable to create a resourse for whatever.
         */
        create(): T | PromiseLike<T>;

        /**
         * A function that the pool will call when it wants to destroy a resource. It should accept one argument resource where `resource` is whatever `factory.create` made. The `destroy` function should return a `Promise` that resolves once it has destroyed the resource.
         */
        destroy(resource: T): void | PromiseLike<void>;

        /**
         * A function that the pool will call if it wants to validate a resource. It should accept one argument resource where `resource` is whatever `factory.create` made. Should return a `Promise` that resolves a `boolean` where `true` indicates the resource is still valid or `false` if the resource is invalid.
         */
        validate?(resource: T): boolean | PromiseLike<boolean>;
    }

    export interface Options {
        /**
         * Maximum number of resources to create at any given time. (default 1)
         */
        max?: number;
        /**
         * Minimum number of resources to keep in pool at any given time. If this is set >= max, the pool will silently set the min to equal `max`. (default 0)
         */
        min?: number;
        /**
         * Maximum number of queued requests allowed, additional `acquire` calls will be callback with an `err` in a future cycle of the event loop.
         */
        maxWaitingClients?: number;
        /**
         * Should the pool validate resources before giving them to clients. Requires that either `factory.validate` to be specified.
         */
        testOnBorrow?: boolean;
        /**
         * Max milliseconds a resource can stay unused in the pool without being borrowed before it should be destroyed (default 30000)
         */
        idleTimeoutMillis?: number;
        /**
         * Max milliseconds an acquire call will wait for a resource before timing out. (default no limit), if supplied should non-zero positive integer.
         */
        acquireTimeoutMillis?: number;
        /**
         * If true the oldest resources will be first to be allocated. If false the most recently released resources will be the first to be allocated. This in effect turns the pool's behaviour from a queue into a stack. (default true)
         */
        fifo?: boolean;
        /**
         * Int between 1 and x - if set, borrowers can specify their relative priority in the queue if no resources are available. see example. (default 1)
         */
        priorityRange?: number;
        /**
         * Should the pool start creating resources etc once the constructor is called. (default true)
         */
        autostart?: boolean;
        /**
         * How often to run eviction checks. (default 0, does not run)
         */
        evictionRunIntervalMillis?: number;
        /**
         * Number of resources to check each eviction run. (default 3)
         */
        numTestsPerRun?: number;
        /**
         * Amount of time an object may sit idle in the pool before it is eligible for eviction by the idle object evictor (if any), with the extra condition that at least "min idle" object instances remain in the pool. (default -1, nothing can get evicted)
         */
        softIdleTimeoutMillis?: number;
        /**
         * Promise lib, a Promises/A+ implementation that the pool should use. Defaults to whatever `global.Promise` is (usually native promises).
         */
        Promise?: typeof Promise;
    }

    export function createPool<T>(factory: Factory<T>, options?: Options): Pool<T>;

    export class Pool<T> extends EventEmitter {

        private constructor();

        /**
         * This function is for when you want to "borrow" a resource from the pool.
         */
        acquire(priority?: number): Promise<T>;

        /**
         * This function is for when you want to return a resource to the pool.
         */
        release(resource: T): Promise<void>;

        /**
         * This function is for when you want to return a resource to the pool but want it destroyed rather than being made available to other resources. E.g. you may know the resource has timed out or crashed.
         */
        destroy(resource: T): Promise<void>;

        /**
         * If you are shutting down a long-lived process, you may notice that node fails to exit for 30 seconds or so. This is a side effect of the `idleTimeoutMillis` behavior -- the pool has a `setTimeout()` call registered that is in the event loop queue, so node won't terminate until all resources have timed out, and the pool stops trying to manage them.
         *
         * This behavior will be more problematic when you set factory.min > 0, as the pool will never become empty, and the `setTimeout` calls will never end.
         *
         * In these cases, use the pool.drain() function. This sets the pool into a "draining" state which will gracefully wait until all idle resources have timed out. For example, you can call:
         *
         * If you do this, your node process will exit gracefully.
         */
        drain(): Promise<void>;

        /**
         * If you know you would like to terminate all the available resources in your pool before any timeouts they might have are reached, you can use `clear()` in conjunction with `drain()`:
         *
         * ```
         * pool.drain().then(() => pool.clear());
         * ```
         */
        clear(): Promise<void>;

        /**
         * The combined count of the currently created objects and those in the
         * process of being created. Does NOT include resources in the process of being destroyed.
         */
        readonly size: number;

        /**
         * Number of available resources.
         */
        readonly available: number;

        /**
         * Number of waiting acquire calls.
         */
        readonly pending: number;

        /**
         * Maximum size of the pool.
         */
        readonly max: number;

        /**
         * Minimum size of the pool.
         */
        readonly min: number;
    }
}
