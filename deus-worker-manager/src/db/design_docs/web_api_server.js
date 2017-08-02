module.exports = {
    dbs: ['events'],
    version: 0,

    views: {
        'by_character_id': {
            map: function(doc) {
                if (doc.timestamp && doc.characterId) {
                    emit([doc.characterId, doc.timestamp]);
                }
            }
        }
    }
};
