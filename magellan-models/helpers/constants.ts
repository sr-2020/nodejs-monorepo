const DAMAGE_MODIFIER_MID = '_internal_damage';

// Задержка для списания хитов при ранении
const HP_LEAK_DELAY = 600000;
const HP_LEAK_TIMER = '_hp-leak-timer';

// Задержка для регенерации хитов андроидов
const HP_REGEN_DELAY = 10 * 60 * 1000;
const HP_REGEN_TIMER = '_hp-recover-timer';

// Задержка между HP == 0 и смертью
const DEATH_DELAY = 1200 * 1000;
const DEATH_TIMER = '_dead-timer';

const NARCO_TIME_PREFIX = '_narco_timer_';

const MAX_CHANGES_LINES = 30;

// Болезни
const ILLNESS_EFFECT_NAME = 'illness-effect';

// Бессмертие
const S_IMMORTAL_NAME_01 = 's_immortal01';
const S_IMMORTAL_TIMER_NAME = '_s_immortal01_timer';

const medicSystems = [
    { name: 'musculoskeletal', label: 'опорно-двигательная', slots: 2},
    { name: 'cardiovascular', label: 'сердечно-сосудистая', slots: 1},
    { name: 'respiratory', label: 'дыхательная', slots: 1},
    { name: 'endocrine', label: 'эндокринная', slots: 1},
    { name: 'lymphatic', label: 'лимфатическая', slots: 1},
    { name: 'nervous', label: 'нервная', slots: 2},
];

const MAGELLAN_TICK_MILLISECONDS = 20 * 60 * 1000;

export = {
        DAMAGE_MODIFIER_MID,
        medicSystems,
        MAX_CHANGES_LINES,
        HP_LEAK_TIMER,
        HP_LEAK_DELAY,
        HP_REGEN_TIMER,
        HP_REGEN_DELAY,
        DEATH_DELAY,
        DEATH_TIMER,
        NARCO_TIME_PREFIX,
        ILLNESS_EFFECT_NAME,
        S_IMMORTAL_NAME_01,
        S_IMMORTAL_TIMER_NAME,
        MAGELLAN_TICK_MILLISECONDS,
};
