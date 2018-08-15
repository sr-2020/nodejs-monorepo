export interface TradeUnions {
    isPilot: boolean;
    isNavigator: boolean;
    isCommunications: boolean;
    isSupercargo: boolean;
    isEngineer: boolean;
    isBiologist: boolean;
    isPlanetolog: boolean;
}

export interface CompanyPosition {
    isTopManager: boolean;
    isSecurity: boolean;
    isManager: boolean;
}

export interface SpecialPositions {
    isJournalist: boolean;
    isIdelogist: boolean;
}

export type Professions = CompanyPosition & SpecialPositions & TradeUnions;

export interface CompanyAccess {
    isTopManager: boolean;
    companyName: Company;
}

export type Company = 'gd' | 'pre' | 'kkg' | 'mat' | 'mst';

export interface AliceAccount {
    _id: string;
    _rev?: string;
    password: string;
    login: string;
    professions: Professions;
    companyAccess: CompanyAccess[];

    jobs: {
        tradeUnion: TradeUnions;
        companyBonus: Company[];
    };

    access?: AccessEntry[];
    pushToken?: string;
    roles?: string[];
}

export interface AccessEntry {
    id: string;
    timestamp: number;
  }

export interface ShieldValues {
    shield: number;
}