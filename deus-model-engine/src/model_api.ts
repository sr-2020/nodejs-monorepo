import { Context } from './model'

type DataPath = string | string[]

export interface ModelApiInterface {
    get(name: DataPath): any,
    set(name: DataPath, value: any): void,
    update(name: DataPath, updater: (value: any) => any): void,
    setTimer(seconds: number, handle: string, data: any): void
}

export function ModelApiFactory(context: Context) {
    class ModelApi implements ModelApiInterface {
        get(name: DataPath) {
            return context.get(name);
        }

        set(name: DataPath, value: any) {
            context.set(name, value);
        }

        update(name: DataPath, updater: (value: any) => any) {
            context.update(name, updater)
        }

        setTimer(seconds: number, handle: string, data: any) {
            context.setTimer(seconds, handle, data)
        }
    }

    return new ModelApi();
}
