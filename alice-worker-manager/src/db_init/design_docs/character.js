module.exports = {
  dbs: ['events'],

  views: {
    'by-character-id': {
      map: function (doc) {
        if (doc.timestamp && doc.characterId) {
          emit([doc.characterId, doc.timestamp]);
        }
      },
      reduce: '_count'
    },

    'refresh-events': {
      map: function (doc) {
        if (doc.eventType == '_RefreshModel' && doc.timestamp && doc.characterId) {
          emit([doc.characterId, doc.timestamp]);
        }
      }
    },
  }
};
