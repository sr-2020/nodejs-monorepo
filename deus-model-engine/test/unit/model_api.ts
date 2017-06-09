import { expect } from 'chai';
import { Context } from '../../src/context';
import { ModelApiFactory } from '../../src/model_api';

describe.only('ModelApi', () => {
    it('get, set, update', () => {
        let context = new Context({ foo: { bar: 'bar' } }, []);
        let api = ModelApiFactory(context);

        expect(api.get('foo.bar')).to.equal('bar');

        api.set('foo.bar', 'foo');
        expect(api.get('foo.bar')).to.equal('foo');

        api.update('foo.bar', (v) => 'bar');
        expect(api.get('foo.bar')).to.equal('bar');
    });

    it('push', () => {
        let context = new Context({ foo: [] }, []);
        let api = ModelApiFactory(context);

        expect(api.get('foo')).to.deep.equal([]);

        api.push('foo', 'bar');
        expect(api.get('foo')).to.deep.equal(['bar']);
    });

    it('getCatalogObject', () => {
        let context = new Context({}, [], { foo: [{ id: 'bar' }] });
        let api = ModelApiFactory(context);

        expect(api.getCatalogObject('foo', 'bar')).to.deep.equal({ id: 'bar' });
    });
});
