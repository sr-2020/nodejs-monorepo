import { Modifier } from '@alice/interface/models/alice-model-engine';

export type ModifierWithAmount = Modifier & { amount: number };
export type TemporaryModifier = Modifier & { validUntil: number };
export type TemporaryModifierWithAmount = ModifierWithAmount & TemporaryModifier;
