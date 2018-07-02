


function randomId() {
    return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

export function getExampleMagellanModel() {
    return require("../../../data_samples/model.json");
}

export function getExampleMedicModel() {
    return require("../../../data_samples/medic-model.json");
}

export const getExampleModel = (id?: string) => ({
    _id: id || randomId(),
    hp: 4,

    randomSeed: 12345678,

    login: "john.smith",
    mail: "john.smith@alice.digital",
    profileType: "human",
    firstName: "Джон",
    nicName: "",
    lastName: "Смит",
    model: "",  //For droids
    sex: "male",
    sweethome: "Жилые комплексы PanAm",
    corporation: "Корпорация Pan American Sunrise Technology Corp.",
    maxSecondsInVr: 1200,
    isAlive: true,

    lastVREnterTimestamp: 0,
    lastVREnterDuration: 0,
    totalSpentInVR: 0,

    spaceSuit: {
        oxygenLeftMs: 0
    },

    systems: [
        {
            value: 1,
            nucleotide: 0,
            lastModified: 0
        },
        {
            value: 1,
            nucleotide: 0,
            lastModified: 0
        },
        {
            value: -1,
            nucleotide: 0,
            lastModified: 0
        },
        {
            value: 1,
            nucleotide: 0,
            lastModified: 0
        },
        {
            value: 0,
            nucleotide: 0,
            lastModified: 0
        },
        {
            value: 1,
            nucleotide: 0,
            lastModified: 0
        },
        {
            value: 1,
            nucleotide: 0,
            lastModified: 0
        }
    ],

    timestamp: 0,
    conditions: [
        {
            "id": "demoState",
            "class": "physiology",
            "text": "Тестовое постоянное состояние!",
            "details": "Тестовое постоянное состояние!"
        }
    ],
    modifiers: [],
    changes: [
        {
            "mID": "4485090f-55a3-4d4f-8218-d0ca57fae110",
            "text": "Включен имплант",
            "timestamp": 1483228800,
        },
    ],
    messages: [
        {
            "mID": "00000000-1111-2222-3333-444444444444",
            "title": "Важная информация!",
            "text": "42"
        },
    ],
    timers: []
});
