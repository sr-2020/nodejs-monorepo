export declare type LogLevel = 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit' | 'alert' | 'emerg';
export declare type LogSource = 'default' | 'manager' | 'engine' | 'model';
export interface CharacterlessEvent {
    eventType: string;
    timestamp: number;
    data?: any;
}
export interface Event extends CharacterlessEvent {
    characterId: string;
}
export interface SyncRequest {
    characterId: string;
    scheduledUpdateTimestamp: number;
}
export interface ModelMetadata {
    scheduledUpdateTimestamp: number;
}
export declare type Timer = {
    name: string;
    miliseconds: number;
    eventType: string;
    data: any;
};
export declare type Effect = {
    enabled: boolean;
    id: string;
    class: string;
    type: 'normal' | 'functional';
    handler: string;
};
export declare type Modifier = {
    mID: string;
    name?: string;
    class?: string;
    system?: string;
    enabled: boolean;
    effects: Effect[];
    [key: string]: any;
};
export declare type Condition = {
    mID: string;
    id: string;
    class: string;
    text: string;
    details?: string;
    group?: string;
    level?: number;
};
export declare type EngineMessageEvents = {
    type: 'events';
    context: any;
    events: Event[];
};
export declare type EngineMessageConfigure = {
    type: 'configure';
    data: any;
};
export declare type EngineMessageAquired = {
    type: 'aquired';
    data: {
        [db: string]: {
            [id: string]: any;
        };
    };
};
export declare type EngineMessage = EngineMessageEvents | EngineMessageConfigure | EngineMessageAquired;
export declare type EngineResultOk = {
    status: 'ok';
    baseModel: any;
    workingModel: any;
    viewModels: {
        [base: string]: any;
    };
    aquired?: {
        [key: string]: any;
    };
    outboundEvents: Event[];
};
export declare type EngineResultError = {
    status: 'error';
    error: any;
};
export declare type EngineResult = EngineResultOk | EngineResultError;
export declare type EngineReplyResult = EngineResult & {
    type: 'result';
};
export declare type EngineReplyLog = {
    type: 'log';
    source: string;
    level: LogLevel;
    msg: string;
    params: any[];
};
export declare type EngineReplyAquire = {
    type: 'aquire';
    keys: [string, string][];
};
export declare type EngineReplyReady = {
    type: 'ready';
};
export declare type EngineReply = EngineReplyReady | EngineReplyResult | EngineReplyLog | EngineReplyAquire;
export interface Timers {
    [name: string]: Timer;
}
export interface EmptyModel {
    characterId: string;
    timestamp: number;
    modifiers?: Modifier[];
    conditions?: Condition[];
    timers?: Timers;
}
export interface ReadModelApiInterface<T extends EmptyModel> {
    model: T;
    getCatalogObject(catalog: string, id: string): any;
    getModifierById(id: string): Modifier | undefined;
    getModifiersByName(name: string): Modifier[];
    getModifiersByClass(className: string): Modifier[];
    getModifiersBySystem(systemName: string): Modifier[];
    getEffectsByName(name: string): Effect[];
    getEffectsByClass(className: string): Effect[];
    getConditionById(id: string): Condition | undefined;
    getConditionsByClass(className: string): Condition[];
    getConditionsByGroup(group: string): Condition[];
    getTimer(name: string): Timer | undefined;
}
export interface LogApiInterface {
    debug(msg: string, additionalData?: any): void;
    info(msg: string, additionalData?: any): void;
    warn(msg: string, additionalData?: any): void;
    error(msg: string, additionalData?: any): void;
}
export interface WriteModelApiInterface {
    addModifier(modifier: Modifier): Modifier;
    removeModifier(mID: string): this;
    addCondition(condition: Condition): Condition;
    removeCondition(id: string): this;
    setTimer(name: string, miliseconds: number, eventType: string, data: any): this;
    removeTimer(name: string): this;
    sendEvent(characterId: string | null, event: string, data: any): this;
}
export interface PreprocessApiInterface<T extends EmptyModel> extends ReadModelApiInterface<T>, LogApiInterface {
    aquire(db: string, id: string): this;
}
export interface ViewModelApiInterface<T extends EmptyModel> extends ReadModelApiInterface<T>, LogApiInterface {
    baseModel: any;
}
export interface ModelApiInterface<T extends EmptyModel> extends ReadModelApiInterface<T>, WriteModelApiInterface, LogApiInterface {
    aquired(db: string, id: string): any;
}
//# sourceMappingURL=index.d.ts.map