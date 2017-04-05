export type Callback = <S>(context: S, data: any) => S

export type Callbacks = {
    [key: string]: Callback
}

export interface ModelInterface {
    name: string,
    description: string | null | undefined,
    files: string[],

    resolveCallback: ((handle: string) => Callback)
}

export type IndexedModels = {
    [key: string]: Model
}

export class Model implements ModelInterface {
    constructor(
        public name: string,
        public description: string,
        public files: string[],
        public callbacks: Callbacks
    ) { }

    resolveCallback(name: string) {
        return this.callbacks[name]
    }
}
