import { Event } from 'deus-engine-manager-api';
import { ModelApiInterface, ViewModelApiInterface } from './model_api';

export type Callback = (api: ModelApiInterface, data: any) => void

export type ViewModelCallback = (api: ViewModelApiInterface, model: any) => any;

export type Model = {
    callbacks: { [key: string]: Callback },
    viewModelCallbacks: { [base: string]: ViewModelCallback }
}
