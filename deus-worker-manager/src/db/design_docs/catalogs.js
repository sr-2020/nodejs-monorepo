module.exports = {
    dbs: ['catalogs'],

    version: 0,

    views: {
        'by-name': {
            map: function(doc) {
                if (doc.catalog) {
                    emit(doc.catalog);
                }
            },
            reduce: '_count'
        }
    }
};
