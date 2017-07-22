import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Meidc and Mind ViewModel Generation', () => {
    let result:any = null;

   before(async function() {
        let model = getExampleModel("1234");
        let events = getRefreshEvent(model._id);
        result = (await process(model, [events])).viewModels.medic_viewmodel;
    });


    it("Creation and _id, login, generation", async function() {
        expect(result).is.not.null;
        expect(result).has.nested.property('_id',"1234");

        expect(result).has.nested.property('login',"john.smith");
        expect(result).has.nested.property('generation',"W"); 
    });

    it("genome", async function() {
        //genome
        expect(result).has.nested.property("genome");
        expect(result.genome).is.a("array");
        expect(result.genome[10]).is.equal(2);
    });

    it("memory", async function() {
        //api.model.memory
        expect(result).has.nested.property("memory");
        expect(result.memory).is.a("array");
        expect(result.memory[0].title).is.equal("Название воспоминания №1");
        expect(result.memory[1].url).is.equal("http://link-to-local-server.local/url2");
    });

     it("mind", async function() {
        //api.model.mind
        expect(result).has.nested.property("mind"); 
        expect(result.mind).is.a("object");

        expect(result.mind).has.nested.property("A");
        expect(result.mind).has.nested.property("F");
        expect(result.mind["A"][2]).is.equal(56);
        expect(result.mind["C"][4]).is.equal(55);
        expect(result.mind.F[3]).is.equal(56);
     });

    it("base-model mind", async function() {
        //api.model.mind
        expect(result).has.nested.property("mindBase"); 
        expect(result.mindBase).is.a("object");

        expect(result.mindBase).has.nested.property("A");
        expect(result.mindBase).has.nested.property("F");
        expect(result.mindBase["A"][2]).is.equal(56);
        expect(result.mindBase["C"][4]).is.equal(55);
        expect(result.mindBase.F[3]).is.equal(56);
     });

    it("print out view model", async function() {
        console.log(JSON.stringify(result, null, 4));
    });
});