import { ModelApiInterface } from './model_api';

export type Callback = (api: ModelApiInterface, data: any) => void

export type ViewModelCallback = (api: ModelApiInterface, model: any) => any;

export type Model = {
    callbacks: { [key: string]: Callback },
    viewModelCallbacks: { [base: string]: ViewModelCallback }
}
