import { ViewModelApiInterface } from "deus-engine-manager-api";
import consts = require('../helpers/constants');
import { hasMobileViewModel, hasMedicViewModel } from "../helpers/view-model-helper";

interface PageViewModel {
  menuTitle: string;
  __type: string;
  viewId: string;
}


interface Row {
    text: string,
    value: string,
    percent?: number,
    valueColor?: string
};

function getCharacterName(model) {
    return model.firstName + " " + model.lastName;
}

function getRussianSex(sex) {
    switch (sex) {
        case "male": return "мужской";
        case "female": return "женский";
        case "agender": return "агендер";
        default: return "---";
    }
}

function getHandicaps(model) {
    if (model.hp == 0) {
        return "только лежать";
    } else {
        return "";
    }
}

function getStartPage(model) {
    let isHuman = model.profileType == "human";
    let isProgram = model.profileType == "program";
    let isExHumanProgram = model.profileType == "exhuman-program";
    let isRobot = model.profileType == "robot";
    let isExHumanRobot = model.profileType == "ex-human-robot";

    const items: Row[] = [
        {
            text: "Имя",
            value: getCharacterName(model),
        },
        {
            text: "ID",
            value: model._id,
        },
        {
            text: "e-mail",
            value: model.mail,
        },

    ];

    let pageInfo = {
        __type: "ListPageViewModel",
        viewId: "page:general",
        menuTitle: "Общая информация",
        body: {
            title: "Общая информация",
            items: items
        },
    };

    if (!isProgram && !isExHumanProgram) {
        pageInfo.body.items.push({ text: "Пол", value: getRussianSex(model.sex) });
    }

    if (!model.isAlive) {
        pageInfo.body.items.unshift({
            text: "Состояние персонажа", value: "Вы мертвы!", valueColor: "#ff565c"
        });
    }

    if (isRobot) {
        pageInfo.body.items.unshift({ text: "Тип системы:", value: `Андроид ${model.model}` });
    }

    if (isExHumanRobot) {
        pageInfo.body.items.unshift({ text: "Тип системы:", value: model.model });
    }

    if (isProgram || isExHumanProgram) {
        pageInfo.body.items.unshift({ text: "Тип системы:", value: "Программа" });
    }

    if (model.profileType == "robot" || isProgram) {
        pageInfo.body.items.push({ text: "Создатель", value: model.creator })
        pageInfo.body.items.push({ text: "Владелец", value: model.owner })
    }

    if (isHuman) {
        pageInfo.body.items.push({ text: "Поколение", value: model.generation })
    }

    if (!isProgram && !isExHumanProgram) {
        pageInfo.body.items.push({ text: "Проживание", value: model.sweethome })
    }

    let workRow = {
        text: "Работа",
        value: model.corporation,
    };

    let insuranceRow = {
        text: "Страховка",
        value: model.insuranceDiplayName
    };

    if (isHuman || isExHumanProgram || isExHumanRobot) {
        pageInfo.body.items.push(workRow);
        pageInfo.body.items.push(insuranceRow);
    }

    if (!isProgram && !isExHumanProgram) {

        let hpRow: Row = {
            text: "Hit Points",
            value: model.hp + " / " + model.maxHp,
            percent: 0,
        };

        if (model.maxHp) {
            hpRow.percent = 100 * model.hp / model.maxHp
        }

        if (model.hp == 0) {
            hpRow.valueColor = "#ff565c";
        }

        pageInfo.body.items.push(hpRow);
    }

    let illnesses = model.modifiers.filter(e => e.class == "illness" && e.currentStage > 2);

    if (illnesses && illnesses.length) {
        pageInfo.body.items.push({
            text: "Внимание!",
            value: "Больно и плохо, врача!",
            valueColor: "#ff565c",
            percent: 100
        });
    }
    else if (isHuman) {
        pageInfo.body.items.push({
            text: "Инфо:",
            value: "Проверяй ALICE часто",
        });

    }

    let handicaps = getHandicaps(model);
    if (handicaps) {
        pageInfo.body.items.push({
            text: "Ограничения движения",
            value: getHandicaps(model),
            valueColor: "#ff565c"
        })
    }

    return pageInfo;
}


function getRussianConditionTag(tag) {
    switch (tag) {
        case "physiology": return "Физиология";
        case "mind": return "Психология";
        default: return "Физиология";
    }
}

function getConditionsPageItem(cond) {
    let header = cond.text;
    let details = cond.details ? cond.details : header;
    let condClass = cond.class ? cond.class : "physiology";

    if (details == header || details == (header + ".")) {
        header = "Состояние";
    }

    return {
        viewId: "id:" + cond.id,
        text: cond.text,
        tag: getRussianConditionTag(condClass),
        icon: condClass,
        details: {
            header,
            text: details
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

function getMemoryPageItem(mem) {
    let header = mem.title;

    if (mem.text == mem.title || mem.text == (mem.title + ".")) {
        header = "Воспоминание";
    }

    let details = "";
    if (mem.text) details += `<p>${mem.text.replace(/\s/g, ' ')}</p>`;
    if (mem.url) details += `<p><a href="${mem.url}">${mem.url}</a></p>`

    return {
        text: mem.title,
        details: {
            header: header,
            text: details
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

function getBodyPage(model) {
    const items: any[] = [];
    let result = {
        __type: "ListPageViewModel",
        menuTitle: "Доктор Хаус",
        viewId: "page:body",
        body: {
            title: "Доктор Хаус",
            items
        },
    };
    for (let i = 0; i < consts.medicSystems.length; ++i) {
        result.body.items.push({
            viewId: "mid:" + consts.medicSystems[i].name,
            text: consts.medicSystems[i].label,
            value: model.systems[i].toString()
        });
    }
    return result;
}

function getChangesPageItem(change) {
    return {
        viewId: "mid:" + change.mID,
        text: change.text,
        unixSecondsValue: Math.round(change.timestamp / 1000),
        details: {
            header: "Изменение",
            text: change.text
        }
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

function getPages(model) {
    let pages: PageViewModel[] = [];


    pages.push(getStartPage(model));
    pages.push(getMemoryPage(model));

    pages.push(getConditionsPage(model));
    pages.push(getBodyPage(model));

    pages.push(getEconomyPage());

    pages.push(getChangesPage(model));

    if (model.hasOwnProperty("showTechnicalInfo") && model.showTechnicalInfo) {
        pages.push(getTechnicalInfoPage());
    }

    return pages;
}

// General characteristics not tied to any page or UI element.
function getGeneral(model) {
    return {
    };
}

function getMenu(model) {
    return {
        characterName: getCharacterName(model),
    };
}

function getToolbar(model) {
    let ret = {
        hitPoints: model.hp,
        maxHitPoints: model.maxHp,
    };

    if (model.maxHp == 0) {
        ret.maxHitPoints = 1;
    }

    return ret;
}

function getPassportScreen(model) {
    return {
        id: model._id,
        fullName: model.firstName + " " + model.lastName,
        corporation: model.corporation ? model.corporation : "",
        email: model.mail ? model.mail : "",
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

module.exports = () => {
    return {
        _view(api: ViewModelApiInterface, model) {
            if (hasMobileViewModel(model)) {
                try {
                    return getViewModel(model);
                }
                catch (err) {
                    // The app would display error message when ViewModel is incorrect
                    console.error(err);
                    return {};
                }
            } else if (hasMedicViewModel(model)) {
                return model
            } else
                return undefined;
        }
    };
};
