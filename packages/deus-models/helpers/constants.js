const DAMAGE_MODIFIER_MID = "_internal_damage";

const HP_LEAK_TIMER = "_hp-leak-timer";
const HP_LEAK_DELAY = 600000;

const MAX_CHANGES_LINES = 30;

const medicSystems = [
    { name: "musculoskeletal", label: "опорно-двигательная", slots: 2},
    { name: "cardiovascular", label: "сердечно-сосудистая", slots: 1},
    { name: "respiratory", label: "дыхательная", slots: 1}, 
    { name: "endocrine", label: "эндокринная", slots: 1}, 
    { name: "lymphatic", label: "лимфатическая", slots: 1},
    { name: "nervous", label: "нервная", slots: 2},
];



module.exports = () => {
    return {
        DAMAGE_MODIFIER_MID,
        medicSystems,
        MAX_CHANGES_LINES,
        HP_LEAK_TIMER,
        HP_LEAK_DELAY
    };
};

