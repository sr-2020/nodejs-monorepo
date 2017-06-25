import { clearDB, cteateExampleModel, sendEvent, getWorkModel, prepareConnections, clearConnections, testHelper } from './helpers/models-tests-helpers';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
var expect = chai.expect;
var assert = chai.assert;

chai.should();

describe('Testing model API', function () {
    this.timeout(7000);

    before( function() {
        prepareConnections();
    });

    after( function() {
        clearConnections();
    });

    beforeEach("Clearing & Preparing DB", function() {
        return clearDB().then( (x) => cteateExampleModel() );
    });

    // it('send event testing',  function() {
    //    return assert.eventually.propertyVal( sendEvent("",null), '_id', '1111' );
    // });

    it('Test usePill +2HP', function() {
        let eventData = { id: "3a0867ad-b9c9-4d6e-bc3e-c9c250be0ec3" };

        return assert.eventually.propertyVal(  sendEvent("usePill",eventData), 'hp', 6 )
    });

    it('Test add implant pill', function() {
        let eventData = { id: "f1c4c58e-6c30-4084-87ef-e8ca318b23e7" };

        return sendEvent("usePill",eventData).then( (model) => {
            expect(model.modifiers.findIndex( (e:any) => {return e.id == "HeartHealthBooster"} )).to.equal(0);
        });
    });


    // it('should be TestHelperString', function() {
    //     let result = testHelper();
    //     expect(result).to.equal("Test Helper String");
    // });
});

