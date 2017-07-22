import { DeusEffect } from './effect';
import { Predicate } from './predicate';

export interface DeusModifier {
    id?: string,
    _id?: string,
    _rev?: string,
    displayName?: string,
    class?: string,
    system?: string,
    effects?: Array<DeusEffect>,
    enabled?: boolean,
    predicates?: Predicate[],
    mID?: string
}
