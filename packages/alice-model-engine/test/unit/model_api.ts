import { expect } from 'chai';
import 'mocha';
import { Context } from '../../src/context';
import { ModelApiFactory } from '../../src/model_api';

describe('ModelApi', () => {
  it('getCatalogObject', () => {
    const context = new Context({ characterId: '', timestamp: 0 }, [], { foo: [{ id: 'bar' }] });
    const api = ModelApiFactory(context);

    expect(api.getCatalogObject('foo', 'bar')).to.deep.equal({ id: 'bar' });
  });
});
