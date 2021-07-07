export interface Software {
  id: string;
  name: string;
  description: string;
  ram: number;
  kind: string;
  charges: number;
}

export const kAllSoftware: Software[] = [
  {
    id: 'soft-spambomb',
    name: 'zip бомба',
    description: 'Неустаревающая классика. Привет ажно из прошлого века\nНенадолго блокирует канал жертвы (linklock) \n\nТип: агент Mem: 3',
    ram: 3,
    kind: 'mine',
    charges: 1
  },
  {
    id: 'soft-spamstorm',
    name: 'спаммер',
    description: 'Забивает канал жертвы петабайтами спама.\nБлокирует канал жертвы (linklock), способен к нескольким активациям\n\nТип: мина Mem: 10 Заряды: 5',
    ram: 10,
    kind: 'mine',
    charges: 5
  },
  {
    id: 'soft-poodle',
    name: 'пудель',
    description: 'Облегченная версия знаменитой Собаки. Наносит меньше урона, но легче и дешевле\nНаносит жертве незначительный урон\n\nТип: мина Dmg: 5 Mem: 3 Заряды: 1',
    ram: 3,
    kind: 'mine',
    charges: 1
  },
  {
    id: 'soft-dog',
    name: 'собака',
    description: 'Живая классика хака. Культовая софтинка воспетая в тысячах шуток, баек и рыбацких историй.\nЗлая собака на страже хоста. Больно кусает и громко лает.\n\nТип: мина Dmg: 10 Mem: 5 Заряды: 1',
    ram: 5,
    kind: 'mine',
    charges: 1
  },
  {
    id: 'soft-viper',
    name: 'гадюка',
    description: 'Злющая мина. Настоящая гадость\n\nТип: мина Dmg: 20 Mem: 7 Заряды: 1',
    ram: 7,
    kind: 'mine',
    charges: 1
  },
  {
    id: 'soft-wasp-nest',
    name: 'осиное гнездо',
    description: 'Злая мина с многократной активацией. Подари им несколько забавных минут!\n\nТип: мина Dmg: 10 Mem: 10 Заряды: 10',
    ram: 10,
    kind: 'mine',
    charges: 10
  },
  {
    id: 'soft-medusa',
    name: 'медуза',
    description: 'Очень неприятная штука. Комбинация урона, многократного срабатывания, линк-лока и аларма. Отичный подарок\n\nТип: мина Dmg: 25 Mem: 10 Заряды: 3',
    ram: 10,
    kind: 'mine',
    charges: 3
  },
  {
    id: 'soft-claymore',
    name: 'клеймор',
    description: 'Названа в честь легендарной мины прошлого века. Поражает всех собравшихся на ноде\n\nТип: мина Dmg: 20 Mem: 15 Заряды: 1',
    ram: 15,
    kind: 'mine',
    charges: 1
  },
  {
    id: 'soft-hunting',
    name: 'охота',
    description: 'Знаменитая мина русских военных хакеров. Неприятна тем, то наносит заметный урон не только на своей ноде, но и на соседних. Удачи с разведкой. Недостаток - ровно один. Очень тяжелая.\n\nТип: мина Dmg: 20 Mem: 20 Заряды: 1',
    ram: 20,
    kind: 'mine',
    charges: 1
  },
  {
    id: 'soft-backdoor',
    name: 'бэкдор',
    description: 'Закладка на чужом хосте, позволяющая зайти в обход правил безопасности. Ну еще можно подарить техноманту на день рождения. Всем хороша, только дохнет быстро\n\nТип: бэкдор Mem: 6',
    ram: 6,
    kind: 'backdoor',
    charges: 1
  },
  {
    id: 'soft-doorway',
    name: 'бэкдор: шоссе',
    description: 'Открытые ворота на чужой хост. Мощный download канал. Серьезная штука для серьезных дел\n\nТип: бэкдор Mem: 9',
    ram: 9,
    kind: 'backdoor',
    charges: 1
  },
  {
    id: 'soft-tract',
    name: 'сибирский тракт',
    description: 'Фирменная фишка русских хакеров. Гениальная по простоте и мощи софтинка. Тихо скачать петабайты инфы? Данивопрос!\n\nТип: бэкдор Mem: 17',
    ram: 17,
    kind: 'backdoor',
    charges: 1
  },
  {
    id: 'soft-glassscreen',
    name: 'стекляшка',
    description: 'Фиговый листок вашей защиты. Зато - дешево.\n\nТип: защита Сопр: 20 Mem: 4 Заряды: 5',
    ram: 4,
    kind: 'armor',
    charges: 5
  },
  {
    id: 'soft-steelscreen',
    name: 'жестянка',
    description: 'про эту защиту можно сказать определенно: она есть\n\nТип: защита Сопр: 30 Mem: 6 Заряды: 5',
    ram: 6,
    kind: 'armor',
    charges: 5
  },
  {
    id: 'soft-fey',
    name: 'фея-крестная',
    description: 'Эта защита спасла жизнь очень-очень многим. Прекрасная, но кратковременная защита от внезапных неприятностей\n\nТип: защита Сопр: 50 Mem: 10 Заряды: 3',
    ram: 10,
    kind: 'armor',
    charges: 3
  },
  {
    id: 'soft-firescreen',
    name: 'ифрит',
    description: 'Этот софт - просто огонь! Вот это - действительно достойный уровень защиты.\n\nТип: защита Сопр: 50 Mem: 15 Заряды: 7',
    ram: 15,
    kind: 'armor',
    charges: 7
  },
  {
    id: 'soft-powerarmor',
    name: 'powerarmor',
    description: 'Тот, кто писал этот шедевр - явно был фаном фолыча. И стопудов шарил в деве как мало кто другой. \nЭто - шедевр защитного искусства\n\nТип: защита Сопр: 70 Mem: 20 Заряды: 10',
    ram: 20,
    kind: 'armor',
    charges: 10
  },
  {
    id: 'soft-lucker',
    name: 'лакер',
    description: 'Ты - везунчик. Да, защита - посредственная, но она защитит тебя от первой мины\n\nТип: защита Сопр: 20 Mem: 18 Заряды: 1',
    ram: 18,
    kind: 'armor',
    charges: 1
  },
  {
    id: 'soft-arondith',
    name: 'арондит',
    description: 'Легендарный ведмачий меч, ага. Слабый и дешевый эксплойт. Студенческая поделка\n\nТип: эксплойт Дмг: 2 Mem: 3 Заряды: 3',
    ram: 3,
    kind: 'weapon',
    charges: 3
  },
  {
    id: 'soft-kipa',
    name: 'кипятльник',
    description: 'Довольно интересный эксплойт принципиально нового типа. Он автоматически подстраивается под атакуемый лед и наносит ему заметный урон. Бесполезен в разборках с декерами\n\nТип: IC-эксплойт  Дмг: 4 Mem: 5 Заряды: 10',
    ram: 5,
    kind: 'weapon',
    charges: 10
  },
  {
    id: 'soft-trotsky',
    name: 'ледоруб Троцкого',
    description: 'для тех, кто любит ДАМАЖИТЬ но не любит лед. Русские военные хакеры знают как выжить при глобальном обледенении\n\nТип: IC-эксплойт Дмг: 7 Mem: 15 Заряды: 15',
    ram: 15,
    kind: 'weapon',
    charges: 15
  },
  {
    id: 'soft-deadloop',
    name: 'мертвая петля',
    description: 'Отличный способ аргументировать свою позицию другому декеру. \n\nТип: эксплойт Дмг: 3 Mem: 9 Заряды: 5',
    ram: 9,
    kind: 'weapon',
    charges: 5
  },
  {
    id: 'soft-alpha',
    name: 'альфа',
    description: 'Альфа-дэмэдж? Да, это про этот эксплойт. Идеально для скоротечных схваток. Жаль, но все хорошее быстро кончается\n\nТип: эксплойт Дмг: 7 Mem: 12 Заряды: 3',
    ram: 12,
    kind: 'weapon',
    charges: 3
  },
  {
    id: 'soft-kalash',
    name: 'калаш',
    description: 'Безотказный и убийственный военных боевой эксплойт. Унылого шахтера с таким не встретишь\n\nТип: эксплойт Дмг: 5 Mem: 15 Заряды: 10',
    ram: 15,
    kind: 'weapon',
    charges: 10
  },
  {
    id: 'soft-grinder',
    name: 'мясокрутка',
    description: 'да серьезно?! эксплойт нейропривода, выжигающий мозг подключенного?! НАСТОЯЩИЙ биофидбек?\nЭтой херни просто не может существовать. Она невозможна. И не должна быть возможна.\nЭто вообще бесполезно в бою, но сочетая ее и подходящее умение можно стать ПАЛАЧОМ и нанести уже поверженному декеру СМЕРТЕЛЬНЫЙ (АС) удар.\nГлавное, чтобы у тебя хватило ДУХА сделать это. Немногие из нас смогут решиться на это. Не в каждых руках она сработает.\n\nТип: смертельный(!) эксплойт Дмг: 1 Mem: 30 Заряды: 1',
    ram: 30,
    kind: 'weapon',
    charges: 1
  },
  {
    id: 'soft-link',
    name: 'линк',
    description: 'Софтинка нейро-грида с корытом. Веселый фермер для нейротензоров. \nЕсли серьезно - то это раутер вычислительных ресурсов нейросети в приемник. \nЧтобы установить - ты должен находиться на ноде с фонтаном и знать дата-трейл к приемнику\n\nТип: агент, выкачка нейротензоров Mem: 9',
    ram: 9,
    kind: 'deployment',
    charges: 1
  },
  {
    id: 'soft-file',
    name: 'файл',
    description: 'файл. И в африке файл. Позволяет создать файл на хосте\n\nТип: агент, файл Mem: 4',
    ram: 4,
    kind: 'deployment',
    charges: 1
  },
  {
    id: 'soft-logger',
    name: 'логгер',
    description: 'Если установить такой софт на ноду с log-api хоста, позволяет поднять уровень логов до TRACE и получить дополнительную инфа о том, что было на хосте\n\nТип: агент Mem: 4',
    ram: 4,
    kind: 'deployment',
    charges: 1
  },
  {
    id: 'soft-bruteforcer',
    name: 'брутфорсер',
    description: 'Мучительно брутфорит пароли. Долго, но надежно. Помогает от некоторых видов льда.\nНужно установить на ноду с нужным льдом и чуть-чуть подождать. Или не чуть-чуть\n\nТип: агент, брутфорсер Mem: 8',
    ram: 8,
    kind: 'deployment',
    charges: 1
  },
  {
    id: 'soft-rainbow',
    name: 'радкга',
    description: 'Забавно, когда разработчик делает опечатку, но ему лень исправить. Это - софт для лентяев. Тех, кому лень подождать. Работает на основе new-rainbow-table алгоритма и подбирает пароли к некоторым видам льда значительно быстрее. \nНужно установить на ноду с нужным льдом\n\nТип: агент, брутфорсер Mem: 14',
    ram: 14,
    kind: 'deployment',
    charges: 0
  },
  {
    id: 'soft-euristic',
    name: 'эврика',
    description: 'К некоторым api нужен особый подход. И тут пригодится эвристический анализатор, который найдет его\nНужно установить на ноду с нужным api\n\nТип: агент Mem: 18',
    ram: 18,
    kind: 'deployment',
    charges: 1
  },
  {
    id: 'soft-hearth',
    name: 'очаг',
    description: 'Приятно вечером собраться у очага с друзьями.. тьфу. Восстанавливает, короче, всех в на ноде какое-то время\n\nТип: агент\n\nMem: 12',
    ram: 12,
    kind: 'deployment',
    charges: 3
  },
  {
    id: 'soft-jumpdrive',
    name: 'джампдрайв',
    description: 'Мина, телепортирует жертву в рандомную ноду хоста\n\nТип: мина Mem: 25 Заряды: 1',
    ram: 25,
    kind: 'deployment',
    charges: 1
  },
  {
    id: 'soft-dump',
    name: 'дамп',
    description: 'Скачанный кусок памяти льда. Пригодится для анализа. \nМожно распаковать только в колдсиме',
    ram: 7,
    kind: 'memory',
    charges: 1
  },
  {
    id: 'soft-cfd',
    name: 'CFD фрагмент',
    description: 'Обрывок данных, занесенный на этот хост великим и ужасным CFD. Невозможно узнать откуда он пришел, но он может содержать что-то ценное\nМожно распаковать только в колдсиме',
    ram: 10,
    kind: 'memory',
    charges: 1
  },
  {
    id: 'soft-paydata',
    name: 'paydata',
    description: 'Зашифрованный файл с данными. Расшифровать его контент вне твоих сил, но такие архивы можно всегда продать на jackpoint\nТам точно есть те, кто заимел быструю имплементацию алгоритма Хальберстама, и пост-квантовая криптография для них не преграда.\nМожно распаковать только в колдсиме\n',
    ram: 7,
    kind: 'memory',
    charges: 1
  },
  {
    id: 'soft-flash',
    name: 'флэшка',
    description: 'Флэшка, да не та. А другая. Ну, та, которая правильная. То есть эксплойт уровня ноды,\nоглушающий, ой,  ну то есть линк-локающий каналы всех на одной ноде с инициатором.\nНу, кроме самого инициатора, разумеется. \n\nТип: бомба  Dmg: 0 Mem: 12 Заряды: 1',
    ram: 12,
    kind: 'bomb',
    charges: 1
  },
  {
    id: 'soft-lemon',
    name: 'лимончик',
    description: 'Некоторые ассоциации вечны. Но да, это массовый боевой эксплойт, поражающий всех на ноде\n(ну, кроме тебя самого)\n\nТип: бомба  Dmg: 20 Mem: 12 Заряды: 1',
    ram: 12,
    kind: 'bomb',
    charges: 1
  },
  {
    id: 'soft-boom',
    name: 'бум-бум',
    description: 'Эти придурки любят засады, да? Ну ща посмотриим, кто и кому засадит.. \nЭта штука выдаст им неплохой урон, да и вдобавок - еще и заблокирует (линклок) их каналы\n\nТип: бомба Dmg: 30 Mem: 16 Заряды: 1',
    ram: 16,
    kind: 'bomb',
    charges: 1
  },
  {
    id: 'soft-armageddon',
    name: 'армагеддон',
    description: 'Эта штука создана романтиками где-то на среднем востоке. Поэтому у нее такое певучее,\nромантическое и наполненное смыслом название. \nЭто не типичная бомба. Автор не смог (или не захотел) исключить инициатора из списка целей\nПоэтому инициатора срабатывание этого эксплойта заденет тоже. \n\nТип: бомба  Dmg: 60 Mem: 40 Заряды: 1',
    ram: 40,
    kind: 'bomb',
    charges: 1
  },
  {
    id: 'soft-leprecon',
    name: 'лепреконка',
    description: 'Сделано из дистилированной удачи! - гласит первая строчка read.me файла. И это правда. \nЭта штука защитит тебя от первых 5 срабатываний мин. Но вот серьезной защиты от атак она, увы, не дает\n\nТип: защита Сопр: 20 Mem: 22 Заряды: 5',
    ram: 22,
    kind: 'armor',
    charges: 5
  }
];
