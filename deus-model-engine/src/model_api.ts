import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import cuid = require('cuid');
import { FieldName, FieldValue, Timer, Context } from './context'

import Logger from './logger';

export interface ReadModelApiInterface {
    model: any
    getCatalogObject(catalog: string, id: string): any
    getModifierById(id: string): any
    getModifiersByName(name: string): any[]
    getModifiersByClass(className: string): any[]
    getModifiersBySystem(systemName: string): any[]
    getEffectsByName(name: string): any[]
    getEffectsByClass(className: string): any[]
    getConditionById(id: string): any
    getConditionsByClass(className: string): any[]
    getConditionsByGroup(group: string): any[]
    getTimer(name: string): any
}

export interface LogApiInterface {
    debug(msg: string, ...params: any[]): void
    info(msg: string, ...params: any[]): void
    warn(msg: string, ...params: any[]): void
    error(msg: string, ...params: any[]): void
}

export interface WriteModelApiInterface {
    addModifier(modifier: any): any
    removeModifier(modifier: any): this
    addCondition(condition: any): any
    removeCondition(id: string): this
    setTimer(name: string, seconds: number, handle: string, data: any): this
    removeTimer(name: string): this
    sendEvent(characterId: string | null, event: string, data: any): this
}

export interface ViewModelApiInterface extends ReadModelApiInterface, LogApiInterface {
    baseModel: any
}

export interface ModelApiInterface extends ReadModelApiInterface, WriteModelApiInterface, LogApiInterface { }

class ReadModelApi implements ReadModelApiInterface, LogApiInterface {
    constructor(protected contextGetter: () => Context) { }

    get model() { return this.contextGetter().ctx; }

    private getModifiersBy(predicate: (m: any) => boolean) {
        return this.contextGetter().modifiers.filter(predicate);
    }

    private getEffectsBy(predicate: (m: any) => boolean) {
        let effects = this.contextGetter().effects.filter(predicate);
        return effects;
    }

    private getConditionsBy(predicate: (m: any) => boolean) {
        return this.contextGetter().conditions.filter(predicate);
    }

    getCatalogObject(catalogName: string, id: string) {
        let catalog = this.contextGetter().getDictionary(catalogName);
        if (catalog) {
            return catalog.find((c) => c.id == id);
        }
    }

    getModifierById(id: string) {
        return this.contextGetter().modifiers.find((m) => m.mID == id);
    }

    getModifiersByName(name: string) {
        return this.getModifiersBy((m) => m.name == name);
    }

    getModifiersByClass(className: string) {
        return this.getModifiersBy((m) => m.class == className);
    }

    getModifiersBySystem(systemName: string) {
        return this.getModifiersBy((m) => m.system == systemName);
    }

    getEffectsByName(name: string) {
        return this.getEffectsBy((e) => e.name == name);
    }

    getEffectsByClass(className: string) {
        return this.getEffectsBy((e) => e.class == className);
    }

    getConditionById(id: string) {
        return this.contextGetter().conditions.find((c) => c.id == id);
    }

    getConditionsByClass(className: string) {
        return this.getConditionsBy((c) => c.class == className);
    }

    getConditionsByGroup(group: string) {
        return this.getConditionsBy((c) => c.group == group);
    }

    getTimer(name: string) {
        return this.contextGetter().timers[name];
    }

    debug(msg: string, ...params: any[]) {
        Logger.debug('model', msg, ...params);
    }

    info(msg: string, ...params: any[]) {
        Logger.info('model', msg, ...params);
    }

    warn(msg: string, ...params: any[]) {
        Logger.warn('model', msg, ...params);
    }

    error(msg: string, ...params: any[]) {
        Logger.error('model', msg, ...params);
    }
}

class ModelApi extends ReadModelApi implements ModelApiInterface {
    addModifier(modifier: any) {
        let m = cloneDeep(modifier);

        if (!m.mID) {
            m.mID = cuid();
        }

        this.contextGetter().modifiers.push(m);
        return m;
    }

    removeModifier(id: string) {
        _.remove(this.contextGetter().modifiers, (m) => m.mID == id);
        return this;
    }

    addCondition(condition: any) {
        let c = _.find(this.contextGetter().conditions, (c) => c.id == condition.id);

        if (c) return c;

        c = cloneDeep(condition);

        if (c) {
            if (!c.mID) {
                c.mID = cuid();
            }

            this.contextGetter().conditions.push(c);
        }

        return c;
    }

    removeCondition(id: string) {
        _.remove(this.contextGetter().conditions, (c) => c.id == id);
        return this;
    }

    setTimer(name: string, miliseconds: number, eventType: string, data: any) {
        this.contextGetter().setTimer(name, miliseconds, eventType, data)
        return this;
    }

    removeTimer(name: string) {
        delete this.contextGetter().timers[name];
        return this;
    }

    sendEvent(characterId: string | null, event: string, data: any) {
        this.contextGetter().sendEvent(characterId, event, data);
        return this;
    }
}

class ViewModelApi extends ReadModelApi implements ViewModelApiInterface {
    constructor(contextGetter: () => Context, protected baseContextGetter: () => Context) {
        super(contextGetter);
    }

    get baseModel() { return this.baseContextGetter().ctx }
}

export function ModelApiFactory(context: Context): ModelApiInterface {
    return new ModelApi(() => context);
}

export function ViewModelApiFactory(context: Context, baseContext: Context): ViewModelApiInterface {
    return new ViewModelApi(() => context, () => baseContext);
}
