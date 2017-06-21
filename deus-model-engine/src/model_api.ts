import * as _ from 'lodash';
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

export function ModelApiFactory(context: Context) {
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
                return catalog.find((c: any) => c.id == id);
            }
        }

        getModifierById(id: string) {
            let modifier = context.modifiers.find((m: any) => m.get('mID') == id);
            return modifier;
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
            let m = modifier;

            if (!m.has('mID')) {
                m = m.set('mID', cuid());
            }

            context.modifiers.push(m);
            return m.mID;
        }

        removeModifier(id: string) {
            _.remove(context.modifiers, (m) => m.mID == id);
            return this;
        }

        getEffectsByName(name: string) {
            return getEffectsBy((e: any) => e.get('name') == name);
        }

        getEffectsByClass(className: string) {
            return getEffectsBy((e: any) => e.get('class') == className);
        }

        getConditionById(id: string) {
            return context.conditions.find((c: any) => c.get('id') == id);
        }

        getConditionsByClass(className: string) {
            return getConditionsBy((c: any) => c.get('class') == className);
        }

        getConditionsByGroup(group: string) {
            return getConditionsBy((c: any) => c.get('group') == group);
        }

        addCondition(condition: any) {
            context.conditions.push(condition);
            return this;
        }

        removeCondition(id: string) {
            _.remove(context.conditions, (c) => c.id == id);
            return this;
        }

        setTimer(name: string, miliseconds: number, handle: string, data: any) {
            context.setTimer(name, miliseconds, handle, data)
            return this;
        }

        getTimer(name: string) {
            return context.timers[name];
        }

        removeTimer(name: string) {
            delete context.timers[name];
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
