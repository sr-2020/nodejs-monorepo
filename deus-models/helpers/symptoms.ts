import { BiologicalSystems, systemsIndices, OrganismModel } from "./magellan";

export enum Symptoms {
  SevereHeadache,
  Faint,
  Tic,
  Headache,
  Dizziness,
  Dyspnea,
  Melancholy,
  Jitters,
  FingertipsTingling,
  Convulsions,
  LimbNumbness,
  Tremor,
  InvoluntaryMovements,
  Hallucinations,
  LowBodyTemperature,
  HardToMove,
  Chills,
  HeartPain,
  Sleepiness,
  DimVision,
  Thirst,
  Nosebleeding,
  Tachycardia,
  HardToBreath,
  HighFever,
  ContinuousPainLowAbdomen,
  Pruritus,
  PainLowBack,
  Bloating,
  PainPushRightAbdomen,
  Weakness,
  Nausea,
  Fever,
  PainWhenMoving,
  SharpAbdomenPain,
  Indigestion,
  PainRightAbdomen,
  PainLeftAbdomen,
  AbdomenDiscomfort,
  AppetiteLoss,
  AbdomenTingling,
  Vomiting,
  ContinuousPainUpperAbdomen,
  Hemoptysis,
  Wheeze,
  Aphonia,
  Cough,
  ThroatPain,
  SoreThroat,
  Hiccough,
  RapidBreathing,
  RunnyNose,
  LightDeafness,
  Blindness,
  Deafness,
  CantMove,
  ColdLimbs,
  BoneAche,
  JointsCreak,
  JointsPain,
  UnsteadyGait,
  SoftTissuesSwelling,
  Blisters,
  InflammationsAbscesses,
  Hives,
  SkinPeeling,
  SkinRedness,
  SkinDarkening,
  NailsDarkening,
  TactileSensitivityLoss,
  HairLoss,

  Death
}

export const systemToSymptoms = new Map<BiologicalSystems, Array<Symptoms>>([
  [BiologicalSystems.Nervous,
  [Symptoms.SevereHeadache, Symptoms.Faint, Symptoms.Tic, Symptoms.Headache, Symptoms.Dizziness, Symptoms.Dyspnea, Symptoms.Melancholy,
  Symptoms.Jitters, Symptoms.FingertipsTingling, Symptoms.Convulsions, Symptoms.LimbNumbness, Symptoms.Tremor, Symptoms.InvoluntaryMovements, Symptoms.Hallucinations]],
  [BiologicalSystems.Cardiovascular,
  [Symptoms.LowBodyTemperature, Symptoms.HardToMove, Symptoms.Chills, Symptoms.Convulsions, Symptoms.HeartPain, Symptoms.Sleepiness, Symptoms.DimVision,
  Symptoms.Thirst, Symptoms.Jitters, Symptoms.Faint, Symptoms.Nosebleeding, Symptoms.Tachycardia, Symptoms.HardToBreath, Symptoms.HighFever]],
  [BiologicalSystems.Reproductive,
  [Symptoms.ContinuousPainLowAbdomen, Symptoms.Chills, Symptoms.Pruritus, Symptoms.PainLowBack, Symptoms.Bloating, Symptoms.DimVision, Symptoms.PainPushRightAbdomen,
  Symptoms.Weakness, Symptoms.Nausea, Symptoms.Thirst, Symptoms.Fever, Symptoms.Faint, Symptoms.PainLowBack, Symptoms.PainWhenMoving]],
  [BiologicalSystems.Digestive,
  [Symptoms.SharpAbdomenPain, Symptoms.Indigestion, Symptoms.Bloating, Symptoms.PainRightAbdomen, Symptoms.PainLeftAbdomen, Symptoms.Thirst, Symptoms.AbdomenDiscomfort,
  Symptoms.AppetiteLoss, Symptoms.AbdomenTingling, Symptoms.PainRightAbdomen, Symptoms.Nausea, Symptoms.PainLowBack, Symptoms.Vomiting, Symptoms.ContinuousPainUpperAbdomen]],
  [BiologicalSystems.Respiratory,
  [Symptoms.Hemoptysis, Symptoms.Wheeze, Symptoms.Aphonia, Symptoms.HardToBreath, Symptoms.Cough, Symptoms.ThroatPain, Symptoms.SoreThroat,
  Symptoms.Hiccough, Symptoms.RapidBreathing, Symptoms.RunnyNose, Symptoms.LightDeafness, Symptoms.Blindness, Symptoms.Deafness, Symptoms.Headache]],
  [BiologicalSystems.Musculoskeletal,
  [Symptoms.CantMove, Symptoms.Convulsions, Symptoms.Tic, Symptoms.Tremor, Symptoms.Chills, Symptoms.ColdLimbs, Symptoms.FingertipsTingling,
  Symptoms.BoneAche, Symptoms.JointsCreak, Symptoms.LimbNumbness, Symptoms.JointsPain, Symptoms.InvoluntaryMovements, Symptoms.PainWhenMoving, Symptoms.UnsteadyGait]],
  [BiologicalSystems.Integumentary,
  [Symptoms.SoftTissuesSwelling, Symptoms.Blisters, Symptoms.InflammationsAbscesses, Symptoms.Hives, Symptoms.Pruritus, Symptoms.SkinPeeling, Symptoms.SkinRedness,
  Symptoms.FingertipsTingling, Symptoms.SkinDarkening, Symptoms.NailsDarkening, Symptoms.FingertipsTingling, Symptoms.TactileSensitivityLoss, Symptoms.HairLoss, Symptoms.Blindness]],
]);

export function getSymptomValue(currentValue: number, nucleotideValue: number) {
  const l = Math.min(0, nucleotideValue);
  const r = Math.max(0, nucleotideValue);
  if (currentValue < l)
    return currentValue - l;

  if (currentValue > r)
    return currentValue - r;

  return 0;
}

export function getSymptomsInternal(currentValues: number[], nucleotideValue: number[]): Set<Symptoms> {
  const result = new Set<Symptoms>();
  for (const indice of systemsIndices()) {
    const v = getSymptomValue(currentValues[indice], nucleotideValue[indice]);
    if (Math.abs(v) > 7) return new Set<Symptoms>([Symptoms.Death]);
    if (v > 0)
      result.add((systemToSymptoms.get(indice) as Symptoms[])[6 + v])
    if (v < 0)
      result.add((systemToSymptoms.get(indice) as Symptoms[])[7 + v])
  }

  return result;
}

export function getSymptoms(model: OrganismModel): Set<Symptoms> {
  return getSymptomsInternal(model.systems, model.nucleotide);
}