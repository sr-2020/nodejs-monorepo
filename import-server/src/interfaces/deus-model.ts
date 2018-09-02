import { Condition, Modifier } from 'alice-model-engine-api';
import { System } from './model';

export interface ChangesElement {
  mID: string;
  text: string;
  timestamp: string;
}

export interface Message {
  mID: string;
  title: string;
  text: string;
}

export interface SpaceSuit {
  on: boolean;
  oxygenCapacity: number;
  timestampWhenPutOn: number;
  diseases: any[];
}

export interface DeusModel {
  // disable-next-line:variable-name
  _id: string;         // id в БД == JoinRPG ID
  // tslint:disable-next-line:variable-name
  _rev?: string;       // rev в БД техническое
  login: string;       // login
  firstName: string;   // имя
  nicName?: string;    // ник-нейм
  lastName?: string;   // фамилия
  planet?: string;     // Родная локация
  isAlive: boolean;    // Если false = персонаж мертв
  inGame: boolean;     // Если true - персонаж в игре, и обновлять при импорте эту модель нельзя

  profileType: string;

  systems: System[];

  spaceSuit: SpaceSuit;

  isTopManager: boolean;

  // Техническое
  timestamp: number;           // дата обновление модели
  conditions: Condition[]; // состояния
  modifiers: Modifier[];   // модификаторы (импланты\болезни)
  timers: any[];               // таймеры в модели
  changes: ChangesElement[];   // Изменения в модели
  messages: Message[];         // Сообщения игроку
}
