import * as commandLineArgs from "command-line-args";
import * as commandLineUsage from "command-line-usage";
import winston from "winston";

// Сheck CLI arguments
const cliParamsDef = [
        { name: "export", type: Boolean, description: "Create and export model to ALICE DB" },
        { name: "import", type: Boolean, description: "Import data from JoinRPG" },
        { name: "list", type: Boolean, description: "Only list characters for import (dry run)"},
        { name: "refresh", type: Boolean, description: "Send _Refresh event after import"},
        { name: "mail", type: Boolean, description: "Create e-mail after import" },
        { name: "econ", type: Boolean, description: "Register economy account" },
        {
            name: "id",
            type: String,
            typeLabel: "[underline]{characterId}", description: "ID of single character for import"},
        {
            name: "since",
            type: String,
            typeLabel: "[underline]{YYYY-MM-DDTHH:mm}", description: "import characters modified after that time",
        },
        { name: "server", type: Boolean, description: "Run as a server" },
        { name: "ignoreInGame", type: Boolean, description: "Ignore inGame flag for re-export" },
];

const usageSections = [
    {
        header: "DeusEx LARP import application",
        content: [
            "Can be run as server for continues import or manualy",
            "If set only [italic]{id} that means - import->export->refresh->create mail for this character",
        ],
    },
    {
        header: "Options",
        optionList: cliParamsDef,
    },
];

export function processCliParams(): any {
    try {
        const p = commandLineArgs(cliParamsDef);

        const setSteps = p.export || p.import || p.list || p.refresh || p.mail || p.since || p.econ;

        if (!setSteps && !p.server && !p.id) {
            throw "error combinations";
        }

        if (p.server && (setSteps || p.id)) {
            throw "error combinations";
        }

        // Если задано только id
        if (!setSteps && !p.server && p.id) {
            p.export = true;
            p.import = true;
            p.mail = true;
            p.econ = true;
        }

        return p;
    } catch (e) {
        const usage = commandLineUsage(usageSections);
        winston.warn(usage);
        return null;
    }
}
