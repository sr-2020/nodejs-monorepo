import { duration } from 'moment';

export const MAX_HISTORY_LINES = 30;
export const MAX_POSSIBLE_HP = 6;
export const AURA_LENGTH = 20;

export const kIWillSurviveModifierId = 'i-will-survive-modifier';
export const kActiveAbilitiesDisabledTimer = 'no-active-abilities-timer';

export const kHungerTimerName = 'normal-hunger';
export const kHungerTimerDuration = duration(12, 'hours').asMilliseconds();
export const kHungerTimerStage1Description = 'Голодный обморок';
export const kHungerTimerStage2Description = 'Смерть от голода';
