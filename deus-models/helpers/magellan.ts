import { ModelApiInterface, Condition, Modifier } from "deus-engine-manager-api";

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
  Integumentary
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

export function colorOfChange(change: number[]): SystemColor | undefined {
  const systemsAffected: Set<BiologicalSystems> = new Set<BiologicalSystems>();
  const systemsNotAffected: Set<BiologicalSystems> = new Set<BiologicalSystems>(systemsIndices());
  change.forEach((v, i) => {
    if (v != 0) {
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

export function systemsIndices(): number[] {
  const result: number[] = [];
  for (const system in BiologicalSystems)
    if (!isNaN(Number(system)))
      result.push(Number(system));

  return result;
}

export interface SpaceSuit {
  oxygenLeftMs: number;
}

export interface System {
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

  firstName: string;
  lastName: string;

  // TODO(aeremin): Do we need mail and corporation?
  mail: string;
  corporation: string;

  location?: string;
  systems: System[];

  spaceSuit: SpaceSuit;
}

export function getTypedOrganismModel(api: ModelApiInterface): OrganismModel {
  return api.model;
}

// TODO(aeremin): Remove
export function isReadyForGame(model: OrganismModel) {
  return Number(model._id) < 9100;
}