export type Callback = (data: any) => void

export type Callbacks = {
    [key: string]: Callback
}

export interface ModelInterface {
    name: string,
    description: string | null | undefined,
    files: string[],

    resolveCallback: ((name: string) => Callback)
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
