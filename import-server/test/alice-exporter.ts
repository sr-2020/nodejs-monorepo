import { expect } from 'chai';
import { AliceExporter } from '../src/alice-exporter';

import { testCharData01 } from './test-char1';
import { metadata } from './test-metadata';

describe("Model Creation", () => {

    const {model, account, conversionProblems} = new AliceExporter(testCharData01, metadata);

    it("no conversion error", () => {
        expect(conversionProblems, `Has conversion problems: ${conversionProblems.join(", ")}`).to.be.empty;
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
})
