import { systemsIndices } from "../../helpers/magellan";
import { systemToSymptoms } from "../../helpers/symptoms";
import { expect } from "chai";

describe('Symptoms helper', () => {
  it('Symtoms table have correct number of elements', () => {
    for (const indice of systemsIndices()) {
      const symptoms = systemToSymptoms.get(indice);
      expect(symptoms).to.exist;
      expect(symptoms).to.have.length(7 + 7);
    }
  })
});
