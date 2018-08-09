import { Professions, CompanyAccess, TradeUnions, Company } from "./model";

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
    }

    access?: AccessEntry[];
    pushToken?: string;
    roles?: string[];
}

export interface AccessEntry {
    id: string;
    timestamp: number;
  }