import { Condition, EmptyModel, NumberProperty, StringProperty } from '@alice/alice-common/models/alice-model-engine';

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

export function colorOfChange(organismModel: OrganismModel, change: number[]): SystemColor | undefined {
  const systemsAffected: Set<BiologicalSystems> = new Set<BiologicalSystems>();
  const systemsNotAffected: Set<BiologicalSystems> = new Set<BiologicalSystems>(organismSystemsIndices(organismModel));
  organismSystemsIndices(organismModel).forEach((i) => {
    if (change[i] != 0) {
      systemsAffected.add(i);
      systemsNotAffected.delete(i);
    }
  });

  const colorsSeen: Set<SystemColor> = new Set<SystemColor>();

  systemsAffected.forEach((s) => {
    (biologicalSystemsColors.get(s) as SystemColor[]).map((color) => colorsSeen.add(color));
  });

  for (const color of colorsSeen) {
    if (
      Array.from(systemsAffected).every((system) => systemCorrespondsToColor(color, system)) &&
      !Array.from(systemsNotAffected).some((system) => systemCorrespondsToColor(color, system))
    )
      return color;
  }

  return undefined;
}

export function allSystemsIndices(): number[] {
  const result: number[] = [];
  for (const system in BiologicalSystems) if (!isNaN(Number(system))) result.push(Number(system));

  return result;
}

export function organismSystemsIndices(organismModel: OrganismModel): number[] {
  return allSystemsIndices().filter(
    (i) =>
      organismModel.systems[i].present && organismModel.systems[i].nucleotide != null && organismModel.systems[i].nucleotide != undefined,
  );
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

export class Change {
  @StringProperty()
  mID: string;

  @StringProperty()
  text: string;

  @NumberProperty()
  timestamp: number;
}

export interface OrganismModel extends EmptyModel {
  // Debug only
  showTechnicalInfo?: boolean;

  changes: Change[];

  isAlive: boolean;

  isTopManager?: boolean;

  firstName: string;
  lastName: string;

  corporation: string;

  location?: string;
  systems: System[];
  conditions: Condition[];

  spaceSuit: SpaceSuit;

  profileType: string;
}

export interface LabTest {
  name: string;
  displayableName: string;
}

export interface PatientHistoryEntry {
  timestamp: number;
  patientId: string;
  patientFullName: string;
  text: string;
  type: string;
}

export interface MedicModel extends EmptyModel {
  _id: string;
  profileType: 'medic';
  numTests: number;
  availableTests: LabTest[];
  patientHistory: PatientHistoryEntry[];
}

export interface LabTerminalRefillData {
  uniqueId: string;
  numTests: number;
}

export enum QrType {
  Unknown = 0,

  Pill = 1,
  Implant = 2,
  InstantEffect = 3,

  MagellanPill = 4, // payload should be of [1,2,3,4,5,6] kind
  EnterShip = 5, // payload should contain ship id (number)
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
