let consts = require('../helpers/constants');
let Chance = require('chance');
const _ = require('lodash');
let helpers = require('../helpers/model-helper');

let systemCount = consts().medicSystems.length;

function getSystemFailureChance(generation)
{
    if (generation == "A") {
        return 1;
    }
    if (generation == "W") {
        return 2;
    }
    if (generation == "Z") {
        return 3;
    }
    if (generation == "X/Y") {
        return 10;
    }
    return 100;
}

function getPotentialSystemsIds(model)
{
    let systems = _.zip(_.take(model.genome, systemCount), [0,1,2,3,4,5]);
    
    return systems.filter(s => s[0] == 1).map(val => {
        return val[1];
    })
}

function getTotalChance (model) {
    let systemFailureChance = getSystemFailureChance(model.generation); 
    return 1 - Math.pow((1 - systemFailureChance / 100), getPotentialSystemsIds(model).length);
}

function whatSystemShouldBeInfected(model){
    
    let failureChance = getTotalChance(model);

    let chance = helpers().getChanceFromModel(model);

    if (chance.floating({min:0, max:1}) < failureChance) {
        let candidates = getPotentialSystemsIds(model);
        if (candidates.length == 0) {
            return -1;
        }
        let system = chance.pickone(candidates);
        return system;
    }
    else{
        return -1;
    }
}

module.exports = { 
    getTotalChance,
    whatSystemShouldBeInfected,
    getPotentialSystemsIds
};
