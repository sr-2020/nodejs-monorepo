export enum QrType {
  Unknown = 0,

  Pill = 1,
  Implant = 2,
  InstantEffect = 3,

  MagellanPill = 4,  // payload should be of [1,2,3,4,5,6] kind
  EnterShip = 5,     // payload should contain ship id (number)
  LeaveShip = 6,

  SpaceSuitRefill = 7, // payload is <unique id>,<time in minutes>
  SpaceSuitTakeOff = 8, // payload is life support system disinfection power

  // Payload is 1,2,3,0,1,2,0,26 where first 7 numbers are systems influce,
  // and the last one is disease power
  XenoDisease = 9,

  LabTerminalRefill = 20, // payload is <unique id>,<how many tests to add>

  Rollback = 66,

  Passport = 100,
  Bill = 101,
}

export interface QrData {
  type: QrType;
  kind: number;
  validUntil: number;
  payload: string;
}
