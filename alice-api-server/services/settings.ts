import { Token } from 'typedi';

export interface CheckForInactivitySettings {
  // Once per that time we will query all "inactive" users and notify them
  performOncePerMs: number;

  // Users for which currentTimestamp - viewModel.timestamp > notifyIfInactiveForMoreThanMs
  // are considered inactive
  notifyIfInactiveForMoreThanMs: number;

  // If set, check will be performed only
  // when Date().getHours() (returns current hour of day, from 0 to 23)
  // is greater than allowFromHour
  allowFromHour?: number;

  // If set, check will be performed only
  // when Date().getHours() (returns current hour of day, from 0 to 23)
  // is lesser than allowToHour
  allowToHour?: number;
}

export interface PushSettings {
  // Firebase Cloud Messaging server key to send push notifications
  serverKey: string;

  // Settings for sending hidden (background) push notification
  // forcing _RefreshModel event sending
  autoRefresh?: CheckForInactivitySettings;

  // Settings for sending visible (and audible if possible) push notification
  // for user to see.
  autoNotify?: CheckForInactivitySettings;

  // Title for notification triggered by autoNotify.
  // If not set - no notification will be sent!
  autoNotifyTitle?: string;

  // Body for notification triggered by autoNotify.
  // If not set - empty one will be used
  autoNotifyBody?: string;
}

export interface ApplicationSettings {
  // Port to listen on
  port: number;

  // If model server has not put updated viewmodel to DB
  // during this period, we send 202 to user.
  viewmodelUpdateTimeout: number;

  // Time for which access is granted by /characters method
  accessGrantTime: number;

  // _RefreshModel events with timestamp > currentTimestamp + tooFarInFutureFilterTime
  // will be ignored
  tooFarInFutureFilterTime: number;

  // Settings for push notifications
  pushSettings: PushSettings;
}

// tslint:disable-next-line:variable-name
export const ApplicationSettingsToken = new Token<ApplicationSettings>();

export interface ViewModelDbSettings {
  // ViewModel type, e.g. default, mobile, ...
  type: string;

  // URL to access DB
  url: string;
}

export interface DatabasesSettings {
  // Username to access databases
  username: string;

  // Password to access databases
  password: string;

  // URL to access accounts DB
  accounts: string;

  // URL to access events DB
  events: string;

  // URL to access models DB
  models: string;

  // URL to access metadata DB
  metadata: string;

  // Settings for ViewModel databases
  viewModels: ViewModelDbSettings[];

  // URL to access economy DB
  economy: string;

  objCounters: string;
}

export interface Configuration {
  // Settings for databases access
  databases: DatabasesSettings;

  // Inner application settings
  settings: ApplicationSettings;
}
