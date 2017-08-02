module.exports = {
    dbs: ['events'],
    version: 0,

    views: {
        'characterId_timestamp_mobile': {
            map: function(doc) {
                if (doc.timestamp && doc.characterId && doc.mobile) {
                    emit([doc.characterId, doc.timestamp]);
                }
            }
        }
    }
};
