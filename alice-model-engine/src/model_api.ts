import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import cuid = require('cuid');
import { Event, ReadModelApiInterface, LogApiInterface,
    ViewModelApiInterface, ModelApiInterface, PreprocessApiInterface, Condition  } from 'alice-model-engine-api';

import { FieldName, FieldValue, Context } from './context'
import Logger from './logger';

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
            return cloneDeep(catalog.find((c) => c.id == id));
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

    debug(msg: string, additionalData?: any) {
        Logger.debug('model', msg, additionalData);
    }

    info(msg: string, additionalData?: any) {
        Logger.info('model', msg, additionalData);
    }

    notice(msg: string, additionalData?: any) {
        Logger.notice('model', msg, additionalData);
    }

    warn(msg: string, additionalData?: any) {
        Logger.warn('model', msg, additionalData);
    }

    error(msg: string, additionalData?: any) {
        Logger.error('model', msg, additionalData);
    }
}

class ModelApi extends ReadModelApi implements ModelApiInterface {
    constructor(contextGetter: () => Context, private currentEvent?: Event) {
        super(contextGetter);
    }

    addModifier(modifier: any) {
        let m = cloneDeep(modifier);

        if (!m.mID) {
            m.mID = cuid();
        }

        this.contextGetter().modifiers.push(m);
        return m;
    }

    aquired(db: string, id: string): any {
        return _.get(this.contextGetter(), ['aquired', db, id]);
    }

    removeModifier(mID: string) {
        _.remove(this.contextGetter().modifiers, (m) => m.mID == mID);
        return this;
    }

    addCondition(condition: Condition): Condition {
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
        let timestamp = this.currentEvent ? this.currentEvent.timestamp : this.contextGetter().timestamp;
        this.contextGetter().sendEvent(characterId, event, timestamp, data);
        return this;
    }
}

class ViewModelApi extends ReadModelApi implements ViewModelApiInterface {
    constructor(contextGetter: () => Context, protected baseContextGetter: () => Context) {
        super(contextGetter);
    }

    get baseModel() { return this.baseContextGetter().ctx }
}

class PreprocessApi extends ReadModelApi implements PreprocessApiInterface {
    aquire(db: string, id: string) {
        this.contextGetter().pendingAquire.push([db, id]);
        return this;
    }
}

export function ModelApiFactory(context: Context, event?: Event): ModelApiInterface {
    return new ModelApi(() => context, event);
}

export function ViewModelApiFactory(context: Context, baseContext: Context): ViewModelApiInterface {
    return new ViewModelApi(() => context, () => baseContext);
}

export function PreprocessApiFactory(context: Context): PreprocessApiInterface {
    return new PreprocessApi(() => context);
}
