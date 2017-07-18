import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import cuid = require('cuid');
import { FieldName, FieldValue, Timer, Context } from './context'

import Logger from './logger';

export interface ModelApiInterface {
    model: any,
    getCatalogObject(catalog: string, id: string): any,
    setTimer(name: string, seconds: number, handle: string, data: any): this,
    debug(msg: string, ...params: any[]): void,
    info(msg: string, ...params: any[]): void,
    warn(msg: string, ...params: any[]): void,
    error(msg: string, ...params: any[]): void
}

export function ModelApiFactory(context: Context): ModelApiInterface {
    function getModifiersBy(predicate: (m: any) => boolean) {
        return context.modifiers.filter(predicate);
    }

    function getEffectsBy(predicate: (m: any) => boolean) {
        let effects = context.effects.filter(predicate);
        return effects;
    }

    function getConditionsBy(predicate: (m: any) => boolean) {
        return context.conditions.filter(predicate);
    }

    class ModelApi implements ModelApiInterface {
        get model() { return context.ctx; }

        getCatalogObject(catalogName: string, id: string) {
            let catalog = context.getDictionary(catalogName);
            if (catalog) {
                return catalog.find((c) => c.id == id);
            }
        }

        getModifierById(id: string) {
            return context.modifiers.find((m) => m.mID == id);
        }

        getModifiersByName(name: string) {
            return getModifiersBy((m) => m.name == name);
        }

        getModifiersByClass(className: string) {
            return getModifiersBy((m) => m.class == className);
        }

        getModifiersBySystem(systemName: string) {
            return getModifiersBy((m) => m.system == systemName);
        }

        addModifier(modifier: any) {
            let m = cloneDeep(modifier);

            if (!m.mID) {
                m.mID = cuid();
            }

            context.modifiers.push(m);
            return m;
        }

        removeModifier(id: string) {
            _.remove(context.modifiers, (m) => m.mID == id);
            return this;
        }

        getEffectsByName(name: string) {
            return getEffectsBy((e) => e.name == name);
        }

        getEffectsByClass(className: string) {
            return getEffectsBy((e) => e.class == className);
        }

        getConditionById(id: string) {
            return context.conditions.find((c) => c.id == id);
        }

        getConditionsByClass(className: string) {
            return getConditionsBy((c) => c.class == className);
        }

        getConditionsByGroup(group: string) {
            return getConditionsBy((c) => c.group == group);
        }

        addCondition(condition: any) {
            let c = _.find(context.conditions, (c) => c.id == condition.id);

            if (c) return c;

            c = cloneDeep(condition);

            if (c) {
                if (!c.mID) {
                    c.mID = cuid();
                }

                context.conditions.push(c);
            }

            return c;
        }

        removeCondition(id: string) {
            _.remove(context.conditions, (c) => c.id == id);
            return this;
        }

        setTimer(name: string, miliseconds: number, eventType: string, data: any) {
            context.setTimer(name, miliseconds, eventType, data)
            return this;
        }

        getTimer(name: string) {
            return context.timers[name];
        }

        removeTimer(name: string) {
            delete context.timers[name];
            return this;
        }

        sendEvent(characterId: string | null, event: string, data: any) {
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
