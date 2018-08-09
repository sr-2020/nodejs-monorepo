import { JoinCharacterDetail } from "../join-importer";
import { ProvideResult, ProvideSuccess } from "./interface";
import * as   request from "request-promise-native";
import { config } from "../config";
import * as winston from "winston";

export class EconProvider {
    public name: string = "economic account";

    public async provide(character: JoinCharacterDetail) : Promise<ProvideResult>
    {
        const body = {
            userId: character.account.login,
            initialBalance: 777,
        };

        try {
            const result = await this.callEconomicServer("/economy/provision", body);
        }
        catch (e)
        {
            return {result: "problems", problems: [e] };
        }
        return {result: "success"};
    }

    public async callEconomicServer(urlPart, body)
    {
        try {
            const reqOpts = {
                url: config.econ.baseUrl + urlPart,
                method : "POST",
                auth: config.econ,
                body: body,
                timeout: config.requestTimeout,
                json: true,
            };

            winston.debug("", reqOpts);

            await request(reqOpts);
        }
        catch (e)
        {
            winston.warn(`Error trying to call economic server`, e);
            throw e;
        }
    }
}