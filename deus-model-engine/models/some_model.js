module.exports = () => {
    return {
        name: 'SomeModel',
        description: '',

        callbacks: {
            bang(s) {
                return s;
            }
        }
    };
};
