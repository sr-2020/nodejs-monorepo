/* tslint:disable interface-over-type-literal variable-name */

import 'reflect-metadata';

type _ = {};

type ClassN<N, T> = { new (...a: N[]): T };
type FN8<A, B, C, D, E, F, G, H, R> = (a?: A, b?: B, c?: C, d?: D, e?: E, f?: F, g?: G, h?: H) => R;
type CLS8<A, B, C, D, E, F, G, H, R> = { new (a?: A, b?: B, c?: C, d?: D, e?: E, f?: F, g?: G, h?: H): R };

class Token<T> {
    private _tokenBrand;
    constructor(public name: string) { }
}
type Bindable<T> = Token<T> | ClassN<_, T>;

const PARAMTYPE = 'design:paramtypes';

function getSignature<T>(cls: ClassN<T, _>): Array<Bindable<T>> {
    return Reflect.getOwnMetadata(PARAMTYPE, cls).slice() || [];
}

const enum BindType { CLASS, VALUE, FACTORY }
class Binder<T, Base> {
    dependencies: Bindable<Base>[] = [];
    cacheable: boolean = false;
    private _type: BindType;
    private _cls: ClassN<any, T>;
    private _val: T;
    private _fn: (...args: any[]) => T;

    constructor(private _injector: Injector<Base>) { }

    private _releaseInjector() {
        let injector = this._injector;
        this._injector = null as any;
        return injector;
    }

    toClass<A extends Base, B extends Base, C extends Base, D extends Base, E extends Base, F extends Base, G extends Base, H extends Base>(fn: CLS8<A, B, C, D, E, F, G, H, T>, a?: Bindable<A>, b?: Bindable<B>, c?: Bindable<C>, d?: Bindable<D>, e?: Bindable<E>, f?: Bindable<F>, g?: Bindable<G>, h?: Bindable<H>): Injector<Base | T>;
    toClass(cls: ClassN<Base, T>, ...deps: Bindable<Base>[]): Injector<Base | T> {
        this._type = BindType.CLASS;
        this._cls = cls;
        this.dependencies = getSignature(cls);
        deps.forEach((d, i) => {
            if (d) this.dependencies[i] = d;
        });
        return this._releaseInjector();
    }

    toValue(val: T): Injector<Base | T> {
        this._type = BindType.VALUE;
        this._val = val;
        this.cacheable = true;
        return this._releaseInjector();
    }

    toFactory<A extends Base, B extends Base, C extends Base, D extends Base, E extends Base, F extends Base, G extends Base, H extends Base>(fn: FN8<A, B, C, D, E, F, G, H, T>, a?: Bindable<A>, b?: Bindable<B>, c?: Bindable<C>, d?: Bindable<D>, e?: Bindable<E>, f?: Bindable<F>, g?: Bindable<G>, h?: Bindable<H>): Injector<Base | T>;
    toFactory(fn: (...a: Base[]) => T, ...deps: Bindable<Base>[]): Injector<Base | T> {
        this._type = BindType.FACTORY;
        this._fn = fn;
        this.dependencies = deps;
        return this._releaseInjector();
    }

    singleton() {
        this.cacheable = true;
        return this;
    }

    resolve(deps: any[]): T {
        switch (this._type) {
            case BindType.CLASS:
                let cls = this._cls;
                return new cls(...deps);
            case BindType.VALUE:
                return this._val;
            case BindType.FACTORY:
                return this._fn(...deps);
        }
    }
}

export class Injector<Base> {
    private _resolving = new Set<Bindable<_>>();
    private _typeBinderMap = new Map<Bindable<_>, Binder<_, Base>>();
    private _cache = new Map<Bindable<_>, any>();

    get<T extends Base>(cls: Bindable<T>): T {
        let binder = this._typeBinderMap.get(cls);
        if (!binder) throw new NoBinding(cls.name);

        let cache = binder.cacheable ? this._cache.get(cls) : null;
        if (cache) {
            return cache;
        }

        if (this._resolving.has(cls)) throw new CyclicDependency(cls.name);

        this._resolving.add(cls);
        let deps = binder.dependencies.map((dep) => this.get(dep));
        this._resolving.delete(cls);

        let res = binder.resolve(deps);
        if (binder.cacheable) this._cache.set(cls, res);
        return res as T;
    }

    bind<T>(cls: Bindable<T>): Binder<T, Base> {
        let binder = new Binder<T, Base>(this);
        this._typeBinderMap.set(cls, binder);
        return binder;
    }

    bindWithCache<T>(cls: Bindable<T>): Binder<T, Base> {
        let binder = this.bind<T>(cls);
        binder.cacheable = true;
        return binder;
    }

    use<A>(a: ClassN<Base, A>): Injector<A | Base> {
        return this.bind(a).toClass(a);
    }

    useWithCache<A>(a: ClassN<Base, A>): Injector<A | Base> {
        return this.bindWithCache(a).toClass(a);
    }

    static create(): Injector<Injector<_>> {
        let inj = new Injector<Injector<_>>();
        inj.bind(Injector).toValue(inj);
        return inj;
    }

    static inherit<A>(p: Injector<A>): Injector<A> {
        let inj = new Injector<A>();
        p._typeBinderMap.forEach((val, key) => {
            inj._typeBinderMap.set(key, val);
        });
        return inj;
    }
}

export class CyclicDependency extends Error {
    constructor(tokenName: string) {
        super(`Cyclic Dependency: ${tokenName}`);
    }
}

export class NoBinding extends Error {
    constructor(tokenName: string) {
        super(`No Binding Provided: ${tokenName}`);
    }
}

export function token<T>(name: string): Token<T> {
    return new Token(name);
}

export function Inject(a: any): void { /* magic! */ }
