import { JsonMember, JsonObject } from 'typedjson';

@JsonObject
export class CheckForInactivitySettings {
  // Once per that time we will query all "inactive" users and notify them
  @JsonMember({isRequired: true})
  public performOncePerMs: number;

  // Users for which currentTimestamp - viewModel.timestamp > notifyIfInactiveForMoreThanMs
  // are considered inactive
  @JsonMember({isRequired: true})
  public notifyIfInactiveForMoreThanMs: number;
}

@JsonObject
export class PushSettings {
  // Users of push-related methods must use HTTP Basic Auth with following credentials:
  // Username to access push-related methods
  @JsonMember({isRequired: true})
  public username: string;

  // Password to access push-related methods
  @JsonMember({isRequired: true})
  public password: string;

  // Firebase Cloud Messaging server key to send push notifications
  @JsonMember({isRequired: true})
  public serverKey: string;

  // Settings for sending hidden (background) push notification
  // forcing _RefreshModel event sending
  @JsonMember
  public autoRefresh?: CheckForInactivitySettings;

  // Settings for sending visible (and audible if possible) push notification
  // for user to see.
  @JsonMember
  public autoNotify?: CheckForInactivitySettings;

  // Title for notification triggered by autoNotify.
  // If not set - no notification will be sent!
  @JsonMember
  public autoNotifyTitle?: string;

  // Body for notification triggered by autoNotify.
  // If not set - empty one will be used
  @JsonMember
  public autoNotifyBody?: string;
}

@JsonObject
export class ApplicationSettings {
  // If model server has not put updated viewmodel to DB
  // during this period, we send 202 to user.
  @JsonMember({isRequired: true})
  public viewmodelUpdateTimeout: number;

  // Time for which access is granted by /characters method
  @JsonMember({isRequired: true})
  public accessGrantTime: number;

  // _RefreshModel events with timestamp > currentTimestamp + tooFarInFutureFilterTime
  // will be ignored
  @JsonMember({isRequired: true})
  public tooFarInFutureFilterTime: number;

  // Settings for push notifications
  @JsonMember({isRequired: true})
  public pushSettings: PushSettings;
}

@JsonObject
export class ViewModelDbSettings {
  // ViewModel type, e.g. default, mobile, ...
  @JsonMember({isRequired: true})
  public type: string;

  // URL to access DB
  @JsonMember({isRequired: true})
  public url: string;
}

@JsonObject
export class DatabasesSettings {
  // Username to access databases
  @JsonMember({isRequired: true})
  public username: string;

  // Password to access databases
  @JsonMember({isRequired: true})
  public password: string;

  // URL to access accounts DB
  @JsonMember({isRequired: true})
  public accounts: string;

  // URL to access events DB
  @JsonMember({isRequired: true})
  public events: string;

  // Settings for ViewModel databases
  @JsonMember({isRequired: true, elementType: ViewModelDbSettings})
  public viewModels: ViewModelDbSettings[];
}

@JsonObject
export class Configuration {
  // Port to listen on
  @JsonMember({isRequired: true})
  public port: number;

  // Settings for databases access
  @JsonMember({isRequired: true})
  public databases: DatabasesSettings;

  // Inner application settings
  @JsonMember({isRequired: true})
  public settings: ApplicationSettings;
}
