module.exports = {
  dbs: ['events'],

  views: {
    'refresh-events': {
      map: function (doc) {
        if (doc.eventType == '_RefreshModel' && doc.timestamp && doc.characterId) {
          emit([doc.characterId, doc.timestamp]);
        }
      }
    },
  }
};
