import { expect } from 'chai';

import { testCharData01 } from './test-char1';
import { testCharData02 } from './test-char2';
import { metadata } from './test-metadata';
import { convertAliceModel } from '../src/alice-model-converter';
import { CharacterParser } from '../src/character-parser';

describe("Model Creation testchar01", () => {

    const character = new CharacterParser(testCharData01, metadata);
    const {model, account, problems} = convertAliceModel(character);

    it("no conversion error", () => {
        expect(problems, `Has conversion problems: ${problems.join(", ")}`).to.be.empty;
    })

    it("model._id", () => {
        expect(model._id).is.equal('20118');
    });

    it("account._id", () => {
        expect(account._id).is.equal('20118');
    });

    it("account.login", () => {
        expect(account.login).is.equal("opalblack");
    });

    it("profileType", () => {
        expect(model.profileType).is.equal('human');
    });

    it("Systems", () => {
        expect(model.systems).is.not.null;
        expect(model.systems.length).is.equal(7);
    });

    it("Managers should have company bonus", () => {
        expect(account.jobs.companyBonus).to.contain('gd');
    });
});

describe("Model Creation testchar02", () => {

    const character = new CharacterParser(testCharData02, metadata);
    const {model, account, problems} = convertAliceModel(character);

    it("no conversion error", () => {
        expect(problems, `Has conversion problems: ${problems.join(", ")}`).to.be.empty;
    })

    it("model._id", () => {
        expect(model._id).is.equal('22718');
    });

    it("account._id", () => {
        expect(account._id).is.equal('22718');
    });

    it("account.login", () => {
        expect(account.login).is.equal("omicron");
    });

    it("profileType", () => {
        expect(model.profileType).is.equal('human');
    });

    it("Systems", () => {
        expect(model.systems).is.not.null;
        expect(model.systems.length).is.equal(7);
    });

    it("Specialists should not have company bonus", () => {
        expect(account.jobs.companyBonus).to.be.empty;
    });
})

