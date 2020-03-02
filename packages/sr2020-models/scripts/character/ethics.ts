import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { EthicScale, kEthicLevels, kAllCrysises, EthicTrigger } from './ethics_library';
import { EventModelApi, Event, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';

const MAX_ETHIC_VALUE = 4;

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

function findTrigger(id: string): EthicTrigger {
  const crysis = kAllCrysises.find((cr) => cr.id == id);
  if (crysis) return crysis;

  for (const level of kEthicLevels) {
    const trigger = level.triggers.find((t) => t.id == id);
    if (trigger) return trigger;
  }

  throw new UserVisibleError('Триггер не найден');
}

export function ethicSet(
  api: EventModelApi<Sr2020Character>,
  data: { violence: number; control: number; individualism: number; mind: number },
  _: Event,
) {
  updateEthic(
    api.model,
    new Map([
      ['violence', data.violence],
      ['control', data.control],
      ['individualism', data.individualism],
      ['mind', data.mind],
    ]),
  );
}

export function ethicTrigger(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const trigger = findTrigger(data.id);
  const values: Map<EthicScale, number> = new Map();
  for (const l of api.model.ethicState) values.set(l.scale, l.value);

  if (trigger.kind == 'crysis') api.model.ethicTrigger = api.model.ethicTrigger.filter((t) => t.id != data.id);

  for (const shift of trigger.shifts) {
    const v = values.get(shift.scale)!;
    if (v >= shift.conditionMin && v <= shift.conditionMax) {
      if (Math.abs(v + shift.change) == MAX_ETHIC_VALUE) {
        for (const [scale, value] of values) {
          values.set(scale, Math.max(Math.min(value, MAX_ETHIC_VALUE - 1), -MAX_ETHIC_VALUE + 1));
        }
      }
      values.set(shift.scale, v + shift.change);
    }
  }

  for (const crysisIndex of trigger.crysises) {
    const crysis = kAllCrysises[crysisIndex - 1];
    if (!api.model.ethicTrigger.some((t) => t.id == crysis.id)) {
      api.model.ethicTrigger.push(crysis);
    }
  }

  // TODO(https://trello.com/c/oU50sFq6/198-личная-этика-задача-6-разработать-процедуру-пересчета-абилок)
  // TODO(aeremin): Handle cooldown

  updateEthic(api.model, values);
}
