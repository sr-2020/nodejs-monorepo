import { DeusEffect } from './effect'

export interface DeusModifier {
    id: string,
    displayName: string,
    class: string,
    system?: string,
    effects: Array<DeusEffect>,
    enabled: boolean,
    mID?: string
}
