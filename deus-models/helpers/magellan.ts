import { ModelApiInterface } from "deus-engine-manager-api";

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
  
  export interface OrganismModel {
    systems: number[];
    location?: string;
    
    spaceSuit: SpaceSuit;
  }
  
  export function getTypedOrganismModel(api: ModelApiInterface): OrganismModel {
    return api.model;
  }
  