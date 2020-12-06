import { Concentrations } from '@alice/sr2020-common/models/sr2020-character.model';

export interface Pill {
  id: string;
  name: string;
  content: Partial<Concentrations>;
}

export const kAllPills: Pill[] = [
  { id: 'gelteq', name: 'Гельтек', content: { teqgel: 200 } },
  { id: 'iodomarin', name: 'Йодомарин', content: { iodine: 200, junius: 100, custodium: 100 } },
  { id: 'argo', name: 'Арго', content: { argon: 200, iodine: 100, junius: 100 } },
  { id: 'rainbow', name: 'Радуга', content: { radium: 200, silicon: 100, opium: 100 } },
  { id: 'jack', name: 'Жак', content: { custodium: 200, chromium: 100, magnium: 100 } },
  { id: 'cairi', name: 'Каири', content: { junius: 200, custodium: 100, chromium: 100 } },
  { id: 'vampire-saliva', name: 'Слюна вампира', content: { vampirium: 9000 } },
  { id: 'gelteq-p', name: 'Гельтек-П', content: { teqgel: 100 } },
  { id: 'gelteq-s', name: 'Гельтек-С', content: { teqgel: 50 } },
  { id: 'iodomarin-p', name: 'Йодомарин-П', content: { iodine: 200, junius: 60, custodium: 40 } },
  { id: 'argo-p', name: 'Арго-П', content: { argon: 200, iodine: 60, junius: 40 } },
  { id: 'raibow-p', name: 'Радуга-П', content: { radium: 200, silicon: 60, opium: 40 } },
  { id: 'jack-p', name: 'Жак-П', content: { custodium: 200, chromium: 60, magnium: 40 } },
  { id: 'cairi-p', name: 'Каири-П', content: { junius: 200, custodium: 60, chromium: 40 } },
  { id: 'apollo', name: 'Аполло', content: { polonium: 200, argon: 100, iodine: 80 } },
  { id: 'watson', name: 'Ватсон', content: { opium: 200, polonium: 100, argon: 80 } },
  { id: 'pam', name: 'Пэм', content: { silicon: 200, opium: 100, polonium: 80 } },
  { id: 'magni', name: 'Магни', content: { magnium: 200, radium: 100, silicon: 80 } },
  { id: 'aist', name: 'Аист', content: { chromium: 200, magnium: 100, radium: 80 } },
  { id: 'apollo-p', name: 'Аполло-П', content: { polonium: 200, argon: 60, iodine: 60 } },
  { id: 'watson-p', name: 'Ватсон-П', content: { opium: 200, polonium: 60, argon: 60 } },
  { id: 'pam-p', name: 'Пэм-П', content: { silicon: 200, opium: 60, polonium: 60 } },
  { id: 'magni-p', name: 'Магни-П', content: { magnium: 200, radium: 60, silicon: 60 } },
  { id: 'aist-p', name: 'Аист-П', content: { chromium: 200, magnium: 60, radium: 60 } },
  { id: 'samurai-combo', name: 'Самурай комбо', content: { iodine: 100, polonium: 100, barium: 100 } },
  { id: 'samurai-supercombo', name: 'Самурай суперкомбо', content: { iodine: 60, polonium: 60, barium: 60 } },
  { id: 'face-combo', name: 'Фейс комбо', content: { argon: 100, silicon: 100, magnium: 100, opium: 100 } },
  { id: 'face-supercombo', name: 'Фейс суперкомбо', content: { argon: 60, silicon: 60, magnium: 60, opium: 60 } },
  { id: 'techno-combo', name: 'Техно комбо', content: { radium: 100, junius: 100 } },
  { id: 'techno-supercombo', name: 'Техно суперкомбокомбо', content: { radium: 60, junius: 60 } },
  { id: 'mag-combo', name: 'Маг комбо', content: { custodium: 100, chromium: 100 } },
  { id: 'mag-supercombo', name: 'Маг суперкомбо', content: { custodium: 60, chromium: 60 } },
  { id: 'military-combo', name: 'Военные комбо', content: { uranium: 100, moscovium: 100, iconium: 100 } },
  { id: 'military-supercombo', name: 'Военные суперкомбо', content: { uranium: 60, moscovium: 60, iconium: 60 } },
  { id: 'activated-coal', name: 'Активированный Уголь', content: { elba: 200, iconium: 100, moscovium: 100 } },
  { id: 'browny', name: 'Брауни', content: { barium: 200, elba: 100, iconium: 100 } },
  { id: 'preper', name: 'Препер', content: { uranium: 200, barium: 100, elba: 100 } },
  { id: 'yurgen', name: 'Юрген', content: { moscovium: 200, uranium: 100, barium: 100 } },
  { id: 'skrepa', name: 'Скрепа', content: { iconium: 200, moscovium: 100, uranium: 100 } },
  { id: 'coal-p', name: 'Уголь-П', content: { elba: 200, iconium: 60, moscovium: 40 } },
  { id: 'browny-p', name: 'Брауни-П', content: { barium: 200, elba: 60, iconium: 40 } },
  { id: 'preper-p', name: 'Препер-П', content: { uranium: 200, barium: 60, elba: 40 } },
  { id: 'yurgen-p', name: 'Юрген-П', content: { moscovium: 200, uranium: 60, barium: 40 } },
  { id: 'skrepa-p', name: 'Скрепа-П', content: { iconium: 200, moscovium: 60, uranium: 40 } },
];
