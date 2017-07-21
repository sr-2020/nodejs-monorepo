"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeusModel {
    constructor() {
        this.memory = []; //Воспоминания
        this.timestamp = 0; //дата обновление модели
        this.conditions = []; //состояния
        this.modifiers = []; //модификаторы (импланты\болезни)
        this.timers = []; //таймеры в модели
        this.changes = []; //Изменения в модели
        this.messages = []; //Сообщения игроку
    }
}
exports.DeusModel = DeusModel;
//# sourceMappingURL=model.js.map