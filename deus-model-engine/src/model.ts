import { ModelApiInterface } from './model_api';

export type Callback = (api: ModelApiInterface, data: any) => void

export type ViewModelCallback = (model: any, viewModel: any) => any;

export type Model = {
    callbacks: { [key: string]: Callback },
    viewModelCallbacks: ViewModelCallback[]
}
