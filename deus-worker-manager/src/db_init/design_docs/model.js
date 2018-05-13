module.exports = {
    dbs: ['workingModels'],

    views: {
        'by-location': {
            map: function(doc) {
                if (doc.location) emit(doc.location);
            },
        },
    }
};
