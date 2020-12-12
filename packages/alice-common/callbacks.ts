import {
  EffectModelApi,
  EmptyModel,
  Event,
  EventModelApi,
  Modifier,
  PreprocessApiInterface,
  ViewModelApiInterface,
} from '@alice/alice-common/models/alice-model-engine';

export type EventCallback<T extends EmptyModel, U = any> = (api: EventModelApi<T>, data: U) => void;
export type EffectCallback<T extends EmptyModel> = (api: EffectModelApi<T>, m: Modifier) => void;

export type ViewModelCallback<T extends EmptyModel> = (api: ViewModelApiInterface<T>, model: any) => any;

export type PreprocessCallback<T extends EmptyModel> = (api: PreprocessApiInterface<T>, events: Event[]) => any;

export interface ModelCallbacks<T extends EmptyModel> {
  eventCallbacks: { [key: string]: EventCallback<T> };
  effectCallbacks: { [key: string]: EffectCallback<T> };
  preprocessCallbacks: PreprocessCallback<T>[];
  viewModelCallbacks: { [base: string]: ViewModelCallback<T> };
}
