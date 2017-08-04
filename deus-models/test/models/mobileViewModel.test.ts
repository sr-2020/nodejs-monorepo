import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';


async function getViewModel(model: any) {
    return (await process(model, [])).viewModels.default;
}

function getRobotViewModel() {
    let x = {
        _id: "1000",
        timestamp: 0,
        general: {
            maxSecondsInVr: 1200
        },
        menu: {
            characterName: "Джон Смит"
        },
        toolbar: {
            hitPoints: 4,
            maxHitPoints: 4
        },
        passportScreen: {
            id: "1000",
            fullName: "Джон Смит",
            corporation: "Корпорация Pan American Sunrise Technology Corp.",
            email: "john.smith@alice.digital",
            insurance: "Pan American Sunrise Technology Corp., Уровень: 1"
        },
        pages: [
            {
                "__type": "ListPageViewModel",
                "viewId": "page:general",
                "menuTitle": "Общая информация",
                "body": {
                    "title": "Общая информация",
                    "items": [
                        {
                            "text": "Тип системы:",
                            "value": "Андроид Sex-droid"
                        },
                        {
                            "text": "Имя",
                            "value": "Джон Смит"
                        },
                        {
                            "text": "ID",
                            "value": "1000"
                        },
                        {
                            "text": "e-mail",
                            "value": "john.smith@alice.digital"
                        },
                        {
                            "text": "Пол",
                            "value": "мужской"
                        },
                        {
                            "text": "Создатель",
                            "value": "Господь Бог"
                        },
                        {
                            "text": "Владелец",
                            "value": "ничей"
                        },
                        {
                            "text": "Проживание",
                            "value": "Жилые комплексы PanAm"
                        },
                        {
                            "text": "Hit Points",
                            "value": "4 / 4",
                            "percent": 100
                        }
                    ]
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:memory",
                "menuTitle": "Воспоминания",
                "body": {
                    "title": "Воспоминания",
                    "items": [
                        {
                            "text": "Название воспоминания №1",
                            "details": {
                                "header": "Название воспоминания №1",
                                "text": "<p>Какие-то воспоминания о хрен знает чем...</p><p><a href=\"http://link-to-local-server.local/url\">http://link-to-local-server.local/url</a></p>"
                            }
                        },
                        {
                            "text": "Название воспоминания №2",
                            "details": {
                                "header": "Воспоминание",
                                "text": "<p>Название воспоминания №2.</p><p><a href=\"http://link-to-local-server.local/url2\">http://link-to-local-server.local/url2</a></p>"
                            }
                        }
                    ]
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:conditions",
                "menuTitle": "Состояния",
                "body": {
                    "title": "Ваши состояния",
                    "items": [
                        {
                            "viewId": "id:demoState",
                            "text": "Тестовое постоянное состояние!",
                            "tag": "Физиология",
                            "icon": "physiology",
                            "details": {
                                "header": "Состояние",
                                "text": "Тестовое постоянное состояние!"
                            }
                        }
                    ],
                    "filters": [
                        "Физиология",
                        "Психология"
                    ]
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:implants",
                "menuTitle": "Прошивки",
                "body": {
                    "title": "Прошивки",
                    "items": []
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:changes",
                "menuTitle": "Изменения",
                "body": {
                    "title": "Изменения",
                    "items": [
                        {
                            "viewId": "mid:4485090f-55a3-4d4f-8218-d0ca57fae110",
                            "text": "Включен имплант",
                            "unixSecondsValue": 1483229,
                            "details": {
                                "header": "Изменение",
                                "text": "Включен имплант"
                            }
                        }
                    ]
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:messages",
                "menuTitle": "Сообщения",
                "body": {
                    "title": "Сообщения",
                    "items": [
                        {
                            "viewId": "mid:00000000-1111-2222-3333-444444444444",
                            "text": "Важная информация!",
                            "details": {
                                "header": "Важная информация!",
                                "text": "42"
                            }
                        }
                    ]
                }
            }
        ]
    }
    return x;
}

function getProgramViewModel() {
    let x = {
        _id: "1000",
        timestamp: 0,
        general: {
            maxSecondsInVr: 1200
        },
        menu: {
            characterName: "Джон Смит"
        },
        toolbar: {
            hitPoints: 4,
            maxHitPoints: 4
        },
        passportScreen: {
            id: "1000",
            fullName: "Джон Смит",
            corporation: "Корпорация Pan American Sunrise Technology Corp.",
            email: "john.smith@alice.digital",
            insurance: "Pan American Sunrise Technology Corp., Уровень: 1"
        },
        pages: [
            {
                "__type": "ListPageViewModel",
                "viewId": "page:general",
                "menuTitle": "Общая информация",
                "body": {
                    "title": "Общая информация",
                    "items": [
                        {
                            "text": "Тип системы:",
                            "value": "Программа",
                        },
                        {
                            "text": "Имя",
                            "value": "Джон Смит"
                        },
                        {
                            "text": "ID",
                            "value": "1000"
                        },
                        {
                            "text": "e-mail",
                            "value": "john.smith@alice.digital"
                        },
                        {
                            "text": "Создатель",
                            "value": "Господь Бог"
                        },
                        {
                            "text": "Владелец",
                            "value": "ничей"
                        }
                    ]
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:memory",
                "menuTitle": "Воспоминания",
                "body": {
                    "title": "Воспоминания",
                    "items": [
                        {
                            "text": "Название воспоминания №1",
                            "details": {
                                "header": "Название воспоминания №1",
                                "text": "<p>Какие-то воспоминания о хрен знает чем...</p><p><a href=\"http://link-to-local-server.local/url\">http://link-to-local-server.local/url</a></p>"
                            }
                        },
                        {
                            "text": "Название воспоминания №2",
                            "details": {
                                "header": "Воспоминание",
                                "text": "<p>Название воспоминания №2.</p><p><a href=\"http://link-to-local-server.local/url2\">http://link-to-local-server.local/url2</a></p>"
                            }
                        }
                    ]
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:changes",
                "menuTitle": "Изменения",
                "body": {
                    "title": "Изменения",
                    "items": [
                        {
                            "viewId": "mid:4485090f-55a3-4d4f-8218-d0ca57fae110",
                            "text": "Включен имплант",
                            "unixSecondsValue": 1483229,
                            "details": {
                                "header": "Изменение",
                                "text": "Включен имплант"
                            }
                        }
                    ]
                }
            },
            {
                "__type": "ListPageViewModel",
                "viewId": "page:messages",
                "menuTitle": "Сообщения",
                "body": {
                    "title": "Сообщения",
                    "items": [
                        {
                            "viewId": "mid:00000000-1111-2222-3333-444444444444",
                            "text": "Важная информация!",
                            "details": {
                                "header": "Важная информация!",
                                "text": "42"
                            }
                        }
                    ]
                }
            }
        ]
    }
    return x;
}

describe("mobileViewModel", () => {
    it("_view doesn't produce null or undefined fields", async function() {
        const model = getExampleModel();
        const viewModel = await getViewModel(model);
        expect(viewModel).to.be.deep.equal(JSON.parse(JSON.stringify(viewModel)));
        expect(viewModel).to.have.property("_id");
        expect(viewModel).to.have.property("timestamp");

        //console.log(JSON.stringify(viewModel, null, 4));
    });

     it("_view for robot is not so complicated", async function() {
        let  model = getExampleModel("1000");
        model.model = "Sex-droid";
        model.profileType = "robot";
        model.owner = "ничей";
        model.creator = "Господь Бог";
        const viewModel = await getViewModel(model);
        expect(viewModel).to.be.deep.equal(getRobotViewModel());
    });

    it("_view for programs is really dumb", async function() {
        let  model = getExampleModel("1000");
        
        model.profileType = "program";
        model.owner = "ничей";
        model.creator = "Господь Бог";
        const viewModel = await getViewModel(model);
        expect(viewModel).to.be.deep.equal(getProgramViewModel());
    });

    it("Start Illness and check illness life path", async function() {
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'start-illness', data: { id: "arthritis" } }], model.timestamp + 100);
        let { baseModel, workingModel } = await process(model, events);

        printModel(workingModel.conditions);

        let illness = baseModel.modifiers.find( (m:any) => m.id == "arthritis");
        expect(illness).is.exist;

        let cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-0");
        expect(cond).is.exist;

        console.log("================= Stage 0 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 7210*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        let viewModel = await getViewModel(model);
        let body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 1 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 5410*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

         viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 2 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 3610*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

         viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 3 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 2710*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 4 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 1810*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 5 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 910*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 6 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 610*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);
    });
});
