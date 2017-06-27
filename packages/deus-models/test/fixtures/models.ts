function randomId() {
    return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

export const getExampleModel = (id?: string) => ({
    _id: id || randomId(),
    memory: [
        {
            title: "Название воспоминания №1",
            text: "Какие-то воспоминания о хрен знает чем...",
            url: "http://link-to-local-server.local/url"
        },
        {
            title: "Название воспоминания №2",
            url: "http://link-to-local-server.local/url2"
        }
    ],
    firstName: "Имя",
    lastName: "Фамилия",
    skills: [],
    sex: "male",
    corporation: "Skynet",
    hp: 4,
    maxHp: 5,
    mind: {
        "A": [0, 1, 2, 3, 2, 1],
        "B": [0, 1, 2, 3],
        "C": [1, 2, 4]
    },
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
            id: "HeartHealthBooster",
            displayName: "Мотор для сердца +2 HP",
            class: "mechanical",
            system: "CardioSystem",
            effects: [
                {
                    id: "demoEffect",
                    class: "physiology",
                    type: "normal",
                    handler: "demoImplantEffect",
                    enabled: true
                }
            ],
            enabled: true,
            mID: "85a5746cddd447379992d8181a52f4fd"
        },
        {
            id: "_Default",
            displayName: "Default actions",
            class: "defaults",
            effects: [
                {
                    id: "illnessStageShow",
                    class: "physiology",
                    type: "normal",
                    handler: "illnessStageShow",
                    enabled: true
                }
            ],
            enabled: true,
            mID: "xxxxxxxxxxxxxxxxxxxxxxxxxxx"
        },
    ],
    "age": 17,
    "timers": []
});
