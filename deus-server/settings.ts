export class CheckForInactivitySettings {
  public performOncePerMs: number;
  public notifyIfInactiveForMoreThanMs: number;
}

export class PushSettings {
  public username: string;
  public password: string;
  public serverKey: string;

  public autoRefresh?: CheckForInactivitySettings;
  public autoNotify?: CheckForInactivitySettings;

  public autoNotifyTitle?: string;
  public autoNotifyBody?: string;
}

export class Settings {
  public viewmodelUpdateTimeout: number;
  public accessGrantTime: number;
  public tooFarInFutureFilterTime: number;

  public pushSettings: PushSettings;
}
