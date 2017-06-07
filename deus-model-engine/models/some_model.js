function getRussianSex(englishSex) {
    switch (englishSex) {
        case "male":    return "мужской";
        case "female":  return "женский";
        default:        return englishSex;
    }
}

function getHandicaps(data) {
    if (data.length > 0) {
        return data.join(", ");
    } else {
        return "—";
    }
}

function getStartPage(model) {
    return {
        pageType: "list",
        menuTitle: "Главное",
        body: {
            title: "Общая информация",
            items: [
                {
                    text: "Имя",
                    value: model.firstName + " " + model.lastName,
                },
                {
                    text: "ID",
                    value: model.characterId,
                },
                {
                    text: "Пол",
                    value: getRussianSex(model.sex),
                },
                {
                    text: "Возраст",
                    value: model.age,
                },
                {
                    text: "Сумма на счёте",
                    value: model.balance,
                },
                {
                    text: "Корпорация",
                    value: model.corporation,
                },
                {
                    text: "Hit Points",
                    value: model.hp,
                    percent: 100 * model.hp / model.maxHp,
                },
                {
                    text: "Ограничения движения",
                    value: getHandicaps(model.handicaps),
                },
            ],
        },
    };
}

function getMemoryPageItem(data) {
    let textPieces = [];
    if (data.text) textPieces.push(data.text);
    if (data.url) textPieces.push(data.url);
    return {
        text: data.title,
        details: {
            header: data.title,
            text: textPieces.join("\n"),
        },
    };
}

function getMemoryPage(model) {
    return {
        pageType: "list",
        menuTitle: "Память",
        body: {
            title: "Воспоминания",
            items: model.memory.map(getMemoryPageItem),
        },
    };
}

// TODO: Can new systems be added dynamically?
function getBodyPage(model) {
    let systems = model.systems;
    return {
        pageType: "list",
        menuTitle: "Тело",
        body: {
            title: "Физиологические системы",
            items: [
                {
                    text: "Нервная система",
                    value: systems.NervousSystem,
                },
                {
                    text: "Сердечно-сосудистая система",
                    value: systems.CardioSystem,
                },
                {
                    text: "Руки",
                    value: systems.Hands,
                },
                {
                    text: "Ноги",
                    value: systems.Legs,
                },
            ],
        },
    };
}

function getPages(model) {
    return [
        getStartPage(model),
        // TODO: Add insurance
        getMemoryPage(model),
        getBodyPage(model),
        // TODO: Add modifiers
    ];
}

function getToolbar(model) {
    return {
        hitPoints: model.hp,
    };
}


module.exports = () => {
    return {
        add(data) {
            let {value} = data;
            this.debug('add %d', value);
            this.update('value', (oldValue) => oldValue + Number(value));
        },

        mul(data) {
            let {value} = data;
            this.debug('times %d', value);
            this.update('value', (oldValue) => oldValue * Number(value));
        },

        concat(data) {
            let {value} = data;
            this.update(value, (oldValue) => '' + oldValue + value);
        },

        delayedConcat(data) {
            let {value, delay} = data;
            this.setTimer('value', 'concat', { value });
        },

        _view(model, viewModel) {
            return {
                _id: model.characterId,
                toolbar: getToolbar(model),
                pages: getPages(model),
            };
        }
    };
};
