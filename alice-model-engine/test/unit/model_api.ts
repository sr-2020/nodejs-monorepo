import { expect } from 'chai';
import { Context } from '../../src/context';
import { ModelApiFactory } from '../../src/model_api';

describe('ModelApi', () => {
    it('getCatalogObject', () => {
        let context = new Context({}, [], { foo: [{ id: 'bar' }] });
        let api = ModelApiFactory(context);

        expect(api.getCatalogObject('foo', 'bar')).to.deep.equal({ id: 'bar' });
    });
});
