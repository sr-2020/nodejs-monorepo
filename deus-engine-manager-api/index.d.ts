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

export type Timer = {
    name: string,
    miliseconds: number,
    eventType: string,
    data: any
}

export type Effect = {
    enabled: boolean,
    id: string,
    class: string,
    type: 'normal' | 'functional',
    handler: string
}

export type Modifier = {
    mID: string,
    name?: string,
    class?: string,
    system?: string,
    enabled: boolean,
    effects: Effect[],
    [key: string]: any
}

export type Condition = {
    mID: string,
    id: string,
    class: string,
    text: string,
    details?: string,
    group?: string,
    level?: number
}

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

    getModifierById(id: string): Modifier | undefined
    getModifiersByName(name: string): Modifier[]
    getModifiersByClass(className: string): Modifier[]
    getModifiersBySystem(systemName: string): Modifier[]

    getEffectsByName(name: string): Effect[]
    getEffectsByClass(className: string): Effect[]

    getConditionById(id: string): Condition | undefined
    getConditionsByClass(className: string): Condition[]
    getConditionsByGroup(group: string): Condition[]

    getTimer(name: string): Timer | undefined
}

export interface LogApiInterface {
    debug(msg: string, additionalData: any): void
    info(msg: string, additionalData: any): void
    warn(msg: string, additionalData: any): void
    error(msg: string, additionalData: any): void
}

export interface WriteModelApiInterface {
    // If modifier.mID is not present, will generate new unique one.
    // Returns added modifier.
    addModifier(modifier: Modifier): Modifier
    // Will do nothing if no modifier with such mID is present.
    removeModifier(mID: string): this

    // If condition with same id is present, will do nothing
    // and return existing condition.
    // If condition.mID is not present, will generate new unique one.
    // Returns added condition.
    addCondition(condition: Condition): Condition
    // Will do nothing if no condition with such id is present.
    removeCondition(id: string): this

    // Schedules delayed event for current character.
    // name should be unique - in other case new timer will override existing one.
    setTimer(name: string, miliseconds: number, eventType: string, data: any): this
    // Cancels existing timer.
    // NB: timer must exist!
    removeTimer(name: string): this

    // Adds event to events queue of characterId. If characterId is null,
    // event is send to currently processed character. Timestamp of event
    // is "now", i.e. equals to timestamp of event currently being processed.
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