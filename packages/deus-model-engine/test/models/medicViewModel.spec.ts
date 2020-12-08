import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getRefreshEvent } from '../fixtures/events';

describe('Meidc and Mind ViewModel Generation', () => {
  let result: any = null;

  beforeEach(async function () {
    const model = getExampleModel('1234');
    const events = getRefreshEvent(model.modelId);
    result = (await process(model, [events])).viewModels.medic_viewmodel;
  });

  it('Creation and _id, login, generation', async function () {
    console.log(JSON.stringify(result));
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('modelId', '1234');

    expect(result).toHaveProperty('login', 'john.smith');
    expect(result).toHaveProperty('generation', 'W');
  });

  it('genome', async function () {
    //genome
    expect(result).toHaveProperty('genome');
    expect(result.genome).toBeInstanceOf(Array);
    expect(result.genome[10]).toBe(2);
  });

  it('medical systems', async function () {
    expect(result).toHaveProperty('systems');
    expect(result.genome).toBeInstanceOf(Array);
    expect(result.systems.length).toBe(6);
    expect(result.systems[3]).toBe(1);
  });

  it('memory', async function () {
    //api.model.memory
    expect(result).toHaveProperty('memory');
    expect(result.genome).toBeInstanceOf(Array);
    expect(result.memory[0].title).toBe('Название воспоминания №1');
    expect(result.memory[1].url).toBe('http://link-to-local-server.local/url2');
  });

  it('mind', async function () {
    //api.model.mind
    expect(result).toHaveProperty('mind');
    expect(result.mind).toBeInstanceOf(Object);

    expect(result.mind).toHaveProperty('A');
    expect(result.mind).toHaveProperty('F');
    expect(result.mind['A'][2]).toBe(56);
    expect(result.mind['C'][4]).toBe(55);
    expect(result.mind.F[3]).toBe(56);
  });

  it('base-model mind', async function () {
    //api.model.mind
    expect(result).toHaveProperty('mindBase');
    expect(result.mindBase).toBeInstanceOf(Object);

    expect(result.mindBase).toHaveProperty('A');
    expect(result.mindBase).toHaveProperty('F');
    expect(result.mindBase['A'][2]).toBe(56);
    expect(result.mindBase['C'][4]).toBe(55);
    expect(result.mindBase.F[3]).toBe(56);
  });

  // it("print out view model", async function() {
  //     console.log(JSON.stringify(result, null, 4));
  // });
});
