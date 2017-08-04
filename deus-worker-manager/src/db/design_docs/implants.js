module.exports = {
    dbs: ['models'],

    version: 0,

    views: {
        'by-class': {
            map: function(doc) {
                if (doc.modifiers) {
                    for (var i = 0; i < doc.modifiers.length; i++) {
                        var mod = doc.modifiers[i];
                        if (mod.class != '_internal') {
                            emit(mod.class, {
                                _id: doc._id,
                                class: mod.class,
                                system: mod.system,
                                implantId: mod.id,
                                displayName: mod.displayName,
                                enabled: mod.enabled
                            });
                        }
                    }
                }
            },

            reduce: '_count'
        }
    }
};
