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

    'last-refresh-event': {
      map: function (doc) {
        if (doc.eventType == '_RefreshModel' && doc.timestamp && doc.characterId) {
          emit(doc.characterId, doc);
        }
      },

      reduce: function (key, values, rereduce) {
        var last = null;
        var current;

        for (var i = 0; i < values.length; i++) {
          current = values[i];
          if (!last || current.timestamp > last.timestamp) {
            last = current;
          }
        }

        return last;
      }
    }
  }
};
