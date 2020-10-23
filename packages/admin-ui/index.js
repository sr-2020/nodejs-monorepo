Vue.component(VueQrcode.name, VueQrcode);
app = new Vue({
  el: '#app',
  data: {
    desiredCharacterId: 10198,
    desiredQrCodeId: 1,
    characterModel: undefined,
    qrModel: undefined,
    allFeatures: undefined,
    allImplants: undefined,
    allPills: undefined,
    allReagents: undefined,
    allEthicGroups: undefined,
    allDrones: undefined,
    allFocuses: undefined,
    selectedFeature: 'magic-1',
    selectedImplant: 'rcc-alpha',
    selectedPill: 'iodomarin',
    selectedReagent: 'virgo',
    selectedDrone: 'belarus',
    selectedRace: 'meta-norm',
    selectedEthicGroup: 'russian-orthodox-church',
    selectedFocus: 'asparagus',
    clinicalDeathTarget: 130,
    qrCodeId: 1,

    violence: 0,
    control: 0,
    individualism: 0,
    mind: 0,
    ethicOptions: [-4, -3, -2, -1, 0, 1, 2, 3, 4],

    characterQrCodeEncoded: undefined,
    qrCodeEncoded: undefined,

    locusCharges: 5,
    foodNumberOfUses: 5,
    karmaAmount: 10,

    bodyStorageName: '',
    aiName: '',
    reanimateCapsule: {
      essenceGet: 10,
      essenceAir: 15,
      cooldown: 20,
      name: 'Лазарь',
      description: 'Капсула производства России. Работает по воле Господа.',
    },

    nightPauseData: {
      postponeDurationHours: 8,
      pauseDurationHours: 6,
    },

    // TODO(aeremin) Receive from dictionary controller
    allRaces: [
      { id: 'meta-norm', name: 'Норм' },
      { id: 'meta-elf', name: 'Эльф' },
      { id: 'meta-dwarf', name: 'Дварф' },
      { id: 'meta-ork', name: 'Орк' },
      { id: 'meta-troll', name: 'Тролль' },
      { id: 'meta-vampire', name: 'Вампир' },
      { id: 'meta-ghoul', name: 'Гуль' },
      { id: 'meta-eghost', name: 'E-Ghost' },
      { id: 'meta-ai', name: 'AI' },
    ]
  },
  async created() {
    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/features`);
      this.allFeatures = response.body;
      this.allFeatures.sort((f1, f2) => {
        if (f1.humanReadableName > f2.humanReadableName) return 1;
        if (f1.humanReadableName < f2.humanReadableName) return -1;
        return 0;
      });
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

    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/drones`);
      this.allDrones = response.body;
    }

    {
      const response = await this.$http.get(`https://model-engine.evarun.ru/focuses`);
      this.allFocuses = response.body;
    }
  },
  methods: {
    baseUrl() {
      return 'https://models-manager.evarun.ru';
    },

    characterUrl(id) {
      return `${this.baseUrl()}/character/model/${id}`;
    },

    broadcastCharacterUrl() {
      return `${this.baseUrl()}/character/broadcast`;
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
        await this.setCharacterModel(response.body.workModel);
        this.showSuccessToast(successMessage || 'Успех!');
      } catch (e) {
        if (e.body && e.body.error && e.body.error.message) {
          this.showFailureToast(e.body.error.message)
        } else {
          this.showFailureToast('Неизвестная ошибка сервера :(');
        }
      }
    },

    async broadcastCharacterEvent(event, successMessage) {
      try {
        console.log(`Sending a global character event: ${JSON.stringify(event)}`);
        const response = await this.$http.post(this.broadcastCharacterUrl(), event);
        console.debug(`Received response: ${JSON.stringify(response.body)}`);
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
        await this.setCharacterModel(response.body.workModel);
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

    getQrType(model) {
      if (model.currentBody == 'astral') return 9;
      if (model.currentBody == 'drone') return 10;
      if (model.currentBody == 'physical') {
        if (model.healthState == 'healthy') return 5;
        if (model.healthState == 'wounded') return 6;
        if (model.healthState == 'clinically_dead') return 7;
        if (model.healthState == 'biologically_dead') return 8;
      }
    },

    async setCharacterModel(model) {
      model.passiveAbilities.forEach((f) => delete f.modifierIds);
      model.implants.forEach((f) => delete f.modifierIds);
      this.characterModel = model;
      this.violence = model.ethic.state.find((s) => s.scale == 'violence').value;
      this.control = model.ethic.state.find((s) => s.scale == 'control').value;
      this.individualism = model.ethic.state.find((s) => s.scale == 'individualism').value;
      this.mind = model.ethic.state.find((s) => s.scale == 'mind').value;
      const timestamp = Math.round(new Date().getTime() / 1000) + 3600;
      const response = await this.$http.get(`https://qr.aerem.in/encode?type=${this.getQrType(model)}&kind=0&validUntil=${timestamp}&payload=${model.modelId}`);
      this.characterQrCodeEncoded = response.body.content;
    },

    async setQrModel(model) {
      this.qrModel = model;
      const timestamp = Math.round(new Date().getTime() / 1000) + 3600;
      const response = await this.$http.get(`https://qr.aerem.in/encode?type=1&kind=0&validUntil=${timestamp}&payload=${model.modelId}`);
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
      return this.sendCharacterEvent({ eventType: 'installImplant', data: {
        id: this.selectedImplant,
        basePrice: 0,
        rentPrice: 0,
        dealId: '',
        lifestyle: '',
        gmDescription: ''
      } }, 'Имплант установлен');
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

    async dumpshock() {
      return this.sendCharacterEvent({ eventType: 'dumpshock', data: { } });
    },

    async resetCharacter() {
      try {
        const response = await this.$http.put(this.characterUrl(this.characterModel.modelId).replace('/model/', '/default/'), {
          name: this.characterModel.name,
        });
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
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { id: this.selectedImplant } });
    },

    async writePillQr() {
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { id: this.selectedPill } });
    },

    async writeReagentQr() {
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { id: this.selectedReagent } });
    },

    async writeDroneQr() {
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { id: this.selectedDrone } });
    },


    async writeLocusChargeQr() {
      return this.sendQrEvent({
        eventType: 'createMerchandise',
        data: {
          id: 'locus-charge',
          name: '', description: 'Позволяет зарядить любой локус при наличии соответствующей способности ',
          numberOfUses: Number(this.locusCharges)
        }
      });
    },

    async writeLocusQr() {
      return this.sendQrEvent({ eventType: 'createLocusQr', data: { groupId: this.selectedEthicGroup, numberOfUses: Number(this.locusCharges) } });
    },

    async writeBodyStorageToQr() {
      return this.sendQrEvent({ eventType: 'writeBodyStorage', data: { name: this.bodyStorageName } });
    },

    async writeAiSymbolQr() {
      return this.sendQrEvent({ eventType: 'writeAiSymbol', data: { ai: this.aiName } });
    },

    async writeReanimateCapsuleQr() {
      return this.sendQrEvent({ eventType: 'writeReanimateCapsule', data: {
            essenceGet: Number(this.reanimateCapsule.essenceGet),
            essenceAir: Number(this.reanimateCapsule.essenceAir),
            cooldown: Number(this.reanimateCapsule.cooldown),
            name: this.reanimateCapsule.name,
            description: this.reanimateCapsule.description,
        }});
    },

    async writeFoodQr() {
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { numberOfUses: Number(this.foodNumberOfUses), id: 'food'} });
    },

    async writeMeatQr() {
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { numberOfUses: Number(this.foodNumberOfUses), id: 'cow-meat'} });
    },

    async writeBloodQr() {
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { numberOfUses: Number(this.foodNumberOfUses), id: 'cow-blood'} });
    },

    async writeFocusQr() {
      return this.sendQrEvent({ eventType: 'createMerchandise', data: { id: this.selectedFocus } });
    },

    async writeKarmaSourceQr() {
      return this.sendQrEvent({ eventType: 'writeKarmaSource', data: { amount: this.karmaAmount } });
    },

    async writeBuyableFeature() {
      return this.sendQrEvent({ eventType: 'writeBuyableFeature', data: { id: this.selectedFeature } });
    },

    async pauseGame() {
      this.$bvToast.toast('Это долгая операция, пожалуйста, подождите...', {
        autoHideDelay: 40000,
        variant: 'info',
      });
      return this.broadcastCharacterEvent( { eventType: 'pauseAndPostpone', data: {
          postponeDurationHours: Number(this.nightPauseData.postponeDurationHours),
          pauseDurationHours: Number(this.nightPauseData.pauseDurationHours),
        } }, 'Игра поставлена на паузу!');
    }
  }
})
