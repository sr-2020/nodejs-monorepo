export interface System {
    value: number;
    nucleotide: number;
    lastModified: number;
    present: boolean;
}

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

export type Company = "gd" | "pre" | "kkg" | "mat" | "mst";


