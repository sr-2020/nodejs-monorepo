import { systemsIndices } from "../../helpers/magellan";
import { systemToSymptoms, getSymptomValue, getSymptomsInternal, Symptoms } from "../../helpers/symptoms";
import { expect } from "chai";

describe('Symptoms helper', () => {
  it('Symtoms table have correct number of elements', () => {
    for (const indice of systemsIndices()) {
      const symptoms = systemToSymptoms.get(indice);
      expect(symptoms).to.exist;
      expect(symptoms).to.have.length(7 + 7);
    }
  })

  it('getSymptomValue', () => {
    expect(getSymptomValue(0, 0)).to.equal(0);
    expect(getSymptomValue(1, 2)).to.equal(0);
    expect(getSymptomValue(5, 2)).to.equal(3);
    expect(getSymptomValue(-1, 2)).to.equal(-1);
    expect(getSymptomValue(0, -4)).to.equal(0);
    expect(getSymptomValue(-2, -4)).to.equal(0);
    expect(getSymptomValue(-5, -4)).to.equal(-1);
    expect(getSymptomValue(3, -4)).to.equal(3);
  })

  it('getSymptoms - all symptoms different', () => {
    expect(getSymptomsInternal([1, 5, -1, 0, -2, -5, 3], [2, 2, 2, -4, -4, -4, -4])).to.deep.equal(
      new Set<Symptoms>([Symptoms.Faint, Symptoms.PainPushRightAbdomen, Symptoms.FingertipsTingling, Symptoms.NailsDarkening]));
  });

  it('getSymptoms - some symptoms same', () => {
    expect(getSymptomsInternal([-6, 5, -1, 0, -2, -5, 1], [2, 2, 2, -4, -4, -4, -4])).to.deep.equal(
      new Set<Symptoms>([Symptoms.Faint, Symptoms.PainPushRightAbdomen, Symptoms.FingertipsTingling]))
  })

  it('getSymptoms - death+', () => {
    expect(getSymptomsInternal([2, 9, -1, 0, -2, -5, 1], [2, 1, 2, -4, -4, -4, -4])).to.deep.equal(
      new Set<Symptoms>([Symptoms.Death]))
  })

  it('getSymptoms - death-', () => {
    expect(getSymptomsInternal([-8, 5, -1, 0, -2, -5, 1], [2, 2, 2, -4, -4, -4, -4])).to.deep.equal(
      new Set<Symptoms>([Symptoms.Death]))
  })
});
