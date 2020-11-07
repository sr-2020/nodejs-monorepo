export interface Software {
  id: string;
  name: string;
  description: string;
  ram: number;
}

export const kAllSoftware: Software[] = [
  { id: 'soft-spambomb', name: 'спам бомба', description: 'ненадолго замедляет противника, блокируя его исходящий канал', ram: 2 },
  { id: 'soft-spamstorm', name: 'спам шторм', description: 'замедляет противника, блокируя его исходящий канал', ram: 4 },
  { id: 'soft-backdoor', name: 'бэкдор', description: 'Закладка на чужом хосте, позвоялющая зайти сзади', ram: 6 },
  { id: 'soft-autobot', name: 'автобот', description: 'слабый, тупой и агресивный лед', ram: 12 },
  { id: 'soft-glassscreen', name: 'гласскрин', description: 'фиговый листок вашей защиты', ram: 4 },
  { id: 'soft-steelscreen', name: 'стилскрин', description: 'про эту защиту можно сказать определенно: она есть', ram: 6 },
  { id: 'soft-firescreen', name: 'файрскрин', description: 'вот это - действительно защита. Броня!', ram: 8 },
  { id: 'soft-slide', name: 'скользяк', description: 'распространенный софт для обхода льда', ram: 6 },
  { id: 'soft-washtub', name: 'корыто', description: 'софтинка для сбора нейротензоров', ram: 12 },
  { id: 'soft-milker', name: 'доилка', description: 'майнер нейротензоров на роднике', ram: 4 },
  { id: 'soft-link', name: 'линк', description: 'софтинка для связи доилки с корытом', ram: 4 },
  { id: 'soft-file', name: 'файл', description: 'файл. И в африке файл', ram: 4 },
  { id: 'soft-trotsky', name: 'ледоруб Троцкого', description: 'для тех, кто любит ДАМАЖИТЬ но не любит лед.', ram: 6 },
  { id: 'soft-deadloop', name: 'мертвая петля', description: 'хороший способ аргументировать свою позицию другому декеру', ram: 6 },
  {
    id: 'soft-grinder',
    name: 'мясокрутка',
    description: 'да серьезно?! эксплойт нейропривода, выжиагающий мозг подключенного?! биофидбек?',
    ram: 10,
  },
  { id: 'soft-logger', name: 'логгер', description: 'дополнительная инфа о том, что было на хосте', ram: 4 },
  { id: 'soft-info', name: 'информер', description: 'редкая штука. Почти как логер, только интерактивный', ram: 12 },
  { id: 'sofr-void', name: 'void', description: 'эта хрень убивает. навесегда.', ram: 2 },
];
