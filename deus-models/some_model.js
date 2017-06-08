function getRussianSex(sex) {
    switch (sex) {
        case "male":    return "мужской";
        case "female":  return "женский";
        default:        return sex;
    }
}

function getHandicaps(model) {
    if (model.hp == 0) {
        return "тяжелое ранение: только лежать";
    } else {
        return "нет";
    }
}

function getStartPage(model) {
    return {
        pageType: "list",
        menuTitle: "Общая информация",
        body: {
            title: "Общая информация",
            items: [
                {
                    text: "Имя",
                    value: model.firstName + " " + model.lastName,
                },
                {
                    text: "ID",
                    value: model._id,
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
                    value: 0,
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
                    value: getHandicaps(model),
                },
            ],
        },
    };
}

function getRussianConditionTag(tag) {
    switch (tag) {
        case "physiology":  return "Физиология";
        case "mind":        return "Психология";
        default:            return "";
    }
}

function getConditionsPageItem(cond) {
    return {
        text: cond.text,
        tag: getRussianConditionTag(cond.class),
        icon: cond.class,
        details: {
            header: cond.text,
            text: cond.details || "",
        },
    };
}

function getConditionsPage(model) {
    return {
        pageType: "list",
        menuTitle: "Состояния",
        body: {
            title: "Ваши состояния",
            items: model.conditions.map(getConditionsPageItem),
            filters: ["Физиология", "Психология"],
        },
    };
}

function getEnabledText(enabled) {
    return enabled ? "ON" : "OFF";
}

function getEnabledColor(enabled) {
    // TODO: Use magic color provided by the app
    return enabled ? "" : "#FF373F";
}

function getEnableActionText(enabled) {
    return enabled ? "Выключить" : "Включить";
}

function isImplant(modifier) {
    return modifier.class == "mechanical" ||
           modifier.class == "biological";
}

function getImplantDetails(modifier) {
    return modifier.details || ("Имплант " + modifier.displayName);
}

function getImplantsPageItem(modifier) {
    return {
        text: modifier.displayName,
        value: getEnabledText(modifier.enabled),
        valueColor: getEnabledColor(modifier.enabled),
        details: {
            header: modifier.displayName,
            text: getImplantDetails(modifier),
            actions: [
                {
                    text: getEnableActionText(modifier.enabled),
                    eventType: modifier.enabled ? "disableImplant" : "enableImplant",
                    data: {
                        id: modifier.mID,
                    },
                },
            ],
        },
    };
}

function getImplantsPage(model) {
    return {
        pageType: "list",
        menuTitle: "Импланты",
        body: {
            title: "Импланты",
            items: model.modifiers.filter(isImplant).map(getImplantsPageItem),
        },
    };
}

function getMemoryPageItem(mem) {
    let textPieces = [];
    if (mem.text) textPieces.push(mem.text);
    if (mem.url) textPieces.push(mem.url);
    return {
        text: mem.title,
        details: {
            header: mem.title,
            text: textPieces.join("\n"),
        },
    };
}

function getMemoryPage(model) {
    return {
        pageType: "list",
        menuTitle: "Воспоминания",
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
        getConditionsPage(model),
        getImplantsPage(model),
        //getBodyPage(model),
    ];
}

function getToolbar(model) {
    return {
        hitPoints: model.hp,
    };
}

function getViewModel(model) {
    return {
        _id: model._id,
        timestamp: model.timestamp,
        toolbar: getToolbar(model),
        pages: getPages(model),
    };
}


function setModifierEnabled(thisModule, modifiers, mID, enabled) {
    thisModule.error('### setModifierEnabled');
    index = modifiers.findIndex((m) => m.mID == id);
    if (index < 0) {
        thisModule.error('### modifier not found: %s', mID);
        return modifiers;
    }
    thisModule.error('### setting modifier %s enabled to %b', mID, enabled);
    modifiers[index].enabled = enabled;
    return modifiers;
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

        disableImplant(data) {
            let {id} = data;
            this.error('### disableImplant ', id)
            this.update('modifiers', (oldModifiers) => setModifierEnabled(this, oldModifiers, od, false));
        },

        enableImplant(data) {
            let {id} = data;
            this.error('### enableImplant ', id)
            this.update('modifiers', (oldModifiers) => setModifierEnabled(this, oldModifiers, od, true));
        },

        usePill(data) {
            this.debug('Processing usePill');
            this.debug(data);
            this.update('age', (oldValue) => oldValue + 1);
        },
        
        _view(model, viewModel) {
            return JSON.parse(JSON.stringify(getViewModel(model)));
        }
    };
};
