Vue.component(VueQrcode.name, VueQrcode);
app = new Vue({
  el: '#app',
  data: {
    desiredCharacterId: 128,
    desiredQrCodeId: 1,
    characterModel: undefined,
    qrModel: undefined,
    allFeatures: undefined,
    allImplants: undefined,
    allPills: undefined,
    allReagents: undefined,
    allEthicGroups: undefined,
    selectedFeature: 'magic-1',
    selectedImplant: 'rcc-alpha',
    selectedPill: 'iodomarin',
    selectedReagent: 'virgo',
    selectedRace: 'meta-norm',
    selectedEthicGroup: 'russian-orthodox-church',
    clinicalDeathTarget: 130,
    qrCodeId: 1,

    violence: 0,
    control: 0,
    individualism: 0,
    mind: 0,
    ethicOptions: [-4, -3, -2, -1, 0, 1, 2, 3, 4],

    qrCodeEncoded: undefined,

    locusCharges: 5,

    allRaces: [
      { id: 'meta-norm', name: 'Норм' },
      { id: 'meta-elf', name: 'Эльф' },
      { id: 'meta-dwarf', name: 'Дварф' },
      { id: 'meta-ork', name: 'Орк' },
      { id: 'meta-troll', name: 'Тролль' },
      { id: 'meta-hmhvv1', name: 'Вампир' },
      { id: 'meta-hmhvv3', name: 'Гуль' },
      { id: 'meta-digital', name: 'Цифровой' },
      { id: 'meta-spirit', name: 'Дух' },
    ]
  },
  async created() {
    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/features`);
      this.allFeatures = response.body;
    }

    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/implants`);
      this.allImplants = response.body;
    }

    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/pills`);
      this.allPills = response.body;
    }

    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/reagents`);
      this.allReagents = response.body;
    }

    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/ethic_groups`);
      this.allEthicGroups = response.body;
    }
  },
  methods: {
    baseUrl() {
      return 'https://models-manager.evarun.ru';
    },

    characterUrl(id) {
      return `${this.baseUrl()}/character/model/${id}`;
    },

    qrUrl(id) {
      return `${this.baseUrl()}/qr/model/${id}`;
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

    async sendCharacterEvent(event, successMessage) {
      try {
        console.log(`Sending a character event: ${JSON.stringify(event)}`);
        const response = await this.$http.post(this.characterUrl(this.characterModel.modelId), event);
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

    async sendQrEvent(event, successMessage) {
      try {
        console.log(`Sending a qr code event: ${JSON.stringify(event)}`);
        const response = await this.$http.post(this.qrUrl(this.qrModel.modelId), event);
        console.debug(`Received response: ${JSON.stringify(response.body)}`);
        this.setQrModel(response.body.workModel);
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
        const response = await this.$http.get(this.characterUrl(this.desiredCharacterId));
        this.setCharacterModel(response.body.workModel);
        this.showSuccessToast('Персонаж загружен');
      } catch (e) {
        this.showFailureToast(e.status == 404 ? 'Персонаж не найден' : `Неожиданная ошибка сервера: ${e.statusText}`);
      }
    },

    async chooseQr() {
      try {
        const response = await this.$http.get(this.qrUrl(this.desiredQrCodeId));
        await this.setQrModel(response.body.workModel);
        this.showSuccessToast('QR-код загружен');
      } catch (e) {
        this.showFailureToast(e.status == 404 ? 'QR-код не найден' : `Неожиданная ошибка сервера: ${e.statusText}`);
      }
    },

    setCharacterModel(model) {
      model.passiveAbilities.forEach((f) => delete f.modifierIds);
      model.implants.forEach((f) => delete f.modifierIds);
      this.characterModel = model;
      this.violence = model.ethic.state.find((s) => s.scale == 'violence').value;
      this.control = model.ethic.state.find((s) => s.scale == 'control').value;
      this.individualism = model.ethic.state.find((s) => s.scale == 'individualism').value;
      this.mind = model.ethic.state.find((s) => s.scale == 'mind').value;
    },

    async setQrModel(model) {
      this.qrModel = model;
      const timestamp = new Date().getTime() / 1000 + 3600;
      const response = await this.$http.get(`http://qr.aerem.in/encode?type=1&kind=0&validUntil=${timestamp}&payload=${model.modelId}`);
      this.qrCodeEncoded = response.body.content;
    },

    async addFeature() {
      return this.sendCharacterEvent({ eventType: 'addFeature', data: { id: this.selectedFeature } }, 'Фича добавлена');
    },

    async removeFeature() {
      return this.sendCharacterEvent({ eventType: 'removeFeature', data: { id: this.selectedFeature } }, 'Фича удалена');
    },

    async wound() {
      return this.sendCharacterEvent({ eventType: 'wound' });
    },

    async revive() {
      return this.sendCharacterEvent({ eventType: 'revive' });
    },

    async clinicalDeathOnTarget() {
      return this.sendCharacterEvent({ eventType: 'clinicalDeathOnTarget', data: { targetCharacterId: this.clinicalDeathTarget } });
    },

    async scanQr() {
      return this.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: this.qrCodeId } });
    },

    async installImplant() {
      return this.sendCharacterEvent({ eventType: 'installImplant', data: { id: this.selectedImplant } }, 'Имплант установлен');
    },

    async removeImplant() {
      return this.sendCharacterEvent({ eventType: 'removeImplant', data: { id: this.selectedImplant } }, 'Имплант удален');
    },

    async ethicSet() {
      return this.sendCharacterEvent({
        eventType: 'ethicSet', data: {
          violence: this.violence,
          control: this.control,
          individualism: this.individualism,
          mind: this.mind
        }
      });
    },

    async ethicTrigger(id) {
      console.log({ eventType: 'ethicTrigger', data: { id } });
      return this.sendCharacterEvent({ eventType: 'ethicTrigger', data: { id } });
    },

    async increaseEssence() {
      return this.sendCharacterEvent({ eventType: 'increaseMaxEssence', data: { amount: 100 } });
    },

    async decreaseEssence() {
      return this.sendCharacterEvent({ eventType: 'increaseMaxEssence', data: { amount: -100 } });
    },

    async resetEssence() {
      return this.sendCharacterEvent({ eventType: 'essenceReset', data: {} });
    },

    async setRace() {
      return this.sendCharacterEvent({ eventType: 'setRace', data: { race: this.selectedRace } });
    },

    async resetCharacter() {
      try {
        const response = await this.$http.put(this.characterUrl(this.characterModel.modelId).replace('/model/', '/default/') + '?noAbilities=true', {});
        await this.sendCharacterEvent({ eventType: '_', data: {} }, 'Персонаж пересоздан!');
      } catch (e) {
        if (e.body && e.body.error && e.body.error.message) {
          this.showFailureToast(e.body.error.message)
        } else {
          this.showFailureToast('Неизвестная ошибка сервера :(');
        }
      }
    },


    async clearQr() {
      return this.sendQrEvent({ eventType: 'clear', data: {} });
    },

    async writeImplantQr() {
      const implant = this.allImplants.find((v) => v.id == this.selectedImplant);
      return this.sendQrEvent({ eventType: 'createMerchandise', data: implant });
    },

    async writePillQr() {
      const pill = this.allPills.find((v) => v.id == this.selectedPill);
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { ...pill, description: 'Какая-то таблетка' } });
    },

    async writeReagentQr() {
      const reagent = this.allReagents.find((v) => v.id == this.selectedReagent);
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { ...reagent, description: '' } });
    },

    async writeLocusChargeQr() {
      return this.sendQrEvent({
        eventType: 'createMerchandise',
        data: {
          id: 'locus-charge',
          name: '', description: 'Позволяет зарядить любой локус при наличии соответствующей способности ',
          numberOfUses: this.locusCharges
        }
      });
    },

    async writeLocusQr() {
      return this.sendQrEvent({ eventType: 'createLocusQr', data: { groupId: this.selectedEthicGroup, numberOfUses: this.locusCharges } });
    },
  }
})
