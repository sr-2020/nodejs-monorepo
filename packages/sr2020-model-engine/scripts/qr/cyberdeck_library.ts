export interface CyberDeck {
  id: string;
  name: string;
  description: string;
  modSlots: number;
  overclockingLimit: number;
  attack: number;
  sleaze: number;
  firewall: number;
  dataProcessing: number;
  softLimit: number;
}

export const kALlCyberDecks: CyberDeck[] = [
  {
    id: 'cyberdeck-microtronic',
    name: 'Микротроника',
    description: 'Широко распространенная кибердека',
    modSlots: 2,
    overclockingLimit: 10,
    attack: 0.1,
    sleaze: 0.1,
    firewall: 0.1,
    dataProcessing: 0.1,
    softLimit: 10,
  },
  {
    id: 'cyberdeck-chariot',
    name: 'Колесница',
    description: 'Больше слотов - больше гибкость!',
    modSlots: 4,
    overclockingLimit: 20,
    attack: 0.1,
    sleaze: 0.1,
    firewall: 0.1,
    dataProcessing: 0.1,
    softLimit: 20,
  },
  {
    id: 'cyberdeck-navigator',
    name: 'Навигатор',
    description: 'Можно ставить мощные моды, но слотов стало меньше.',
    modSlots: 3,
    overclockingLimit: 30,
    attack: 0.1,
    sleaze: 0.1,
    firewall: 0.1,
    dataProcessing: 0.1,
    softLimit: 20,
  },
  {
    id: 'cyberdeck-excalibur',
    name: 'Экскалибур',
    description: 'Любимый инструмент декера.',
    modSlots: 4,
    overclockingLimit: 40,
    attack: 0.1,
    sleaze: 0.1,
    firewall: 0.1,
    dataProcessing: 0.1,
    softLimit: 30,
  },
];
