import { Condition, ModelApiInterface, Modifier } from 'deus-engine-manager-api';

// TODO(aeremin) Move to deus-engine-manager-api?
export interface Change {
  mID: string;
  text: string;
  timestamp: number;
}

export enum BiologicalSystems {
  Nervous,
  Cardiovascular,
  Reproductive,
  Digestive,
  Respiratory,
  Musculoskeletal,
  Integumentary,
}

export const biologicalSystemsNames = new Map<BiologicalSystems, string>([
  [BiologicalSystems.Nervous, 'Нервная'],
  [BiologicalSystems.Cardiovascular, 'Сердечно-сосудистая'],
  [BiologicalSystems.Reproductive, 'Репродуктивная'],
  [BiologicalSystems.Digestive, 'Пищеварительная'],
  [BiologicalSystems.Respiratory, 'Дыхательная'],
  [BiologicalSystems.Musculoskeletal, 'Опорно-двигательная'],
  [BiologicalSystems.Integumentary, 'Покровная'],
]);

export enum SystemColor {
  Orange,
  Green,
  Blue,
}

export const biologicalSystemsColors = new Map<BiologicalSystems, SystemColor[]>([
  [BiologicalSystems.Nervous, [SystemColor.Orange]],
  [BiologicalSystems.Cardiovascular, [SystemColor.Green, SystemColor.Blue]],
  [BiologicalSystems.Reproductive, [SystemColor.Blue]],
  [BiologicalSystems.Digestive, [SystemColor.Green]],
  [BiologicalSystems.Respiratory, [SystemColor.Orange, SystemColor.Blue]],
  [BiologicalSystems.Musculoskeletal, [SystemColor.Orange]],
  [BiologicalSystems.Integumentary, [SystemColor.Green]],
]);

export function systemCorrespondsToColor(color: SystemColor, system: BiologicalSystems): boolean {
  return (biologicalSystemsColors.get(system) as SystemColor[]).includes(color);
}

export function colorOfChange(model: OrganismModel, change: number[]): SystemColor | undefined {
  const systemsAffected: Set<BiologicalSystems> = new Set<BiologicalSystems>();
  const systemsNotAffected: Set<BiologicalSystems> =
    new Set<BiologicalSystems>(organismSystemsIndices(model));
  organismSystemsIndices(model).forEach((i) => {
    if (change[i] != 0) {
      systemsAffected.add(i);
      systemsNotAffected.delete(i);
    }
  });

  const colorsSeen: Set<SystemColor> = new Set<SystemColor>();

  systemsAffected.forEach((s) => {
    (biologicalSystemsColors.get(s) as SystemColor[]).map(color => colorsSeen.add(color));
  });

  for (const color of colorsSeen) {
    if (Array.from(systemsAffected).every((system) => systemCorrespondsToColor(color, system)) &&
        !Array.from(systemsNotAffected).some((system) => systemCorrespondsToColor(color, system)))
        return color;
  }

  return undefined;
}

export function allSystemsIndices(): number[] {
  const result: number[] = [];
  for (const system in BiologicalSystems)
    if (!isNaN(Number(system)))
      result.push(Number(system));

  return result;
}

export function organismSystemsIndices(model: OrganismModel): number[] {
  return allSystemsIndices().filter(
    (i) => model.systems[i].present
    &&  model.systems[i].nucleotide != null
    && model.systems[i].nucleotide != undefined);
}

export interface XenoDisease {
  influence: number[];
  power: number;
}

export interface SpaceSuit {
  on: boolean;
  oxygenCapacity: number;
  timestampWhenPutOn: number;
  diseases: XenoDisease[];
}

export interface System {
  present: boolean;
  value: number;
  nucleotide: number;
  lastModified: number;
}

export interface OrganismModel {
  _id: string;
  timestamp: number;
  // Debug only
  showTechnicalInfo?: boolean;

  changes: Change[];
  conditions: Condition[];
  modifiers: Modifier[];

  isAlive: boolean;

  isTopManager?: boolean;

  firstName: string;
  lastName: string;

  // TODO(aeremin): Do we need corporation?
  corporation: string;

  location?: string;
  systems: System[];

  spaceSuit: SpaceSuit;

  profileType: string;
}

export function getTypedOrganismModel(api: ModelApiInterface): OrganismModel {
  return api.model;
}

export interface LabTerminalRefillData {
  uniqueId: string;
  numTests: number;
}

// TODO: Merge with deus-qr-lib
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

export interface ScanQRData {
  type: QrType;
  kind: number;
  validUntil: number;
  payload: string;
}
