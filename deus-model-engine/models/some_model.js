module.exports = () => {
    return {
        add(data) {
            let {value} = data;
            this.update('value', (oldValue) => oldValue + Number(value));
        },

        mul(data) {
            let {value} = data;
            this.update('value', (oldValue) => oldValue * Number(value));
        },

        concat(data) {
            let {value} = data;
            this.update(value, (oldValue) => '' + oldValue + value);
        },

        delayedConcat(data) {
            let {value, delay} = data;
            this.setTimer('value', 'concat', { operand, value });
        }
    };
};
