module.exports = () => {
    return {
        noop() {},

        add(api, data) {
            let {operand, value} = data;
            api.model[operand] += Number(value);
        },

        mul(api, data) {
            let {operand, value} = data;
            api.model[operand] *= Number(value);
        },

        concat(api, data) {
            let {operand, value} = data;
            api.model[operand] = '' + api.model[operand] + value;
        },

        delayedConcat(api, data) {
            let {operand, value, delay} = data;
            api.setTimer('delayedConcat', delay, 'concat', { operand, value });
        },

        _view(api, data) {
            return { value: data.value };
        }
    };
};
