import { FieldName, FieldValue, Context } from './context'

import Logger from './logger';

export interface ModelApiInterface {
    get(name: FieldName): FieldValue,
    set(name: FieldName, value: any): this,
    update(name: FieldName, updater: (value: FieldValue) => FieldValue): this,
    setTimer(seconds: number, handle: string, data: any): this,
    debug(msg: string, ...params: any[]): void,
    info(msg: string, ...params: any[]): void,
    warn(msg: string, ...params: any[]): void,
    error(msg: string, ...params: any[]): void
}

export function ModelApiFactory(context: Context) {
    class ModelApi implements ModelApiInterface {
        get(name: FieldName) {
            return context.get(name);
        }

        set(name: FieldName, value: FieldValue) {
            context.set(name, value);
            return this;
        }

        update(name: FieldName, updater: (value: FieldValue) => FieldValue) {
            context.update(name, updater)
            return this;
        }

        setTimer(miliseconds: number, handle: string, data: any) {
            context.setTimer(miliseconds, handle, data)
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
