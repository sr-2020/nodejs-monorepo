import { JoinCharacterDetail } from "../join-importer";

export interface ProvideSuccess {
    result: "success";
}

export interface ProvideNothing {
    result: "nothing";
}
export interface ProvideProblems {
    result: "problems";
    problems: string[];
}

export type ProvideResult = ProvideSuccess | ProvideNothing | ProvideProblems;

export interface Provider {
    name: string;
    provide(character: JoinCharacterDetail) : Promise<ProvideResult>;
}