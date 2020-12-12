import { Modifier } from '@alice/alice-common/models/alice-model-engine';

export type ModifierWithAmount = Modifier & { amount: number };
export type TemporaryModifier = Modifier & { validUntil: number };
export type TemporaryModifierWithAmount = ModifierWithAmount & TemporaryModifier;
