import { expect } from 'chai';
import { System, systemsIndices } from '../../helpers/magellan';
import { getSymptomsInternal, getSymptomValue, Symptoms, systemToSymptoms } from '../../helpers/symptoms';

function makeSystem(value: number, nucleotide: number, lastModified: number = 0): System {
  return { value, nucleotide, lastModified };
}

describe('Symptoms helper', () => {
  it('Symtoms table have correct number of elements', () => {
    for (const indice of systemsIndices()) {
      const symptoms = systemToSymptoms.get(indice);
      expect(symptoms).to.exist;
      expect(symptoms).to.have.length(7 + 7);
    }
  });

  it('getSymptomValue', () => {
    expect(getSymptomValue(makeSystem(0, 0))).to.equal(0);
    expect(getSymptomValue(makeSystem(1, 2))).to.equal(0);
    expect(getSymptomValue(makeSystem(5, 2))).to.equal(3);
    expect(getSymptomValue(makeSystem(-1, 2))).to.equal(-1);
    expect(getSymptomValue(makeSystem(0, -4))).to.equal(0);
    expect(getSymptomValue(makeSystem(-2, -4))).to.equal(0);
    expect(getSymptomValue(makeSystem(-5, -4))).to.equal(-1);
    expect(getSymptomValue(makeSystem(3, -4))).to.equal(3);
  });

  it('getSymptoms - all symptoms different', () => {
    expect(getSymptomsInternal([
      makeSystem(1, 2),
      makeSystem(5, 2),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(3, -4),
    ])).to.deep.equal(
      new Set<Symptoms>(
        [Symptoms.Faint, Symptoms.PainPushRightAbdomen, Symptoms.FingertipsTingling, Symptoms.NailsDarkening]));
  });

  it('getSymptoms - some symptoms same', () => {
    expect(getSymptomsInternal([
      makeSystem(-6, 2),
      makeSystem(5, 2),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(1, -4),
    ])).to.deep.equal(
      new Set<Symptoms>([Symptoms.Faint, Symptoms.PainPushRightAbdomen, Symptoms.FingertipsTingling]));
  });

  it('getSymptoms - death+', () => {
    expect(getSymptomsInternal([
      makeSystem(2, 2),
      makeSystem(9, 1),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(1, -4),
    ])).to.deep.equal(
      new Set<Symptoms>([Symptoms.Death]));
  });

  it('getSymptoms - death-', () => {
    expect(getSymptomsInternal([
      makeSystem(-8, 2),
      makeSystem(5, 1),
      makeSystem(-1, 2),
      makeSystem(0, -4),
      makeSystem(-2, -4),
      makeSystem(-5, -4),
      makeSystem(1, -4),
    ])).to.deep.equal(
      new Set<Symptoms>([Symptoms.Death]));
  });
});
