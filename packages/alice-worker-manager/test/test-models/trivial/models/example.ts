module.exports = () => {
  return {
    concat(api, data) {
      let { value } = data;
      api.model.value = '' + api.model.value + value;
    },

    delayedConcat(api, data) {
      let { value, delay } = data;
      api.setTimer('delayedConcat', delay, 'concat', { value });
    },

    crash(api, data) {
      console.log('>>>');
      throw new Error('bang!');
    },

    kill() {
      process.exit(1);
    },

    increaseExternalCounterAbc(api) {
      let abc = api.aquired('counters', 'abc');
      if (abc) {
        abc.value++;
      }
    },

    _preprocess(api, events) {
      for (let e of events) {
        if (e.eventType == 'increaseExternalCounterAbc') {
          api.aquire('counters', 'abc');
        }
      }
    },

    _view(api, data) {
      if (data.skipFromViewmodel)
        return undefined;
      return { value: data.value };
    }
  };
};
