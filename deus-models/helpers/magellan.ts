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