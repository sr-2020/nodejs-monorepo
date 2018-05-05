module.exports = {
  dbs: ['economy'],

  views: {
      'by-id': {
          map: function(doc) {
              if (doc.sender && doc.receiver) {
                 emit(doc.sender);
                 emit(doc.receiver);
              }
          },
      },
  }
};
