module.exports = {
    dbs: ['accounts'],

    views: {
        'by-login': {
            map: function(doc) {
                if (doc.login) emit(doc.login);
            },
        },

        'by-push-token': {
            map: function(doc) {
                if (doc.pushToken) emit(doc.pushToken);
            },
        },
    }
};
