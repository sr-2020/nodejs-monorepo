var app = new Vue({
  el: '#app',
  data: {
    desiredCharacterId: 128,
    characterModel: undefined,
    allFeatures: undefined,
    selectedFeature: 'magic-1',
    clinicalDeathTarget: 128,
    qrCodeId: 1,

    violence: 0,
    control: 0,
    individualism: 0,
    mind: 0,
    ethicOptions: [-4, -3, -2, -1, 0, 1, 2, 3, 4]
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

    async sendEvent(event, successMessage) {
      try {
        console.log(`Sending an event: ${JSON.stringify(event)}`);
        const response = await this.$http.post(this.url(this.characterModel.modelId), event);
        console.debug(`Received response: ${JSON.stringify(response.body)}`);
        this.setCharacterModel(response.body.workModel);
        this.showSuccessToast(successMessage || 'Успех!');
      } catch (e) {
        if (e.body && e.body.error && e.body.error.message) {
          this.showFailureToast(e.body.error.message)
        } else {
          this.showFailureToast('Неизвестная ошибка сервера :(');
        }
      }
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
      model.passiveAbilities.forEach((f) => delete f.modifierIds);
      this.characterModel = model;
      this.violence = model.ethicState.find((s) => s.scale == 'violence').value;
      this.control = model.ethicState.find((s) => s.scale == 'control').value;
      this.individualism = model.ethicState.find((s) => s.scale == 'individualism').value;
      this.mind = model.ethicState.find((s) => s.scale == 'mind').value;
    },

    async addFeature() {
      return this.sendEvent({ eventType: 'addFeature', data: { id: this.selectedFeature } }, 'Фича добавлена');
    },

    async removeFeature() {
      return this.sendEvent({ eventType: 'removeFeature', data: { id: this.selectedFeature } }, 'Фича удалена');
    },

    async wound() {
      return this.sendEvent({ eventType: 'wound' });
    },

    async revive() {
      return this.sendEvent({ eventType: 'revive' });
    },

    async clinicalDeathOnTarget() {
      return this.sendEvent({ eventType: 'clinicalDeathOnTarget', data: { targetCharacterId: this.clinicalDeathTarget } });
    },

    async scanQr() {
      return this.sendEvent({ eventType: 'scanQr', data: { qrCode: this.qrCodeId } });
    },

    async ethicSet() {
      return this.sendEvent({
        eventType: 'ethicSet', data: {
          violence: this.violence,
          control: this.control,
          individualism: this.individualism,
          mind: this.mind
        }
      });
    }
  }
})
