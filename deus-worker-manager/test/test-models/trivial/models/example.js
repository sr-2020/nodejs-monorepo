module.exports = () => {
    return {
        concat(api, data) {
            let {value} = data;
            api.model.value = '' + api.model.value + value;
        },

        delayedConcat(api, data) {
            let {value, delay} = data;
            api.setTimer('delayedConcat', delay, 'concat', { value });
        },

        _view(api, data) {
            return { value: data.value };
        }
    };
};
