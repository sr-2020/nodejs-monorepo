var app = new Vue({
  el: '#app',
  data: {
    desiredCharacterId: 128,
    characterModel: undefined,
  },
  methods: {
    async chooseCharacter() {
      const response = await this.$http.get(`http://instance.evarun.ru:7007/character/model/${this.desiredCharacterId}`);
      this.characterModel = response.body.workModel;
    }
  }
})
