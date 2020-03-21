import { oneTimeRevive, dummyAbility } from './abilities';
import { useMentalAbility } from './mental';

export type TargetType = 'none' | 'scan' | 'show';

export interface ActiveAbility {
  id: string;
  humanReadableName: string;
  description: string;
  target: TargetType;
  prerequisites?: string[];
  eventType: string;
}

// Not exported by design, use kAllActiveAbilities instead.
export const kAllActiveAbilitiesList: ActiveAbility[] = [
  {
    id: 'ground-heal-ability',
    humanReadableName: 'Ground Heal',
    description: 'Поднимает одну цель из КС/тяжрана в полные хиты.',
    target: 'show',
    eventType: oneTimeRevive.name,
  },

  {
    id: 'mugger',
    humanReadableName: 'Грабеж',
    description: '',
    // 58
    // при добивании из Тяжа в КС - получает процент от бабла жертвы (10%). Создаётся перевод без обоснования
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'absolutely-finish-him',
    humanReadableName: 'абсолютная смерть',
    description: '',
    // 64
    // добивание до АС (из тяжрана или КС)
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'finish-him',
    humanReadableName: 'добивание тела из тяжрана в КС',
    description: '',
    // 113
    // требует уровня Насилия
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'enter-vr',
    humanReadableName: 'зайти в Виар',
    description: '',
    // 195
    // дает возможность персонажу зайти в Виар на 2 часа (или сколько-то), кулдаун есть.  Увеличение длительности виара ИЛИ уменьшение кулдауна - спец абилки.
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'merge-shaman',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    // 245
    // Устанавливает спрайт в ноду.
    // Самый простой вариант - это бэкдор, то есть обеспечивает временную возможность работы с Контролем этого хоста из-вне матрицы. Крутота бэкдора зависит от крутоты спрайта.
    //
    // IT: Сканирует комнату данжа, сканирует спрайта, вызов REST Матрицы
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'merge-cyberadept',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    // 246
    // Устанавливает спрайт в ноду.
    // Самый простой вариант - это бэкдор, то есть обеспечивает временную возможность работы с Контролем этого хоста из-вне матрицы. Крутота бэкдора зависит от крутоты спрайта.
    //
    // IT: Сканирует комнату данжа, сканирует спрайта, вызов REST Матрицы
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'awareness',
    humanReadableName: 'Насторожиться',
    description:
      'Ты можешь внимательно присмотреться к спрайтам в комнате. И какие-то из них явно не местные! Подозрительно...\n\nОбнаруживает вмерженные (то есть установленные другими хакерами) спрайты в этой ноде',
    // 247
    // Способ поиска чужих спрайтов (например - бэкдоров) в этой ноде хоста Основания.
    //
    // IT: Сканирует комнату данжа, вызов REST Матрицы Кривды, отобразить текст
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'exterminatus',
    humanReadableName: 'Экстерминатус',
    description:
      'Ты можешь сконцентрироваться и разрушительный импульс, который уничтожит часть (зависит от Резонанса) спрайтов, вмерженных в эту Ноду\n',
    // 248
    // Способ уничтожения чужих спрайтов. У нас нет таргетинга, поэтому удаляем рандомых спрайтов, число которых зависит от Резонанса
    //
    // IT: Сканирует комнату данжа, вызов REST Матрицы Кривды, отобразить текст
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'looking-for-trouble',
    humanReadableName: 'ГдеСрач?!',
    description:
      'Ты теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в Основание (на стойке)\nВыдает список хостов, на которых есть техноманты и уровень группы. Чем сильнее твой Резонанс, тем меньше шансов у них остаться незамеченными',
    // 252
    // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
    //
    // IT: вызов Кривдиного REST, отобразить текст
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'chieftain',
    humanReadableName: 'Вождь',
    description:
      'Это самый ценный из даров. Дар подарить Дар другому. Ты можешь разбудить в Госте Основания его суть, его природу, дав ему возможность по-настоящему почувстовать Матрицу. Цель пробудится и сможет стать техномантом',
    // 254
    // Ритуал инициации техноманта.
    //
    // IT: Цель: [+1] к характеристике МожетСтатьТехномантом
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'oblivion',
    humanReadableName: 'Забвение',
    description: 'Целевой персонаж не помнит события последней сцены. Работает только, если персонажу не был нанесен урон (сняты хиты).',
    // 306
    // Целевой персонаж забывает события "этой сцены", если персонажу не был нанесен физический урон (снят хотя бы 1 хит) за это время.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'full-oblivion',
    humanReadableName: 'Полное Забвение',
    description: 'Персонаж не помнит события последней сцены.',
    // 307
    // Персонаж забывает события "этой сцены", даже если персонажу был нанесен физический урон (снят хотя бы 1 хит) за это время.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'cloud-memory',
    humanReadableName: 'Облачная память (вариант? )',
    description: 'Персонаж не забывает события перед КС',
    // 308
    // Целевой персонаж не забывает события перед КС. Для менталиста эта абилка  активная, кулдаун 4 часа. У целевого персонажа в приложеньке где-то отображается, что он теперь не забывает события перед КС.
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'tell-me-truth',
    humanReadableName: 'Скажи как есть.',
    description: 'Целевой персонаж честно отвечает на 3 вопроса. \nТы честно отвечаешь на ',
    // 311
    // Цель честно отвечает на 3 вопроса.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'lie-to-me',
    humanReadableName: 'Лай ту ми',
    description: 'Целевой персонаж не может скрыть свою ложь.',
    // 312
    // Цель озвучивает какой-то признак (щелканье пальцами, пожимание плечами, заикание), и в течение беседы в следующие 10 минут должна воспроизводить этот признак, если врет.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'trust-me',
    humanReadableName: 'Траст ми.',
    description: '',
    // 313
    // Цель на 10 минут принимает одно утверждение как истину - при условии, что оно не требует действий, явно противоречащих текущему кодексу персонажа. Если у цели уже есть действующая установка, то та установка забывается и начинает действовать эта.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'danila-i-need-help',
    humanReadableName: 'Данила, ай нид хелп.',
    description:
      'Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 1 экономический цикл). Выполнение услуги не должно занимать больше 10 минут.',
    // 314
    // Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 1 экономический цикл). Выполнение услуги не должно занимать больше 10 минут.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'luke-i-am-your-father',
    humanReadableName: 'Люк, я твой отец.',
    description: 'Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.',
    // 315
    // Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'fly-you-fool',
    humanReadableName: 'Беги отсюда',
    description:
      'Цель боится и убегает как можно дальше от менталиста. У цели заблоктрована активация всех абилок на 10 минут. Через 10 минут эффект проходит.',
    // 316
    // Цель боится и убегает как можно дальше от менталиста. Через 10 минут эффект проходит.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'paralysis-1',
    humanReadableName: 'Оцепенение',
    description: 'Цель не может двигаться 5 минут или пока ей не нанесён физический урон (-1хит)',
    // 317
    // Цель не может двигаться 5 минут или пока ей не нанесён физический урон (-1хит)
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'paralysis-2',
    humanReadableName: 'Паралич движения',
    description: 'Цель не может двигаться 10 минут.',
    // 318
    // Цель не может двигаться 10 минут.
    target: 'show',
    prerequisites: ['paralysis-1'],
    eventType: useMentalAbility.name,
  },

  {
    id: 'paralysis-3',
    humanReadableName: 'Паралич полный',
    description: 'Цель не может двигаться и произносить звуки 10 минут.',
    // 319
    // Цель не может двигаться и говорить 10 минут.
    target: 'show',
    prerequisites: ['paralysis-2'],
    eventType: useMentalAbility.name,
  },

  {
    id: 'scorn-him',
    humanReadableName: 'Птибурдюков, тебя я презираю',
    description:
      'Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям ) ',
    // 320
    // Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям )
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'kill-him',
    humanReadableName: 'Агрессия',
    description: 'Цель пытается убить персонажа, на которого указывает менталист.',
    // 321
    // Цель пытается убить персонажа, на которого указывает менталист.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'really-need-it',
    humanReadableName: 'Очень надо.',
    description: 'Цель дарит менталисту 1 игровой предмет по выбору менталиста. (Прописать, что нельзя подарить дрон, например)',
    // 322
    // Цель дарит менталисту 1 игровой предмет по выбору менталиста.
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'billioner-walk',
    humanReadableName: 'Прогулка миллионера',
    description: 'Цель переводит на счет менталиста некоторую часть денег со своего счета.',
    // 323
    // Убеждает жертву перевести со своего на счет менталиста Х% (15% например)
    target: 'show',
    eventType: useMentalAbility.name,
  },

  {
    id: 'increase-the-mental-protection',
    humanReadableName: '',
    description: 'на 24 часа увеличивает сопротивляемость целевого персонажа ментальному воздействию. ',
    // 330
    // Добавляет +8 к ментальной защите целевого персонажа  на 24 часа
    // TODO(https://trello.com/c/9rQMWoDJ/201-реализовать-менталистские-абилки-влияющие-на-параметры-увеличивающие-уменьшающие-харизму-ментальную-защиту-атаку-меняющие-кулдау)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'reduce-the-mental-protection',
    humanReadableName: '',
    description: 'на 12 часов  уменьшает сопротивляемость целевого персонажа ментальному воздействию. ',
    // 331
    // Добавляет -8 к ментальной защите целевого персонажа на 12 часов
    // TODO(https://trello.com/c/9rQMWoDJ/201-реализовать-менталистские-абилки-влияющие-на-параметры-увеличивающие-уменьшающие-харизму-ментальную-защиту-атаку-меняющие-кулдау)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'i-dont-trust-anybody',
    humanReadableName: 'Я никому не верю',
    description: 'Временно увеличивает сопротивляемость менталиста ментальному воздействию.',
    // 332
    // Менталист увеличивает свою ментальную защиту на +8 на 30 минут.
    // TODO(https://trello.com/c/9rQMWoDJ/201-реализовать-менталистские-абилки-влияющие-на-параметры-увеличивающие-уменьшающие-харизму-ментальную-защиту-атаку-меняющие-кулдау)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'you-dont-trust-anybody',
    humanReadableName: 'Ты никому не веришь',
    description: 'Временно увеличивает сопротивляемость персонажа ментальному воздействию.',
    // 333
    // Менталист увеличивает ментальную защиту другого персонажа на +8 на 30 минут
    // TODO(https://trello.com/c/9rQMWoDJ/201-реализовать-менталистские-абилки-влияющие-на-параметры-увеличивающие-уменьшающие-харизму-ментальную-защиту-атаку-меняющие-кулдау)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'how-much-it-costs',
    humanReadableName: 'Чо почем',
    description: 'посмотреть на qr и сказать сколько это стоит, базовую цену товара',
    // 347
    // посмотреть на qr и сказать сколько это стоит, базовую цену товара
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'who-needs-it',
    humanReadableName: '',
    description: 'Гешефтмахер может сказать кому это нужно. ',
    // 348
    // посмотреть на qr и сказать кому это может быть нужно. после сканирования куар в приложеньке гм должно отобразиться персонажи с какими аспектами это используют. В идеале - какой квест есть на эту сущность.
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'let-me-pay',
    humanReadableName: 'Давай я заплачу',
    description: 'ГМ может переписать кредит за 1 предмет на себя',
    // 349
    // ГМ может переписать кредит за 1 предмет на себя и может применить свой коэффициент скоринга на текущий момент.
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'let-him-pay',
    humanReadableName: 'Давай он заплатит',
    description: 'переписать долг за 1 предмет по выбору с персонажа А на персонажа Б.',
    // 350
    // переписать долг за 1 предмет по выбору с персонажа А на персонажа Б. Должно быть добровольное согласие персонажа А и персонажа  Б.
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'investigate-scoring',
    humanReadableName: 'Посмотрим скоринг',
    description: 'Ты можешь посмотреть из каких коэффициентов состоит скоринг другого персонажа',
    // 352
    // Показывает актуальные коэффициенты, которые влияют на скоринг.
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 're-rent',
    humanReadableName: 'Переоформить ренту',
    description: 'ГМ может целевому персонажу переоформить контракт с новым коэфициентом скоринга. ',
    // 353
    // Целевому персонажу переоформить контракт с новым коэфициентом скоринга.
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'where-to-buy-it',
    humanReadableName: '',
    description: 'где это продается',
    // 380
    // где это продается
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'anonymous-transaction',
    humanReadableName: 'фиксер',
    description: 'гм производит анонимный перевод между двумя персонажами. ',
    // 381
    // анонимизация перевода - IT генерирует в логах  для игроков левые транзакции вместо реальной
    // TODO(https://trello.com/c/RjyocJn3/200-реализовать-активные-гешефтмахерские-абилки-переписывание-кредитов-просмотр-скоринга)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'astral-body-1',
    humanReadableName: 'Астральное тельце',
    description: 'Ненадолго перейти в астральное тело, слабо готовое к астральному бою',
    // 448
    // Время действия 15 минут, кулдаун 45 минут После активации маг переключается в астральное тело. У него 2 хита, 2 меча и 1 щит
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'astral-body-2',
    humanReadableName: 'Астральное тело',
    description: 'Перейти в астральное тело, готовое к астральному бою',
    // 449
    // Время действия 45 минут, кулдаун 55 минут После активации маг переключается в астральное тело. У него 5 хитов, 4 меча и 3 щита
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'astral-body-3',
    humanReadableName: 'Корпус А',
    description: 'На долгий срок перейти в астральное тело, отлично готовое к астральному бою.',
    // 450
    // Время действия 120 минут, кулдаун 125 минут После активации маг переключается в астральное тело. У него 12 хитов, 6 мечей и 5 щитов
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'silentium-est-aurum',
    humanReadableName: 'Silentium est aurum',
    description: 'Временно частично изменить цели ее ауру',
    // 453
    // Время действия 60 минут. Кулдаун 40 минут. Аура цели на это время случайным образом меняется на 20% (и случайный фрагмент, и на случайное значение).
    // TODO(https://trello.com/c/qATKkQtq/140-магия-реализовать-способности-связанные-с-аурой-silentium-est-aurum-light-step-dictator-control)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'blood-feast',
    humanReadableName: 'Blood Feast',
    description: 'Извлечение доз крови из жертв, у которых сканируются qr-коды мясных тел',
    // 455
    // - время действия 5 минут, кулдаун 30 минут. За время активации можно сосканировать Qr-код мясных тел до 3 уникальных целей (добровольно или в тяжране) - это приведет к созданию соответствующего количества чипов “кровь”.  Если цель не была в тяжране, то она там оказывается.
    // TODO(https://trello.com/c/bzPOYhyP/171-реализовать-заклинания-и-абилки-связанные-с-чипами-крови-blood-feast-bathory-charger-sense-of-essence)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'hammer-of-justice',
    humanReadableName: 'Hammer of Justice',
    description: 'Активируемый статус "тяжелое" для одноручного оружия',
    // 459
    // - время действия 10+N минут, кулдаун 5 минут. Одноручное оружие считается тяжёлым. N=умвл*3 минут
    // TODO(https://trello.com/c/Tkifs8m7/143-магия-реализовать-способности-адептов-связанные-с-боевкой-hammer-of-justice-arrowgant-trollton-i-will-survive-stand-up-and-fight)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'arrowgant',
    humanReadableName: 'Arrowgant',
    description: 'Активируемая защита от дистанционного легкого оружия',
    // 460
    // - время действия 5+N минут, кулдаун 15 минут. Дает защиту от дистанционных атак (только от нерфов). N=умвл*1 минут
    // TODO(https://trello.com/c/Tkifs8m7/143-магия-реализовать-способности-адептов-связанные-с-боевкой-hammer-of-justice-arrowgant-trollton-i-will-survive-stand-up-and-fight)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'trollton',
    humanReadableName: 'Trollton',
    description: 'Активируемая тяжелая броня',
    // 461
    // - время действия 5+N минут, кулдаун 30 минут. Дает тяжелую броню. N=умвл*2 минут
    // TODO(https://trello.com/c/Tkifs8m7/143-магия-реализовать-способности-адептов-связанные-с-боевкой-hammer-of-justice-arrowgant-trollton-i-will-survive-stand-up-and-fight)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'i-will-survive',
    humanReadableName: 'I will survive ',
    description: 'Активируемая возможность подняться из тяжрана в течение некоторого времени',
    // 462
    // - время действия 5+N минут, кулдаун 20 минут. Позволяет автоматически подняться из тяжрана через 30с с полным запасом текущих хитов. N=умвл*2 минут
    // TODO(https://trello.com/c/Tkifs8m7/143-магия-реализовать-способности-адептов-связанные-с-боевкой-hammer-of-justice-arrowgant-trollton-i-will-survive-stand-up-and-fight)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'stand-up-and-fight',
    humanReadableName: 'Stand up and fight ',
    description: 'Излечение цели',
    // 463
    // - мгновенное, кулдаун 30 минут. Позволяет поднять из тяжрана N других персонажей с полным запасом текущих хитов. N зависит от уровня маны в локации. При умвл < 6, N=1. Иначе 2
    // TODO(https://trello.com/c/Tkifs8m7/143-магия-реализовать-способности-адептов-связанные-с-боевкой-hammer-of-justice-arrowgant-trollton-i-will-survive-stand-up-and-fight)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'fresh-new-day',
    humanReadableName: 'Fresh new day ',
    description: 'Перезарядка артефакта',
    // 464
    // - мгновенное, кулдаун 60 минут. Позволяет восстановить от 1 до N активированных (то есть потраченных) артефактов с любым заклинанием - в такое же состояние, какое они имели до активации. N зависит от уровня маны в локации. При умвл меньше 8, N = 1. Иначе 3
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-enlarge-pencil',
    humanReadableName: 'Crate of the art: Enlarge Your Pencil',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Enlarge Your Pencil',
    // 465
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Enlarge Your Pencil. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-stone-skin',
    humanReadableName: 'Crate of the art: Stone skin',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Stone skin',
    // 466
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Stone skin. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-tempus-fugit',
    humanReadableName: 'Crate of the art: Tempus Fugit',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Tempus Fugit',
    // 467
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Tempus Fugit. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-beacon',
    humanReadableName: 'Crate of the art: Beacon',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Beacon',
    // 468
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Beacon После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-run-spirit-run',
    humanReadableName: 'Crate of the art: Run, spirit, run',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Run, spirit, run',
    // 469
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Run, spirit, run. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-input-stream',
    humanReadableName: 'Crate of the art: InputStream',
    description: 'Ты можешь создавать артефакты, содержащие заклинание InputStream',
    // 470
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание InputStream. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-output-stream',
    humanReadableName: 'Crate of the art: OutputStream',
    description: 'Ты можешь создавать артефакты, содержащие заклинание OutputStream',
    // 471
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание OutputStream. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-mosquito-tree',
    humanReadableName: 'Crate of the art: Mosquito Tree',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Mosquito Tree',
    // 472
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Mosquito Tree. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-feed-the-cat',
    humanReadableName: 'Crate of the art: Feed the cat',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Feed the cat',
    // 473
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Feed the cat. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-tame-the-dog',
    humanReadableName: 'Crate of the art: Tame the dog',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Tame the dog',
    // 474
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Tame the dog. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-exorcizamus',
    humanReadableName: 'Crate of the art: Exorcizamus',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Exorcizamus',
    // 475
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Exorcizamus. После активации способности маг кастует заклинание как обычно, но вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'allo-homorus',
    humanReadableName: 'Allo, homorus!',
    description: 'Взлом замков',
    // 479
    // Активация дает возможность открыть замок (см.правила по взломам в "Прочих моделях"). Кулдаун - 10 минут
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },

  {
    id: 'mobile-auto-doc-2',
    humanReadableName: 'апгрейд мобильного автодока 1',
    description: 'Ты можешь лечить тяжёлое  ранение мобильный автодоком.',
    // 550
    // - лечит тяжран (1 заряд / 6 часов). То есть 1 заряд с CD 6 часов.
    // TODO(aeremin): Add proper implementation
    target: 'none',
    eventType: dummyAbility.name,
  },
];

export const kAllActiveAbilities: Map<string, ActiveAbility> = (() => {
  const result = new Map<string, ActiveAbility>();
  kAllActiveAbilitiesList.forEach((f) => {
    if (result.has(f.id)) throw new Error('Non-unique active ability id: ' + f.id);
    result.set(f.id, f);
  });
  return result;
})();
