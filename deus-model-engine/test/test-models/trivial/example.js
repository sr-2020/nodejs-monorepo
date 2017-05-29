module.exports = () => {
    return {
        noop() {},

        add(data) {
            let {operand, value} = data;
            this.update(operand, (oldValue) => oldValue + Number(value));
        },

        mul(data) {
            let {operand, value} = data;
            this.update(operand, (oldValue) => oldValue * Number(value));
        },

        concat(data) {
            let {operand, value} = data;
            this.update(operand, (oldValue) => '' + oldValue + value);
        },

        delayedConcat(data) {
            let {operand, value, delay} = data;
            this.setTimer(delay, 'concat', { operand, value });
        }
    };
};
