import * as helpers from '../../helpers/model-helper.js'; 
import { expect } from 'chai';

describe('Helpers: ', () => {

    it("Predicates check", function() {

        expect( helpers().checkValue("3",">1") ).to.true;
        expect( helpers().checkValue("1","<2") ).to.true;
        expect( helpers().checkValue("9","9") ).to.true;

        expect( helpers().checkValue("12","<3") ).to.false;
        expect( helpers().checkValue("42","43") ).to.false;
        expect( helpers().checkValue("56","32-46") ).to.false;
        expect( helpers().checkValue("38","32-46") ).to.true;
        expect( helpers().checkValue("0",">1") ).to.false;
        expect( helpers().checkValue("50","0-100") ).to.true;
        expect( helpers().checkValue("-1",">1") ).to.false;
        expect( helpers().checkValue("blag",">1") ).to.false;
        expect( helpers().checkValue("10",">0") ).to.true;
        expect( helpers().checkValue("0","0") ).to.true
    });
});    