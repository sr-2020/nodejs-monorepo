import * as moment from 'moment';

class Recipient {}

module.exports = () => {
  return {
    noop() {},

    add(api: any, data: any) {
      const { operand, value } = data;
      api.model[operand] += Number(value);
    },

    mul(api: any, data: any) {
      const { operand, value } = data;
      api.model[operand] *= Number(value);
    },

    concat(api: any, data: any) {
      const { operand, value } = data;
      api.model[operand] = '' + api.model[operand] + value;
    },

    delayedConcat(api: any, data: any) {
      const { operand, value, delay } = data;
      api.setTimer('delayedConcat', '', moment.duration(delay, 'milliseconds'), 'concat', { operand, value });
    },

    sendMessage(api: any, data: any) {
      const { receiver, message } = data;
      api.sendOutboundEvent(Recipient, receiver, 'message', { message });
    },

    _view(_: any, data: any) {
      return { value: data.value };
    },
  };
};
