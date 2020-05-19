import { expect } from 'chai';
import 'mocha';
import { Context } from '../../src/context';
import { EventModelApiFactory } from '../../src/model_api';

describe('ModelApi', () => {
  it('getCatalogObject', () => {
    const context = new Context({ modelId: '', timestamp: 0, modifiers: [], conditions: [], timers: [] }, [], { foo: [{ id: 'bar' }] });
    const api = EventModelApiFactory(context);

    expect(api.getCatalogObject<{ id: string }>('foo', 'bar')).to.deep.equal({ id: 'bar' });
  });
});
