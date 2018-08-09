export interface ISystem {
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

export interface ICompanyAccess {
    isTopManager: boolean;
    companyName: ICompany;
}

export type ICompany = "gd" | "pre" | "kkg" | "mat" | "mst";


