export type LogLevel = 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'crit' | 'alert' | 'emerg';
export type LogSource = 'default' | 'manager' | 'engine' | 'model';

export type Event = {
    characterId: string,
    eventType: string,
    timestamp: number,
    data?: any
}

export type SyncEvent = Event & { eventType: '_RefreshModel' }
export type RetryEvent = Event & { eventType: '_RetryRefresh' }

export type EngineContext = {
    timestamp: number,
    [key: string]: any
}

export type EngineMessageEvents = {
    type: 'events'
    context: any
    events: Event[]
}

export type EngineMessageConfigure = {
    type: 'configure'
    data: any
}

export type EngineMessageAquired = {
    type: 'aquired'
    data: {
        [db: string]: {
            [id: string]: any
        }
    }
}

export type EngineMessage = EngineMessageEvents | EngineMessageConfigure | EngineMessageAquired;

export type EngineResultOk = {
    status: 'ok'
    baseModel: any,
    workingModel: any,
    viewModels: { [base: string]: any },
    aquired?: { [key: string]: any },
    events?: Event[]
}

export type EngineResultError = {
    status: 'error',
    error: any
}

export type EngineResult = EngineResultOk | EngineResultError;

export type EngineReplyResult = EngineResult & { type: 'result' };

export type EngineReplyLog = {
    type: 'log'
    source: string
    level: LogLevel
    msg: string
    params: any[]
}

export type EngineReplyAquire = {
    type: 'aquire'
    keys: [string, string][]
}

export type EngineReplyReady = {
    type: 'ready'
}

export type EngineReply = EngineReplyReady | EngineReplyResult | EngineReplyLog | EngineReplyAquire;

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

export interface PreprocessApiInterface extends ReadModelApiInterface, LogApiInterface {
    aquire(db: string, id: string): this
}

export interface ViewModelApiInterface extends ReadModelApiInterface, LogApiInterface {
    baseModel: any
}

export interface ModelApiInterface extends ReadModelApiInterface, WriteModelApiInterface, LogApiInterface {
    aquired(db: string, id: string): any
}