var app = new Vue({
  el: '#app',
  data: {
    desiredCharacterId: 128,
    characterModel: undefined,
    allFeatures: undefined,
    selectedFeature: 'magic-1',
    modelsManagerUrl: 'http://instance.evarun.ru:7007/character/model/'
  },
  async created() {
    const response = await this.$http.get(`http://instance.evarun.ru:7006/features`);
    this.allFeatures = response.body;
  },
  methods: {
    url(id) {
      return `http://instance.evarun.ru:7007/character/model/${id}`;
    },

    async chooseCharacter() {
      const response = await this.$http.get(this.url(this.desiredCharacterId));
      this.setCharacterModel(response.body.workModel);
    },

    setCharacterModel(model) {
      model.features.forEach((f) => delete f.modifierIds);
      this.characterModel = model;
    },

    async addFeature() {
      const response = await this.$http.post(this.url(this.characterModel.modelId),
        { eventType: 'addFeature', data: { id: this.selectedFeature } });
      this.setCharacterModel(response.body.workModel);
    },

    async removeFeature() {
      const response = await this.$http.post(this.url(this.characterModel.modelId),
        { eventType: 'removeFeature', data: { id: this.selectedFeature } });
      this.setCharacterModel(response.body.workModel);
    },
  }
})
