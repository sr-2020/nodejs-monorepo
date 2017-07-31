import { systems } from './constants';

export interface SharedData {
    _id: string
    displayName: string
}

export interface CureData extends SharedData {
    pillType: 'cure'
    curedSystem: string
    affectedGenomePos: number
    affectedGenomeVal: number
    duration: number
}

export interface StammData extends SharedData {
    pillType: 'stamm'
    affectedGenomePos: number
    affectedGenomeVal: number
}

export interface AidData extends SharedData {
    pillType: 'aid'
    affectedGenomePos: number
    affectedGenomeVal: number
}

export interface LastChanceData extends SharedData {
    pillType: 'lastChance'
    affectedGenomePos: number
    affectedGenomeVal: number
}

export type PillData = CureData | StammData | AidData | LastChanceData;

function parseCure(data): CureData | false {
    if (data[2].toLowerCase() !== 'лекарство') return false;

    const _id = data[0];
    const displayName = data[1];
    const curedSystem = systems[data[3].toLowerCase()];
    const duration = Number(data[4]) * 60;
    let match = data[6].match(/позиции генома №(\d+) присваивается значение (\d)/i);

    if (!(_id && curedSystem && duration && match)) return false;

    const affectedGenomePos = Number(match[1]);
    const affectedGenomeVal = Number(match[2]);

    return {
        pillType: 'cure', _id, displayName, curedSystem, affectedGenomePos, affectedGenomeVal, duration
    };
}

function parseStamm(data): StammData | false {
    if (data[2].toLowerCase() !== 'штамм') return false;
    const _id = data[0];
    const displayName = data[1];

    let match = data[5].match(/позиции генома №(\d+) присваивается значение (\d)/i);

    if (!(_id && match)) return false;

    const affectedGenomePos = Number(match[1]);
    const affectedGenomeVal = Number(match[2]);

    return {
        pillType: 'stamm', _id, displayName, affectedGenomePos, affectedGenomeVal
    };
}

function parseAid(data): AidData | false {
    if (data[2].toLowerCase() !== 'лекарство') return false;
    if (data[1].toLowerCase().indexOf('лекарство от легкого ранения') !== 0) return false;

    const _id = data[0];
    const displayName = data[1];
    let match = data[6].match(/позиции генома №(\d+) присваивается значение (\d)/i);

    if (!(_id && match)) return false;

    const affectedGenomePos = Number(match[1]);
    const affectedGenomeVal = Number(match[2]);

    return {
        pillType: 'aid', _id, displayName, affectedGenomePos, affectedGenomeVal
    };
}

function parseLastChance(data): LastChanceData | false {
    if (data[2].toLowerCase() !== 'лекарство') return false;
    if (data[1].toLowerCase().indexOf('лекарство от тяжелого ранения') !== 0) return false;

    const _id = data[0];
    const displayName = data[1];
    let match = data[6].match(/позиции генома №(\d+) присваивается значение (\d)/i);

    if (!(_id && match)) return false;

    const affectedGenomePos = Number(match[1]);
    const affectedGenomeVal = Number(match[2]);

    return {
        pillType: 'lastChance', _id, displayName, affectedGenomePos, affectedGenomeVal
    };
}

export function parsePill(data): PillData | false {
    return parseCure(data) || parseStamm(data) || parseAid(data) || parseLastChance(data);
}
