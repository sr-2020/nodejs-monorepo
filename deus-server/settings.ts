export class PushSettings {
  public username: string;
  public password: string;
  public serverKey: string;
}

export class Settings {
  public viewmodelUpdateTimeout: number;
  public accessGrantTime: number;
  public tooFarInFutureFilterTime: number;

  public pushSettings: PushSettings;
}
