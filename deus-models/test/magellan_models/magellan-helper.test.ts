import { expect } from 'chai';
import { BiologicalSystems, biologicalSystemsColors, biologicalSystemsNames,
  colorOfChange, SystemColor, systemCorrespondsToColor, systemsIndices } from '../../helpers/magellan';

describe('Magellan helpers', () => {
  it('systemIndices', () => {
    const indices = systemsIndices();
    expect(indices).to.deep.equal([0, 1, 2, 3, 4, 5, 6]);
  });

  it('Has name for all systems', () => {
    for (const i of systemsIndices()) {
      expect(biologicalSystemsNames.get(i)).to.exist;
    }
  });

  it('Has colors for all systems', () => {
    for (const i of systemsIndices()) {
      expect(biologicalSystemsColors.get(i)).to.exist;
      expect(biologicalSystemsColors.get(i)).to.have.length.greaterThan(0);
    }
  });

  it('There are 3 systems of each color', () => {
    const c = new Map<SystemColor, number>([
      [SystemColor.Blue, 0],
      [SystemColor.Orange, 0],
      [SystemColor.Green, 0],
    ]);

    for (const i of systemsIndices()) {
      for (const color of biologicalSystemsColors.get(i) as SystemColor[]) {
        c.set(color, c.get(color) as number + 1);
      }
    }

    expect(c).to.deep.equal(new Map<SystemColor, number>([
      [SystemColor.Blue, 3],
      [SystemColor.Orange, 3],
      [SystemColor.Green, 3],
    ]));
  });

  it('systemCorrespondsToColor', () => {
    expect(systemCorrespondsToColor(SystemColor.Blue, BiologicalSystems.Cardiovascular)).to.be.true;
    expect(systemCorrespondsToColor(SystemColor.Blue, BiologicalSystems.Reproductive)).to.be.true;
    expect(systemCorrespondsToColor(SystemColor.Blue, BiologicalSystems.Nervous)).to.be.false;
  });

  describe('colorOfChange', () => {
    it('No change', () => {
      expect(colorOfChange([0, 0, 0, 0, 0, 0, 0])).to.not.exist;
    });

    it('Same color - all ', () => {
      expect(colorOfChange([0, 1, 0, -1, 0, 0, 2])).to.equal(SystemColor.Green);
      expect(colorOfChange([0, 1, -1, 0, 1, 0, 0])).to.equal(SystemColor.Blue);
      expect(colorOfChange([1, 0, 0, 0, -10, 4, 0])).to.equal(SystemColor.Orange);
    });

    it('Same color - but not all', () => {
      expect(colorOfChange([0, 1, 0, 0, 0, 0, 2])).to.not.exist;
      expect(colorOfChange([0, 0, -1, 0, 1, 0, 0])).to.not.exist;
      expect(colorOfChange([1, 0, 0, 0, -10, 0, 0])).to.not.exist;
    });

    it('Mixed colors', () => {
      expect(colorOfChange([1, 1, 0, -1, 0, 0, 2])).to.not.exist;
      expect(colorOfChange([0, 1, -1, 1, 1, 0, 0])).to.not.exist;
      expect(colorOfChange([1, 0, 0, 0, -10, 4, 1])).to.not.exist;
    });
  });

});
