import { Event, ModelApiInterface, PreprocessApiInterface, ViewModelApiInterface } from 'alice-model-engine-api';

export type Callback = (api: ModelApiInterface, data: any, event?: Event) => void

export type ViewModelCallback = (api: ViewModelApiInterface, model: any) => any;

export type PreprocessCallback = (api: PreprocessApiInterface, events: Event[]) => any

export type Model = {
    callbacks: { [key: string]: Callback },
    preprocessCallbacks: PreprocessCallback[]
    viewModelCallbacks: { [base: string]: ViewModelCallback }
}
