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

  LabTerminalRefill = 20, // payload is <unique id>,<how many tests to add>

  Passport = 100,
  Bill = 101,
}