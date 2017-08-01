function randomId() {
    return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

export const getExampleModel = (id?: string) => ({
    _id: id || randomId(),
    memory: [
        {
            title: "Название воспоминания №1",
            text: "Какие-то воспоминания о хрен знает чем...",
            url: "http://link-to-local-server.local/url",
            mID: "6acf27a6-fd6e-4477-b526-e1fbe25c416b"
        },
        {
            title: "Название воспоминания №2",
            text: "Название воспоминания №2.",
            url: "http://link-to-local-server.local/url2",
            mID: "82eb411a-51cb-478d-9f90-5f6f52660a0d"
        }
    ],
    skills: [],
    hp: 4,
    maxHp: 4,

    randomSeed: 12345678,

    login: "john.smith",
    mail: "john.smith@alice.digital",
    generation: "W",
    profileType: "human",
    firstName: "Джон",
    nicName: "",
    lastName: "Смит",
    sweethome: "Жилые комплексы PanAm",
    sex: "male",
    corporation: "Корпорация Pan American Sunrise Technology Corp.",
    salaryLevel: 2,
    insurance: 2057,
    insuranceLevel: 1,
    insuranceDiplayName: "Pan American Sunrise Technology Corp., Уровень: 1",
    hackingLogin: "octopus",
    hackingProtection: 1,
    lockReduction: 100,
    proxyRegen: 100,
    maxProxy: 100,
    maxSecondsInVr: 1200,
    owner: "",
    creator: "",
    isAlive: true,

    lastVREnterTimestamp: 0,
    lastVREnterDuration: 0,
    totalSpentInVR: 0,

    mind: {
        "A": [53, 47, 56],
        "B": [50, 57, 40, 55, 55, 46, 51, 54, 55, 54],
        "C": [56, 49, 41, 43, 55, 53, 46, 41],
        "D": [48, 42, 44, 44, 60, 49, 49, 56, 54],
        "E": [54, 57, 55, 41, 55, 46, 53],
        "F": [47, 58, 41, 56]
    },

    genome: [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0],

    systems: [1, 1, 1, 1, 1, 1],

    timestamp: 0,
    conditions: [
        {
            "id": "demoState",
            "class": "physiology",
            "text": "Тестовое постоянное состояние!",
            "details": "Тестовое постоянное состояние!"
        }
    ],

    password: "P@ssw0rd",
    modifiers: [
        {
            id: "_damage",
            displayName: "internal damage modificator",
            class: "_internal",
            effects: [
                {
                    id: "damage-effect",
                    class: "physiology",
                    type: "normal",
                    handler: "damageEffect",
                    enabled: true
                }
            ],
            damage: 0,
            enabled: true,
            mID: "_internal_damage"
        },
        {
            id: "mindcubes_showdata",
            displayName: "internal mind cube conditions modifier",
            class: "_internal",
            effects: [
                {
                    "id": "show-condition",
                    "class": "physiology",
                    "type": "normal",
                    "handler": "showCondition",
                    enabled: true
                },
            ],
            enabled: true,
            mID: "_internal_mindcubes"
        }
    ],
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
    "timers": []
});
