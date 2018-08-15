import { Token } from 'typedi';

export class CheckForInactivitySettings {
  // Once per that time we will query all "inactive" users and notify them
  public performOncePerMs: number;

  // Users for which currentTimestamp - viewModel.timestamp > notifyIfInactiveForMoreThanMs
  // are considered inactive
  public notifyIfInactiveForMoreThanMs: number;

  // If set, check will be performed only
  // when Date().getHours() (returns current hour of day, from 0 to 23)
  // is greater than allowFromHour
  public allowFromHour?: number;

  // If set, check will be performed only
  // when Date().getHours() (returns current hour of day, from 0 to 23)
  // is lesser than allowToHour
  public allowToHour?: number;
}

export class PushSettings {
  // Firebase Cloud Messaging server key to send push notifications
  public serverKey: string;

  // Settings for sending hidden (background) push notification
  // forcing _RefreshModel event sending
  public autoRefresh?: CheckForInactivitySettings;

  // Settings for sending visible (and audible if possible) push notification
  // for user to see.
  public autoNotify?: CheckForInactivitySettings;

  // Title for notification triggered by autoNotify.
  // If not set - no notification will be sent!
  public autoNotifyTitle?: string;

  // Body for notification triggered by autoNotify.
  // If not set - empty one will be used
  public autoNotifyBody?: string;
}

export class ApplicationSettings {
  // Port to listen on
  public port: number;

  // If model server has not put updated viewmodel to DB
  // during this period, we send 202 to user.
  public viewmodelUpdateTimeout: number;

  // Time for which access is granted by /characters method
  public accessGrantTime: number;

  // _RefreshModel events with timestamp > currentTimestamp + tooFarInFutureFilterTime
  // will be ignored
  public tooFarInFutureFilterTime: number;

  // Settings for push notifications
  public pushSettings: PushSettings;
}

// tslint:disable-next-line:variable-name
export const ApplicationSettingsToken = new Token<ApplicationSettings>();

export class ViewModelDbSettings {
  // ViewModel type, e.g. default, mobile, ...
  public type: string;

  // URL to access DB
  public url: string;
}

export class DatabasesSettings {
  // Username to access databases
  public username: string;

  // Password to access databases
  public password: string;

  // URL to access accounts DB
  public accounts: string;

  // URL to access events DB
  public events: string;

  // How often to run compactions in events database
  public compactEventsViewEveryMs?: number;

  // URL to access models DB
  public models: string;

  // Settings for ViewModel databases
  public viewModels: ViewModelDbSettings[];

  // URL to access economy DB
  public economy: string;

  public objCounters: string;
}

export class Configuration {
  // Settings for databases access
  public databases: DatabasesSettings;

  // Inner application settings
  public settings: ApplicationSettings;
}
