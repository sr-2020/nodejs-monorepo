export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSource = 'default' | 'manager' | 'engine' | 'model';

export type Event = {
    characterId: string,
    eventType: string,
    timestamp: number,
    data?: any
}

export type SyncEvent = Event & { eventType: '_RefreshModel' }

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

export type EngineMessage = EngineMessageEvents | EngineMessageConfigure;

export type EngineResultOk = {
    status: 'ok'
    baseModel: any,
    workingModel: any,
    viewModels: { [base: string]: any },
    events: Event[]
}

export type EngineResultError = {
    status: 'error',
    error: any
}

export type EngineResult = EngineResultOk | EngineResultError;

export type EngineReplyResult = EngineResult & { type: 'result' };

export interface EngineReplyLog {
    type: 'log',
    source: string,
    level: LogLevel,
    msg: string,
    params: any[]
}

export interface EngineReplyReady {
    type: 'ready'
}

export type EngineReply = EngineReplyReady | EngineReplyResult | EngineReplyLog;
