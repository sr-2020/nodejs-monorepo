import {
  allSystemsIndices,
  BiologicalSystems,
  biologicalSystemsColors,
  biologicalSystemsNames,
  colorOfChange,
  SystemColor,
  systemCorrespondsToColor,
} from '../../helpers/basic-types';
import { getExampleBiologicalOrganismModel } from '../helpers/example-models';

describe('Magellan helpers', () => {
  it('systemIndices', () => {
    const indices = allSystemsIndices();
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('Has name for all systems', () => {
    for (const i of allSystemsIndices()) {
      expect(biologicalSystemsNames.get(i)).toBeDefined();
    }
  });

  it('Has colors for all systems', () => {
    for (const i of allSystemsIndices()) {
      expect(biologicalSystemsColors.get(i)).toBeDefined();
      expect(biologicalSystemsColors.get(i)!.length).toBeGreaterThan(0);
    }
  });

  it('There are 3 systems of each color', () => {
    const c = new Map<SystemColor, number>([
      [SystemColor.Blue, 0],
      [SystemColor.Orange, 0],
      [SystemColor.Green, 0],
    ]);

    for (const i of allSystemsIndices()) {
      for (const color of biologicalSystemsColors.get(i) as SystemColor[]) {
        c.set(color, (c.get(color) as number) + 1);
      }
    }

    expect(c).toEqual(
      new Map<SystemColor, number>([
        [SystemColor.Blue, 3],
        [SystemColor.Orange, 3],
        [SystemColor.Green, 3],
      ]),
    );
  });

  it('systemCorrespondsToColor', () => {
    expect(systemCorrespondsToColor(SystemColor.Blue, BiologicalSystems.Cardiovascular)).toBe(true);
    expect(systemCorrespondsToColor(SystemColor.Blue, BiologicalSystems.Reproductive)).toBe(true);
    expect(systemCorrespondsToColor(SystemColor.Blue, BiologicalSystems.Nervous)).toBe(false);
  });

  describe('colorOfChange', () => {
    const allSystemsModel = getExampleBiologicalOrganismModel();

    it('No change', () => {
      expect(colorOfChange(allSystemsModel, [0, 0, 0, 0, 0, 0, 0])).toBeFalsy();
    });

    it('Same color - all ', () => {
      expect(colorOfChange(allSystemsModel, [0, 1, 0, -1, 0, 0, 2])).toBe(SystemColor.Green);
      expect(colorOfChange(allSystemsModel, [0, 1, -1, 0, 1, 0, 0])).toBe(SystemColor.Blue);
      expect(colorOfChange(allSystemsModel, [1, 0, 0, 0, -10, 4, 0])).toBe(SystemColor.Orange);
    });

    it('Same color - but not all', () => {
      expect(colorOfChange(allSystemsModel, [0, 1, 0, 0, 0, 0, 2])).toBeFalsy();
      expect(colorOfChange(allSystemsModel, [0, 0, -1, 0, 1, 0, 0])).toBeFalsy();
      expect(colorOfChange(allSystemsModel, [1, 0, 0, 0, -10, 0, 0])).toBeFalsy();
    });

    it('Mixed colors', () => {
      expect(colorOfChange(allSystemsModel, [1, 1, 0, -1, 0, 0, 2])).toBeFalsy();
      expect(colorOfChange(allSystemsModel, [0, 1, -1, 1, 1, 0, 0])).toBeFalsy();
      expect(colorOfChange(allSystemsModel, [1, 0, 0, 0, -10, 4, 1])).toBeFalsy();
    });
  });
});
