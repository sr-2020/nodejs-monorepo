import { FieldName, FieldValue, Context } from './context'

export interface ModelApiInterface {
    get(name: FieldName): FieldValue,
    set(name: FieldName, value: any): this,
    update(name: FieldName, updater: (value: FieldValue) => FieldValue): this,
    setTimer(seconds: number, handle: string, data: any): this
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

        setTimer(seconds: number, handle: string, data: any) {
            context.setTimer(seconds, handle, data)
            return this;
        }
    }

    return new ModelApi();
}
