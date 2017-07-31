import { expect } from 'chai';
import { AliceExporter } from '../src/alice-exporter';
import { CatalogsLoader } from '../src/catalogs-loader';

import { testCharData01 } from './test-char1';
import { metadata } from './test-metadata';

describe("Model Creation", () => {
    let ex = new AliceExporter(testCharData01, metadata, new CatalogsLoader());

    it("_id, login, password, mail", () => {
        expect(ex.model._id).is.equal('4407');
        expect(ex.account._id).is.equal('4407');
        expect(ex.account.login).is.equal("nagato.dziro");
        expect(ex.model.mail).is.equal("nagato.dziro@alice.digital");
    })

    it("generation, profileType, sex", () => {
        expect(ex.model.generation).is.equal('Z');
        expect(ex.model.profileType).is.equal('human');
        expect(ex.model.sex).is.equal('male');
    });

    it("corporation, salaryLevel, insurance", () => {
        expect(ex.model.corporation).is.equal('Компания Kintsugi Corp');
        expect(ex.model.salaryLevel).is.equal(2);
        expect(ex.model.insurance).is.equal('Serenity');
        expect(ex.model.insuranceLevel).is.equal(3);
        expect(ex.model.insuranceDiplayName).is.equal('Serenity / Kintsugi Group, Уровень: 3');
    });

    it("Mind Model", () => {
        console.log(JSON.stringify(ex.model.mind));

        let lines = ["A", "B", "C", "D", "E", "F"];
        let lineLen = [3, 10, 8, 9, 7, 4]

        let flag = false;

        lines.forEach((l, i) => {
            expect(ex.model.mind[l]).is.a("array");
            expect(ex.model.mind[l].length).is.equal(lineLen[i]);


            ex.model.mind[l].forEach((e: any, j: number) => {

                if ((ex.model.generation == "W") && (l == "D") && (j == 4)) {
                    expect(e).is.within(60, 69);
                } else if ((ex.model.generation == "Z") && (l == "D") && (j == 5)) {
                    flag = true;  //Проверить именно наш случай
                    expect(e).is.within(30, 39);
                } else if ((ex.model.generation == "A") && (l == "C") && (j == 6)) {
                    expect(e).is.within(30, 39);
                } else if ((ex.model.generation == "A") && (l == "E") && (j == 1)) {
                    expect(e).is.within(60, 69);
                } else {
                    expect(e).is.within(40, 59);
                }
            });
        });

        expect(flag).is.true;
    });

    it("Genome", () => {
        console.log(JSON.stringify(ex.model.genome));
        expect(ex.model.genome).is.not.null;
        expect(ex.model.genome).is.a("array");
        expect(ex.model.genome.length).is.equal(13);

        expect(ex.model.genome.slice(0, 6)
            .reduce((a, cur) => a += cur))
            .is.equal(3, "Number of bad genes for gen Z");

        ex.model.genome.slice(6, 6).forEach((e) => {
            expect(e).is.within(0, 2);
        });
    });

    it("Memories", () => {
        expect(ex.model.memory).is.a("array");
        expect(ex.model.memory.length).is.equal(2);

        const mem0 = "Вокруг темно, а я размазываю слёзы по своему лицу. Всё самое лучшее достаётся моему брату, любовь родителей, игрушки, награды. Лучше бы его не было.";
        const mem1 = "Я вижу застывшую маску умиротворения на лице своего покойного брата. Мне стыдно за свои эгостичные желания. В его смерти нет моей вины, но я продолжаю испытывать жгучее ощущение стыда.";

        expect(ex.model.memory[0].title).is.equal(mem0.substr(0, 60) + '...');
        expect(ex.model.memory[0].text).is.equal(mem0);

        expect(ex.model.memory[1].title).is.equal(mem1.substr(0, 60) + '...');
        expect(ex.model.memory[1].text).is.equal(mem1);
    });

    it("hackingLogin and hackingProtection", () => {
        expect(ex.model.hackingProtection).is.equal(2);
    });

    it("maxHp and hp", () => {
        expect(ex.model.hp).is.equal(2);
        expect(ex.model.maxHp).is.equal(2);
    });
})
