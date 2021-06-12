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
    description: 'Скажем прямо: это калькулятор. Очень дешево и очень плохо\n\nA: 0% F: 0% S: 0 % D: 0% Mem: 10',
    modSlots: 3,
    overclockingLimit: 10,
    softLimit: 10,
    attack: 0,
    firewall: 0,
    sleaze: 0,
    dataProcessing: 0
  },
  {
    id: 'cyberdeck-dray',
    name: 'Телега',
    description: 'Архаичная дека из славного прошлого. В свое время славилась огромным объемом памяти, который не выглядит маленьким даже сегодня\n\nA: 0% F: 0% S: 0 % D: 0% Mem: 20',
    modSlots: 3,
    overclockingLimit: 20,
    softLimit: 20,
    attack: 0,
    firewall: 0,
    sleaze: 0,
    dataProcessing: 0
  },
  {
    id: 'cyberdeck-chariot',
    name: 'Колесница',
    description: 'Ходит слух, что эту деку назвали Колесницей чтобы потроллить разработчиков Телеги. Потому что бывает то, на чем возят картошку, и то, на чем ходят в бой. И это - боевая колесница.\nЭто первая в истории дека со встренным скилвайром, усиливающим способности декера\n\nA: 10% F: 10% S: 10 % D: 10% Mem: 10',
    modSlots: 3,
    overclockingLimit: 10,
    softLimit: 10,
    attack: 10,
    firewall: 10,
    sleaze: 10,
    dataProcessing: 10
  },
  {
    id: 'cyberdeck-plamya',
    name: 'Пламя',
    description: 'Легендарная дека русских военных хакеров начала 2080х. Оверклокнута так, что на ней в пору готовить яичницу. Но свое дело - делает на славу. Только недавно появилась в гражданском обороте.\n\nA: 15% F: 15% S: 10 % D: 10% Mem: 20',
    modSlots: 3,
    overclockingLimit: 20,
    softLimit: 20,
    attack: 15,
    firewall: 15,
    sleaze: 10,
    dataProcessing: 10
  },
  {
    id: 'cyberdeck-deus',
    name: 'Деус',
    description: 'Эта дека просто божественна. Идеальный баланс передового скилвайра и памяти! Излюбленный иструмент настоящих профи\n\nA: 20% F: 20% S: 20 % D: 20% Mem: 25',
    modSlots: 3,
    overclockingLimit: 25,
    softLimit: 25,
    attack: 20,
    firewall: 20,
    sleaze: 20,
    dataProcessing: 20
  },
  {
    id: 'cyberdeck-atlantis',
    name: 'Атлантис',
    description: 'Дека, построенная на платфоре легендарного Деуса. Из нее пытались выжать немного больше, чем-то пожертвовав. Узкие специалисты очень ценят ее\n\nA: 25% F: 25% S: 10 % D: 10% Mem: 20',
    modSlots: 3,
    overclockingLimit: 20,
    softLimit: 20,
    attack: 25,
    firewall: 25,
    sleaze: 10,
    dataProcessing: 10
  },
  {
    id: 'cyberdeck-mole',
    name: 'Крот',
    description: 'Копия деки легендарного шахтера car1os, запущенная в серийное производство с минимальными изменениями. Отличный инструмент для тихого собирательства.\n\n\nA: 10% F: 10% S: 25 % D: 25% Mem: 30',
    modSlots: 3,
    overclockingLimit: 30,
    softLimit: 30,
    attack: 10,
    firewall: 10,
    sleaze: 25,
    dataProcessing: 25
  },
  {
    id: 'cyberdeck-courier',
    name: 'Курьер',
    description: 'Крайне интересная дека. Из нее выкинуто просто ВСЕ лишнее, чтобы только впихнуть внее как можно больше памяти\n\n\nA: 0% F: 0% S: 10 % D: 0% Mem: 50',
    modSlots: 3,
    overclockingLimit: 50,
    softLimit: 50,
    attack: 0,
    firewall: 0,
    sleaze: 10,
    dataProcessing: 0
  },
  {
    id: 'cyberdeck-navigator',
    name: 'Навигатор',
    description: 'Апгрейд легендарного Деуса, устраняющий главную его слабость: память\n\n\nA: 25% F: 25% S: 25 % D: 25% Mem: 35',
    modSlots: 3,
    overclockingLimit: 35,
    softLimit: 35,
    attack: 25,
    firewall: 25,
    sleaze: 25,
    dataProcessing: 25
  },
  {
    id: 'cyberdeck-excalibur',
    name: 'Экскалибур',
    description: 'Ультра современная боевая дека. Выпускается малыми сериями. Очень мощная и опасная. Мечта.\n\n\nA: 30% F: 30% S: 20 % D: 20% Mem: 40',
    modSlots: 3,
    overclockingLimit: 40,
    softLimit: 40,
    attack: 30,
    firewall: 30,
    sleaze: 20,
    dataProcessing: 20
  },
  {
    id: 'cyberdeck-molydeus',
    name: 'Молидеус',
    description: 'Божественно, невозможно, невыносимо хороша.\nНазвана в честь легендарного хакера прошлого.\n Не стоит говорить, что у тебя есть ОНА. Иначе у нее может быстро появиться новый хозяин\n\nA: 33% F: 33% S: 33 % D: 33% Mem: 50',
    modSlots: 3,
    overclockingLimit: 50,
    softLimit: 50,
    attack: 33,
    firewall: 33,
    sleaze: 33,
    dataProcessing: 33
  }
];
