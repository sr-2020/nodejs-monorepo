import {
  EmptyModel,
  Event,
  ModelApiInterface,
  PreprocessApiInterface,
  ViewModelApiInterface,
} from 'interface/src/models/alice-model-engine';

export type Callback<T extends EmptyModel> = (api: ModelApiInterface<T>, data: any, event?: Event) => void;

export type ViewModelCallback<T extends EmptyModel> = (api: ViewModelApiInterface<T>, model: any) => any;

export type PreprocessCallback<T extends EmptyModel> = (api: PreprocessApiInterface<T>, events: Event[]) => any;

export interface ModelCallbacks<T extends EmptyModel> {
  callbacks: { [key: string]: Callback<T> };
  preprocessCallbacks: PreprocessCallback<T>[];
  viewModelCallbacks: { [base: string]: ViewModelCallback<T> };
}
