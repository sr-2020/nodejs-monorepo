import { List, fromJS } from 'immutable';
import cuid = require('cuid');
import { FieldName, FieldValue, Timer, Context } from './context'

import Logger from './logger';

export interface ModelApiInterface {
    get(name: FieldName): FieldValue,
    set(name: FieldName, value: any): this,
    update(name: FieldName, updater: (value: FieldValue) => FieldValue): this,
    setTimer(name: string, seconds: number, handle: string, data: any): this,
    debug(msg: string, ...params: any[]): void,
    info(msg: string, ...params: any[]): void,
    warn(msg: string, ...params: any[]): void,
    error(msg: string, ...params: any[]): void
}

function toJS(value: any) {
    if (typeof value != 'undefined') {
        return value.toJS ? value.toJS() : value;
    } else {
        return null;
    }
}

export function ModelApiFactory(context: Context) {
    function getModifiersBy(predicate: (m: any) => boolean) {
        return toJS(context.modifiers.filter(predicate));
    }

    function getEffectsBy(predicate: (m: any) => boolean) {
        let effects = context.effects.filter(predicate);
        return toJS(effects);
    }

    function getConditionsBy(predicate: (m: any) => boolean) {
        return toJS(context.conditions.filter(predicate));
    }

    class ModelApi implements ModelApiInterface {
        get(name: FieldName) {
            return toJS(context.get(name));
        }

        set(name: FieldName, value: FieldValue) {
            context.set(name, value);
            return this;
        }

        push(name: FieldName, value: FieldValue) {
            context.push(name, value);
            return this;
        }

        update(name: FieldName, updater: (value: FieldValue) => FieldValue) {
            context.update(name, updater)
            return this;
        }

        getCatalogObject(catalogName: string, id: string) {
            let catalog = context.getDictionary(catalogName);
            if (catalog) {
                return toJS(catalog.find((c: any) => c.get('id') == id));
            }
        }

        getModifierById(id: string) {
            let modifier = context.get('modifiers').find((m: any) => m.get('mID') == id);
            return toJS(modifier);
        }

        getModifiersByName(name: string) {
            return getModifiersBy((m: any) => m.get('name') == name);
        }

        getModifiersByClass(className: string) {
            return getModifiersBy((m: any) => m.get('class') == className);
        }

        getModifiersBySystem(systemName: string) {
            return getModifiersBy((m: any) => m.get('system') == systemName);
        }

        addModifier(modifier: any) {
            let m = fromJS(modifier);

            if (!m.has('mID')) {
                m = m.set('mID', cuid());
            }

            context.push('modifiers', m);
            
            return m.get('mID');
        }

        removeModifier(id: string) {
            let ms = context.modifiers.filter((m: any) => m.get('mID') != id);
            context.set('modifiers', ms);
            return this;
        }

        getEffectsByName(name: string) {
            return getEffectsBy((e: any) => e.get('name') == name);
        }

        getEffectsByClass(className: string) {
            return getEffectsBy((e: any) => e.get('class') == className);
        }

        getConditionById(id: string) {
            return toJS(context.conditions.find((c: any) => c.get('id') == id));
        }

        getConditionsByClass(className: string) {
            return getConditionsBy((c: any) => c.get('class') == className);
        }

        getConditionsByGroup(group: string) {
            return getConditionsBy((c: any) => c.get('group') == group);
        }

        addCondition(condition: any) {
            context.push('conditions', condition);
            return this;
        }

        removeCondition(id: string) {
            let cs = context.conditions.filter((m: any) => m.get('id') != id);
            context.set('conditions', cs);
            return this;
        }

        setTimer(name: string, miliseconds: number, handle: string, data: any) {
            context.setTimer(name, miliseconds, handle, data)
            return this;
        }

        getTimer(name: string) {
            return (context.timers as List<Timer>).find((t: Timer) => t.name == name);
        }

        removeTimer(name: string) {
            let ts = (context.timers as List<Timer>).filter((t: Timer) => t.name != name) as List<Timer>;
            context.timers = ts;
            return this;
        }

        sendEvent(characterId: number | null, event: string, data: any) {
            context.sendEvent(characterId, event, data);
            return this;
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

    return new ModelApi();
}
