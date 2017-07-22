function getCharacterName(model) {
    return model.firstName + " " + model.lastName;
}

function getRussianSex(sex) {
    switch (sex) {
        case "male":    return "мужской";
        case "female":  return "женский";
        default:        return sex;
    }
}

function getHandicaps(model) {
    if (model.hp == 0) {
        return "только лежать";
    } else {
        return "нет";
    }
}

function getStartPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:general",
        menuTitle: "Общая информация",
        body: {
            title: "Общая информация",
            items: [
                {
                    text: "Имя",
                    value: getCharacterName(model),
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
                    value: model.age + '',
                },
                {
                    text: "Корпорация",
                    value: model.corporation,
                },
                {
                    text: "Hit Points",
                    value: model.hp + " / " + model.maxHp,
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
        viewId: "id:" + cond.id,
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
        __type: "ListPageViewModel",
        viewId: "page:conditions",
        menuTitle: "Состояния",
        body: {
            title: "Ваши состояния",
            items: model.conditions.map(getConditionsPageItem),
            filters: ["Физиология", "Психология"],
        },
    };
}

function getTechnicalInfoPage() {
    return {
        __type: "TechnicalInfoPageViewModel",
        viewId: "page:technicalInfo",
        menuTitle: "Техническая инфа"
    };
}

function getEconomyPage() {
    return {
        __type: "EconomyPageViewModel",
        viewId: "page:economy",
        menuTitle: "Экономика"
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
                    needsQr: false,
                    dangerous: false,
                    data: {
                        mID: modifier.mID,
                    },
                },
                {
                    text: "Отдать гопнику (не работает)",
                    eventType: "giveAway",
                    needsQr: true,
                    dangerous: true,
                    data: {
                        mID: modifier.mID,
                    },
                },
            ],
        },
    };
}

function getImplantsPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:implants",
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
        __type: "ListPageViewModel",
        viewId: "page:memory",
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
        __type: "ListPageViewModel",
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

function getChangesPageItem(change) {
    return {
        viewId: "mid:" + change.mID,
        text: change.text,
    };
}

function getChangesPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:changes",
        menuTitle: "Изменения",
        body: {
            title: "Изменения",
            items: model.changes.reverse().map(getChangesPageItem),
        },
    };
}

function getMessagesPageItem(message) {
    return {
        viewId: "mid:" + message.mID,
        text: message.title,
        details: {
            header: message.title,
            text: message.text,
        },
    };
}

function getMessagesPage(model) {
    return {
        __type: "ListPageViewModel",
        viewId: "page:messages",
        menuTitle: "Сообщения",
        body: {
            title: "Мастерские сообщения",
            items: model.messages.reverse().map(getMessagesPageItem),
        },
    };
}


function getPages(model) {
    let pages = [
        getStartPage(model),
        // TODO: Add insurance
        getMemoryPage(model),
        getConditionsPage(model),
        getImplantsPage(model),
        getEconomyPage(),
        getChangesPage(model),
        getMessagesPage(model),
    ];

    if(model.hasOwnProperty("showTechnicalInfo") && model.showTechnicalInfo){
        pages.push(getTechnicalInfoPage());
    }

    return pages;
}

// General characteristics not tied to any page or UI element.
function getGeneral(model) {
    return {
        maxSecondsInVr: model.maxSecondsInVr
    };
}

function getMenu(model) {
    return {
        characterName: getCharacterName(model),
    };
}

function getToolbar(model) {
    return {
        hitPoints: model.hp,
        maxHitPoints: model.maxHp,
    };
}

function getPassportScreen(model) {
    return {
        id: model._id,
        fullName: model.firstName + " " + model.lastName,
        corporation: model.corporation,
        email: model.mail
    };
}

function getViewModel(model) {
    return {
        _id: model._id,
        timestamp: model.timestamp,
        general: getGeneral(model),
        menu: getMenu(model),
        toolbar: getToolbar(model),
        passportScreen: getPassportScreen(model),
        pages: getPages(model),
    };
}


function setModifierEnabled(modifiers, id, enabled) {
    index = modifiers.findIndex((m) => m.mID == id);
    if (index < 0) {
        return modifiers;
    }
    modifiers[index].enabled = enabled;
    return modifiers;
}


module.exports = () => {
    return {
        _view(api, model) {
            try {
                return getViewModel(model);
            }
            catch(err) {
                // The app would display error message when ViewModel is incorrect
                return {};
            }
        }
    };
};
