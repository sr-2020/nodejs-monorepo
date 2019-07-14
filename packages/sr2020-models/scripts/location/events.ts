import { Event } from '@sr2020/interface/models/alice-model-engine';
import { LocationApi } from '@sr2020/interface/models/location.model';

function reduceManaDensity(api: LocationApi, data: { amount: number }, _: Event) {
  api.model.manaDensity -= data.amount;
  if (api.model.manaDensity < 0) {
    api.model.manaDensity = 0;
  }
}

module.exports = () => {
  return {
    reduceManaDensity,
  };
};
