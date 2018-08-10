import { expect } from 'chai';
import 'mocha';

import { createEmptyAccount } from './test-db-container';

import { calculateSalary } from '../services/salary-calculator';

describe('Economy', () => {

    const economyConstants = {
        topManagerBase: 9000,
        managerPremium: 3000,
        managerBase: 1000,
        specialistPremium: 500,
        specialistBase: 500,
        everyone: 100,
    };

  it('Everyone should get base', () => {
    expect(calculateSalary(createEmptyAccount(), economyConstants)).to.be.equal(100);
  });

  it('Specialist should get money from trade union', () => {
      const account = createEmptyAccount();
      account.jobs.tradeUnion.isBiologist = true;

      expect(calculateSalary(account, economyConstants)).to.be.equal(600);
  });

  it('Nobody should get money from trade union twice', () => {
    const account = createEmptyAccount();
    account.jobs.tradeUnion.isBiologist = true;
    account.jobs.tradeUnion.isCommunications = true;

    expect(calculateSalary(account, economyConstants)).to.be.equal(600);
    });

    it('Specialist should be able to get money from company', () => {
        const account = createEmptyAccount();
        account.jobs.tradeUnion.isBiologist = true;
        account.jobs.companyBonus.push('gd');

        expect(calculateSalary(account, economyConstants)).to.be.equal(1100);
    });

    it('Specialist should be able to get money from two companies', () => {
        const account = createEmptyAccount();
        account.jobs.tradeUnion.isBiologist = true;
        account.jobs.companyBonus.push('gd');
        account.jobs.companyBonus.push('kkg');

        expect(calculateSalary(account, economyConstants)).to.be.equal(1600);
    });

    it('Specialist should be able to get money from company even after trade union banning', () => {
        const account = createEmptyAccount();
        account.jobs.companyBonus.push('kkg');

        expect(calculateSalary(account, economyConstants)).to.be.equal(600);
    });

    it('Managers should have their base', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: false});

        expect(calculateSalary(account, economyConstants)).to.be.equal(1100);
    });

    it('Even managers should not be able get salary twice', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: false});
        account.companyAccess.push({companyName: 'gd', isTopManager: false});

        expect(calculateSalary(account, economyConstants)).to.be.equal(1100);
    });

    it('Managers should be able to get premium', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: false});

        account.jobs.companyBonus.push('kkg');

        expect(calculateSalary(account, economyConstants)).to.be.equal(4100);
    });

    it('Managers should be able to get premium twice', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: false});

        account.jobs.companyBonus.push('kkg');
        account.jobs.companyBonus.push('gd');

        expect(calculateSalary(account, economyConstants)).to.be.equal(7100);
    });

    it('Top-Managers should have their lion share', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: true});

        expect(calculateSalary(account, economyConstants)).to.be.equal(9100);
    });

    it('Even top-managers should not be able get salary twice', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: true});
        account.companyAccess.push({companyName: 'gd', isTopManager: true});

        expect(calculateSalary(account, economyConstants)).to.be.equal(9100);
    });

    it('Top-managers could not get manager money in other company', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: true});
        account.companyAccess.push({companyName: 'gd', isTopManager: false});

        expect(calculateSalary(account, economyConstants)).to.be.equal(9100);
    });

    it('Top-Managers should be able to get premium', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: true});

        account.jobs.companyBonus.push('kkg');

        expect(calculateSalary(account, economyConstants)).to.be.equal(12100);
    });

    it('Top-Managers should be able to get premium twice', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: true});

        account.jobs.companyBonus.push('kkg');
        account.jobs.companyBonus.push('gd');

        expect(calculateSalary(account, economyConstants)).to.be.equal(15100);
    });

    it.skip('Only humans should be able to get money', () => {
        const account = createEmptyAccount();
        account.companyAccess.push({companyName: 'kkg', isTopManager: true});

        account.jobs.companyBonus.push('kkg');
        account.jobs.companyBonus.push('gd');

        // TODO understand how to filter humans / non-humans (extra property in account?)

        expect(calculateSalary(account, economyConstants)).to.be.equal(15100);
    });

});
