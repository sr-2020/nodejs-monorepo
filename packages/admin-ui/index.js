var app = new Vue({
  el: '#app',
  data: {
    desiredCharacterId: 128,
    characterModel: undefined,
    allFeatures: undefined,
    selectedFeature: 'magic-1',
  },
  async created() {
    const response = await this.$http.get(`http://model-engine.evarun.ru/features`);
    this.allFeatures = response.body;
  },
  methods: {
    url(id) {
      return `http://models-manager.evarun.ru/character/model/${id}`;
    },

    showSuccessToast(text) {
      this.$bvToast.toast(text, {
        variant: 'success',
      });
    },

    showFailureToast(text) {
      this.$bvToast.toast(text, {
        variant: 'danger',
      });
    },

    async chooseCharacter() {
      try {
        const response = await this.$http.get(this.url(this.desiredCharacterId));
        this.setCharacterModel(response.body.workModel);
        this.showSuccessToast('Персонаж загружен');
      } catch (e) {
        this.showFailureToast(e.status == 404 ? 'Персонаж не найден' : `Неожиданная ошибка сервера: ${e.statusText}`);
      }
    },

    setCharacterModel(model) {
      model.features.forEach((f) => delete f.modifierIds);
      this.characterModel = model;
    },

    async addFeature() {
      const response = await this.$http.post(this.url(this.characterModel.modelId),
        { eventType: 'addFeature', data: { id: this.selectedFeature } });
      this.setCharacterModel(response.body.workModel);
      this.showSuccessToast('Фича добавлена');
    },

    async removeFeature() {
      const response = await this.$http.post(this.url(this.characterModel.modelId),
        { eventType: 'removeFeature', data: { id: this.selectedFeature } });
      this.setCharacterModel(response.body.workModel);
      this.showSuccessToast('Фича удалена');
    },
  }
})
