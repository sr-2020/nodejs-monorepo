module.exports = {
    dbs: ['models'],

    views: {
        'by-location': {
            map: function(doc) {
                if (doc.location) emit(doc.location);
            },
        },
    }
};
