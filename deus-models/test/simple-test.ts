import { clearDB, cteateExampleModel, sendEvent, getWorkModel, prepareConnections, clearConnections, testHelper } from './helpers/models-tests-helpers';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
var expect = chai.expect;
var assert = chai.assert;

chai.should();

describe('Testing model API', function () {
    this.timeout(10000);

    before( function() {
        prepareConnections();
    });

    after( function() {
        clearConnections();
    });

    beforeEach("Clearing & Preparing DB", function() {
        return clearDB().then( (x) => cteateExampleModel() );
    });

    it("Event 'usePill', effect: +2HP", function() {
        let eventData = { id: "3a0867ad-b9c9-4d6e-bc3e-c9c250be0ec3" };

        return assert.eventually.propertyVal(  sendEvent("usePill",eventData), 'hp', 6 )
    });

    it("Event 'usePill', effect: add implant", function() {
        let eventData = { id: "f1c4c58e-6c30-4084-87ef-e8ca318b23e7" };

        return sendEvent("usePill",eventData).then( (model) => {
            expect(model.modifiers.findIndex( (e:any) => {return e.id == "TestImplant01"} )).to.not.equal(-1);
        });
    });

    it("Event 'usePill', effect: implant enable", function() {
        let eventData = { mID: "85a5746cddd447379992d8181a52f4fd" };

        return sendEvent("disableImplant",eventData).then( (model) => {
            let implant = model.modifiers.find( (e:any) => {return e.mID == "85a5746cddd447379992d8181a52f4fd"} );
            expect(implant.enabled).to.equal(false);
        });
    });

});

describe('Testing modifiers effects', function () {
    this.timeout(10000);

    before( function() {
        prepareConnections();
        return clearDB().then( (x) => cteateExampleModel() );
    });

    after( function() {
        clearConnections();
    });

    it("Modifier's effect 'demoEffect' add condition to work model", function() {
        return sendEvent("","").then( (model) => {
             expect(model.conditions.findIndex( (e:any) => {return e.id == "demoImplantState"} )).to.not.equal(-1);
        });
    });

});

describe('Testing illness model', function () {
    this.timeout(10000);

    before( function() {
        prepareConnections();
        return clearDB().then( (x) => cteateExampleModel() );
    });

    after( function() {
        clearConnections();
    });

    it("Event 'usePill', effect: add illness", function() {
        let eventData = { id: "dad38bc7-a67c-4d78-895d-975d128b9be8" };

        return sendEvent("usePill",eventData).then( (model) => {
            expect(model.modifiers.findIndex( (e:any) => {return e.id == "anthrax"} )).to.not.equal(-1);
        });
    });

    it("Illness: start stage == 0", function() {
        return getWorkModel().then( (model) => {
            let ill = model.modifiers.find( (e:any) => {return e.id == "anthrax"} );
            expect(ill.currentStage).is.equal(0);
        })
    });

    it("Illness: start condition", function() {
        return getWorkModel().then( (model) => {
            let cond = model.conditions.find( (e:any) => {return e.id == "illCond01"} );
            expect(cond).is.not.equal(null);
        })
    });


    it("Illness second stage after 5 sec == 1",  function() {
        return (new Promise((resolve)=>{
            setTimeout(() => {
                resolve('ok');
            }, 5500);
        }))
        .then( (x) =>  sendEvent("","") )
        .then( (model) => {
            let ill = model.modifiers.find( (e:any) => {return e.id == "anthrax"} );
            expect(ill.currentStage).is.equal(1);
        });
    });

    it("Illness: second stage condition", function() {
        return getWorkModel().then( (model) => {
            let cond = model.conditions.find( (e:any) => {return e.id == "illCond02"} );
            expect(cond).is.not.equal(null);
        })
    });

    it("Illness second stage after 11 sec == 2",  function() {
        return (new Promise((resolve)=>{
            setTimeout(() => {
                resolve('ok');
            }, 6500);
        }))
        .then( (x) =>  sendEvent("","") )
        .then( (model) => {
            let ill = model.modifiers.find( (e:any) => {return e.id == "anthrax"} );
            expect(ill.currentStage).is.equal(2);
        });
    });
});
