module.exports = {
    dbs: ['defaultViewModels'],

    views: {
        'by-timestamp': {
            map: function(doc) {
                if (doc.timestamp) emit(doc.timestamp);
            },
        },
    }
};
