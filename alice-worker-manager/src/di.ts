/* tslint:disable interface-over-type-literal variable-name */

import 'reflect-metadata';

type _ = {};

type ClassN<N, T> = { new(...a: N[]): T };
type FN8<A, B, C, D, E, F, G, H, R> = (a?: A, b?: B, c?: C, d?: D, e?: E, f?: F, g?: G, h?: H) => R;
type CLS8<A, B, C, D, E, F, G, H, R> = { new(a?: A, b?: B, c?: C, d?: D, e?: E, f?: F, g?: G, h?: H): R };

// tslint:disable-next-line:no-unused
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
    public dependencies: Array<Bindable<Base>> = [];
    public cacheable: boolean = false;
    private _type: BindType;
    private _cls: ClassN<any, T>;
    private _val: T;
    private _fn: (...args: any[]) => T;

    constructor(private _injector: Injector<Base>) { }

    public toClass<
        A extends Base,
        B extends Base,
        C extends Base,
        D extends Base,
        E extends Base,
        F extends Base,
        G extends Base,
        H extends Base>(fn: CLS8<A, B, C, D, E, F, G, H, T>,
                        a?: Bindable<A>,
                        b?: Bindable<B>,
                        c?: Bindable<C>,
                        d?: Bindable<D>,
                        e?: Bindable<E>,
                        f?: Bindable<F>,
                        g?: Bindable<G>,
                        h?: Bindable<H>): Injector<Base | T>;
    public toClass(cls: ClassN<Base, T>, ...deps: Array<Bindable<Base>>): Injector<Base | T> {
        this._type = BindType.CLASS;
        this._cls = cls;
        this.dependencies = getSignature(cls);
        deps.forEach((d, i) => {
            if (d) this.dependencies[i] = d;
        });
        return this._releaseInjector();
    }

    public toValue(val: T): Injector<Base | T> {
        this._type = BindType.VALUE;
        this._val = val;
        this.cacheable = true;
        return this._releaseInjector();
    }

    public toFactory<
    A extends Base,
    B extends Base,
    C extends Base,
    D extends Base,
    E extends Base,
    F extends Base,
    G extends Base,
    H extends Base>(fn: FN8<A, B, C, D, E, F, G, H, T>,
                    a?: Bindable<A>,
                    b?: Bindable<B>,
                    c?: Bindable<C>,
                    d?: Bindable<D>,
                    e?: Bindable<E>,
                    f?: Bindable<F>,
                    g?: Bindable<G>,
                    h?: Bindable<H>): Injector<Base | T>;
    public toFactory(fn: (...a: Base[]) => T, ...deps: Array<Bindable<Base>>): Injector<Base | T> {
        this._type = BindType.FACTORY;
        this._fn = fn;
        this.dependencies = deps;
        return this._releaseInjector();
    }

    public singleton() {
        this.cacheable = true;
        return this;
    }

    public resolve(deps: any[]): T {
        switch (this._type) {
            case BindType.CLASS:
                const cls = this._cls;
                return new cls(...deps);
            case BindType.VALUE:
                return this._val;
            case BindType.FACTORY:
                return this._fn(...deps);
        }
    }

    private _releaseInjector() {
        const injector = this._injector;
        this._injector = null as any;
        return injector;
    }
}

export class Injector<Base> {

    public static create(): Injector<Injector<_>> {
        const inj = new Injector<Injector<_>>();
        inj.bind(Injector).toValue(inj);
        return inj;
    }

    public static inherit<A>(p: Injector<A>): Injector<A> {
        const inj = new Injector<A>();
        p._typeBinderMap.forEach((val, key) => {
            inj._typeBinderMap.set(key, val);
        });
        return inj;
    }
    private _resolving = new Set<Bindable<_>>();
    private _typeBinderMap = new Map<Bindable<_>, Binder<_, Base>>();
    private _cache = new Map<Bindable<_>, any>();

    public get<T extends Base>(cls: Bindable<T>): T {
        const binder = this._typeBinderMap.get(cls);
        if (!binder) throw new NoBinding(cls.name);

        const cache = binder.cacheable ? this._cache.get(cls) : null;
        if (cache) {
            return cache;
        }

        if (this._resolving.has(cls)) throw new CyclicDependency(cls.name);

        this._resolving.add(cls);
        const deps = binder.dependencies.map((dep) => this.get(dep));
        this._resolving.delete(cls);

        const res = binder.resolve(deps);
        if (binder.cacheable) this._cache.set(cls, res);
        return res as T;
    }

    public bind<T>(cls: Bindable<T>): Binder<T, Base> {
        const binder = new Binder<T, Base>(this);
        this._typeBinderMap.set(cls, binder);
        return binder;
    }

    public bindWithCache<T>(cls: Bindable<T>): Binder<T, Base> {
        const binder = this.bind<T>(cls);
        binder.cacheable = true;
        return binder;
    }

    public use<A>(a: ClassN<Base, A>): Injector<A | Base> {
        return this.bind(a).toClass(a);
    }

    public useWithCache<A>(a: ClassN<Base, A>): Injector<A | Base> {
        return this.bindWithCache(a).toClass(a);
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

export function Inject(_a: any): void { /* magic! */ }
