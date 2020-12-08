import { allSystemsIndices, System } from '../../helpers/basic-types';
import { getSymptoms, getSymptomValue, Symptoms, systemToSymptoms } from '../../helpers/symptoms';
import { getExampleBiologicalOrganismModel } from '../helpers/example-models';

function makeSystem(value: number, nucleotide: number, lastModified = 0, present = true): System {
  return { value, nucleotide, lastModified, present };
}

describe('Symptoms helper', () => {
  it('Symtoms table have correct number of elements', () => {
    for (const indice of allSystemsIndices()) {
      const symptoms = systemToSymptoms.get(indice);
      expect(symptoms).toBeDefined();
      expect(symptoms).toHaveLength(7 + 7);
    }
  });

  it('getSymptomValue', () => {
    expect(getSymptomValue(makeSystem(0, 0))).toBe(0);
    expect(getSymptomValue(makeSystem(1, 2))).toBe(0);
    expect(getSymptomValue(makeSystem(5, 2))).toBe(3);
    expect(getSymptomValue(makeSystem(-1, 2))).toBe(-1);
    expect(getSymptomValue(makeSystem(0, -4))).toBe(0);
    expect(getSymptomValue(makeSystem(-2, -4))).toBe(0);
    expect(getSymptomValue(makeSystem(-5, -4))).toBe(-1);
    expect(getSymptomValue(makeSystem(3, -4))).toBe(3);
  });

  it('getSymptoms - all symptoms different', () => {
    const model = getExampleBiologicalOrganismModel();
    model.systems = [
      makeSystem(1, 2),
      makeSystem(5, 2),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(3, -4),
    ];
    expect(getSymptoms(model)).toEqual(
      new Set<Symptoms>([Symptoms.Faint, Symptoms.PainPushRightAbdomen, Symptoms.FingertipsTingling, Symptoms.NailsDarkening]),
    );
  });

  it('getSymptoms - some symptoms same', () => {
    const model = getExampleBiologicalOrganismModel();
    model.systems = [
      makeSystem(-6, 2),
      makeSystem(5, 2),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(1, -4),
    ];
    expect(getSymptoms(model)).toEqual(
      new Set<Symptoms>([Symptoms.Faint, Symptoms.PainPushRightAbdomen, Symptoms.FingertipsTingling]),
    );
  });

  it('getSymptoms - death+', () => {
    const model = getExampleBiologicalOrganismModel();
    model.systems = [
      makeSystem(2, 2),
      makeSystem(9, 1),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(1, -4),
    ];
    expect(getSymptoms(model)).toEqual(
      new Set<Symptoms>([Symptoms.Death]),
    );
  });

  it('getSymptoms - death-', () => {
    const model = getExampleBiologicalOrganismModel();
    model.systems = [
      makeSystem(-8, 2),
      makeSystem(5, 1),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(1, -4),
    ];
    expect(getSymptoms(model)).toEqual(
      new Set<Symptoms>([Symptoms.Death]),
    );
  });
});
