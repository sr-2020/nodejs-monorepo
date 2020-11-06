export interface Software {
  id: string;
  name: string;
  description: string;
}

export const kAllSoftware: Software[] = [
  { id: 'soft-spambomb', name: 'спам бомба', description: 'ненадолго замедляет противника, блокируя его исходящий канал' },
  { id: 'soft-spamstorm', name: 'спам шторм', description: 'замедляет противника, блокируя его исходящий канал' },
  { id: 'soft-backdoor', name: 'бэкдор', description: 'Закладка на чужом хосте, позвоялющая зайти сзади' },
  { id: 'soft-autobot', name: 'автобот', description: 'слабый, тупой и агресивный лед' },
  { id: 'soft-glassscreen', name: 'гласскрин', description: 'фиговый листок вашей защиты' },
  { id: 'soft-steelscreen', name: 'стилскрин', description: 'про эту защиту можно сказать определенно: она есть' },
  { id: 'soft-firescreen', name: 'файрскрин', description: 'вот это - действительно защита. Броня!' },
  { id: 'soft-slide', name: 'скользяк', description: 'распространенный софт для обхода льда' },
  { id: 'soft-washtub', name: 'корыто', description: 'софтинка для сбора нейротензоров' },
  { id: 'soft-milker', name: 'доилка', description: 'майнер нейротензоров на роднике' },
  { id: 'soft-link', name: 'линк', description: 'софтинка для связи доилки с корытом' },
  { id: 'soft-file', name: 'файл', description: 'файл. И в африке файл' },
  { id: 'soft-trotsky', name: 'ледоруб Троцкого', description: 'для тех, кто любит ДАМАЖИТЬ но не любит лед.' },
  { id: 'soft-deadloop', name: 'мертвая петля', description: 'хороший способ аргументировать свою позицию другому декеру' },
  {
    id: 'soft-grinder',
    name: 'мясокрутка',
    description: 'да серьезно?! эксплойт нейропривода, выжиагающий мозг подключенного?! биофидбек?',
  },
  { id: 'soft-logger', name: 'логгер', description: 'дополнительная инфа о том, что было на хосте' },
  { id: 'soft-info', name: 'информер', description: 'редкая штука. Почти как логер, только интерактивный' },
  { id: 'sofr-void', name: 'void', description: 'эта хрень убивает. навесегда.' },
];
