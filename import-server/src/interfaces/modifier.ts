import { DeusEffect } from './effect';
import { Predicate } from './predicate';

export interface DeusModifier {
    id?: string,
    _id?: string,
    _rev?: string,
    displayName?: string,
    class?: string,
    system?: string,
    effects?: string[],
    enabled?: boolean,
    predicates?: Predicate[],
    mID?: string
}
