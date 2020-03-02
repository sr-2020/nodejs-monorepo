import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { EthicScale, kEthicLevels } from './ethics_library';

export function initEthic(model: Sr2020Character) {
  updateEthic(
    model,
    new Map([
      ['violence', 0],
      ['control', 0],
      ['individualism', 0],
      ['mind', 0],
    ]),
  );
}

// Update ethic profile based on the new ethic values.
// Will remove all non-crysis triggers and recalculate state.
function updateEthic(model: Sr2020Character, ethicValues: Map<EthicScale, number>) {
  model.ethicState = [];
  model.ethicTrigger = model.ethicTrigger.filter((t) => t.kind == 'crysis');
  for (const [scale, value] of ethicValues) {
    const level = kEthicLevels.find((l) => l.scale == scale && l.value == value)!;
    model.ethicState.push({
      scale,
      value,
      description: level.description,
    });
    model.ethicTrigger.push(
      ...level.triggers.map((t) => {
        return {
          id: t.id,
          kind: t.kind,
          description: t.description,
        };
      }),
    );
  }
}
