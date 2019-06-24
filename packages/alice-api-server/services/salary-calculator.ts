import { AliceAccount, TradeUnions } from '../models/alice-account';
import { EconomyConstants } from '../models/economy-constants';

export function calculateSalary(account: AliceAccount, economyConstants: EconomyConstants): number {

    const numberOfPremiums = account.jobs.companyBonus.length;
    const isTopManager = account.companyAccess.some((x) => x.isTopManager);
    const isManager = account.companyAccess.some((x) => !x.isTopManager);
    const isRegular = account.companyAccess.length == 0;

    const salary: number[] = [];

    const addSalary = (cond, val) => salary.push(cond ? val : 0);

    addSalary(true, economyConstants.everyone);

    // Trade union base
    addSalary(anyTradeUnion(account.jobs.tradeUnion), economyConstants.specialistBase);

    // Company bonus for non-managers (specialists and unemployed)
    addSalary(isRegular, (economyConstants.specialistPremium * numberOfPremiums));

    // Manager base
    addSalary(isManager && !isTopManager, economyConstants.managerBase);

    // Top-Manager base
    addSalary(isTopManager, economyConstants.topManagerBase);

    // Company bonus for managers
    addSalary(isManager || isTopManager, (economyConstants.managerPremium * numberOfPremiums));

    return salary.reduce((prev, current) => prev + current, 0);
}

function anyTradeUnion(tu: TradeUnions): boolean {
    return tu.isBiologist ||
        tu.isCommunications ||
        tu.isEngineer ||
        tu.isNavigator ||
        tu.isPilot ||
        tu.isPlanetolog ||
        tu.isSupercargo;
}
