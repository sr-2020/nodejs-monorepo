module.exports = {
    dbs: ['events'],

    version: 0,

    views: {
        'by-character-id': {
            map: function(doc) {
                if (doc.timestamp && doc.characterId) {
                    emit([doc.characterId, doc.timestamp]);
                }
            },
            reduce: '_count'
        }
    }
};
