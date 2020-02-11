import { Modifier } from '@sr2020/interface/models/alice-model-engine';
import { modifierFromEffect } from './util';
import {
  increaseMagic,
  increaseMagicFeedbackReduction,
  increaseMagicRecoverySpeed,
  increaseSpiritResistanceMultiplier,
  increaseResonance,
  increaseMaxTimeAtHost,
  increaseHostEntrySpeed,
  increaseConversionFirewall,
  increaseConversionAttack,
  increaseConversionSleaze,
  increaseConversionDataprocessing,
  increaseSpriteLevel,
  increaseAdminHostNumber,
  increaseMaxTimeInVr,
  increaseAuraMarkMultiplier,
  increaseEthicGroupMaxSize,
  decreaseChemoPillDetectableThresholdTo,
  decreaseChemoBodyDetectableThresholdTo,
} from './basic_effects';

interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  prerequisites?: string[];
  modifier: Modifier | Modifier[];
}

// Not exported by design, use kAllPassiveAbilities instead.
const kAllPassiveAbilitiesList: PassiveAbility[] = [
  {
    id: 'incriminating-evidence',
    name: 'Собрать компромат',
    description:
      'Напиши большую статью об интересующем тебя человеке или организации. Добейся, чтобы эта статья вошла в топ-20 понравившихся материалов. Получи от МГ компромат на этого человека или организацию. Степень подробности информации зависит от положения статьи в рейтинге топ-20. Вы не можете собирать компромат в течении 12 часов после получения прошлых итогов компромата.',
    // 43
    // САБЖ, как в описании. Выдаем какую-то прикольную сюжетную инфу
    modifier: [],
  },

  {
    id: 'always-online',
    name: 'Всегда на связи',
    description:
      'Чтобы с вами ни происходило, в каком бы вы ни были состоянии, как бы вас ни заколдовали, если вы живы - вы можете пользоваться телеграммом для передачи игровых сообщений. В мире игре этого не видно, по вам нельзя понять, что вы что-то пишете, отнять телефон и так далее.',
    // 44
    // САБЖ, как в описании.
    modifier: [],
  },

  {
    id: 'last-report',
    name: 'Это мой последний репортаж',
    description:
      'Если вас каким-либо образом все-таки убили, вы можете написать сообщение с описанием подробностей вашей смерти, как все это происходило, что вы об этом думаете, оставить последние пожелания для подписчиков и опубликовать это в вашем телеграмм-канале. Вы можете описывать что происходило с вашим телом и вокруг него. ',
    // 45
    // САБЖ, как в описании.
    modifier: [],
  },

  {
    id: 'ask-anon',
    name: 'Спроси анонимуса',
    description:
      'Раз в 12 часов вы можете получить ответ от мастеров на любой вопрос, подразумевающий ответ "да или нет" или подробный ответ на вопрос, касающийся бэка игры и событий, произошедших в мире игры до ее начала. Кто-то из ваших читателей скинул вам эту инфу в личку. Данную информацию нельзя использовать как доказательства в суде - ведь остальные могут сомневаться в том, что анонимус знает все. Но вы не сомневаетесь в этом. ',
    // 46
    // САБЖ, как в описании.
    modifier: [],
  },

  {
    id: 'bloggers-support',
    name: 'Поддержка блоггеров',
    description:
      'Раз в 12 часов вы можете назвать мастерам некую личность или организацию и защитить ее от использования способности "собрать компромат" на 12 часов.',
    // 47
    // САБЖ, как в описании.
    modifier: [],
  },

  {
    id: 'deck-mods-1',
    name: 'уровень 1',
    description: '',
    // 66
    // возможность пользоваться модами 1 уровня
    modifier: [],
  },

  {
    id: 'deck-mods-2',
    name: 'уровень 2',
    description: '',
    // 67
    // возможность пользоваться модами 2 уровня
    prerequisites: ['deck-mods-1'],
    modifier: [],
  },

  {
    id: 'deck-mods-3',
    name: 'уровень 3',
    description: '',
    // 68
    // возможность пользоваться модами 3 уровня
    prerequisites: ['deck-mods-2'],
    modifier: [],
  },

  {
    id: 'deck-mods-4',
    name: 'уровень 4',
    description: '',
    // 69
    // возможность пользоваться модами 4 уровня
    prerequisites: ['deck-mods-3'],
    modifier: [],
  },

  {
    id: 'link-lock',
    name: 'linklock',
    description: 'linklock <target>',
    // 101
    // Захват цели в линк лок
    modifier: [],
  },

  {
    id: 'auto-link-lock',
    name: 'autolinklock',
    description: 'autolock <target>',
    // 102
    // Автоматический захват цели в линклок при появлении
    prerequisites: ['link-lock'],
    modifier: [],
  },

  {
    id: 'geo-pro-1',
    name: 'геоспец 1',
    description: 'useapi read',
    // 103
    // позволяет читать данные из геоапи
    modifier: [],
  },

  {
    id: 'geo-pro-2',
    name: 'геоспец 2',
    description: 'useapi read',
    // 104
    // позволяет читать данные из геоапи - лучше. Позволяет изменять данные
    prerequisites: ['geo-pro-1'],
    modifier: [],
  },

  {
    id: 'geo-pro-3',
    name: 'геоспец 3',
    description: 'useapi read/update',
    // 105
    // позволяет читать данные из геоапи - лучше. Позволяет изменять данные лучше
    prerequisites: ['geo-pro-2'],
    modifier: [],
  },

  {
    id: 'economics-pro-1',
    name: 'эконом 1',
    description: 'useapi read',
    // 106
    // позволяет читать данные из эконом апи
    modifier: [],
  },

  {
    id: 'economics-pro-2',
    name: 'эконом 2',
    description: 'useapi read',
    // 107
    // позволяет читать данные из эконом- лучше. Позволяет немного воровать
    prerequisites: ['economics-pro-1'],
    modifier: [],
  },

  {
    id: 'economics-pro-3',
    name: 'эконом 3',
    description: 'useapi read/update',
    // 108
    // позволяет читать данные из эконом- лучше. Позволяет немного воровать. Работа с магазин/корпа
    prerequisites: ['economics-pro-2'],
    modifier: [],
  },

  {
    id: 'economics-symbiosis',
    name: 'Эконом-симбиоз',
    description: '',
    // 109
    // преодолевает анонимизацию фиксира
    modifier: [],
  },

  {
    id: 'rus-registry-1',
    name: 'россестр 1',
    description: 'useapi read',
    // 110
    // позволяет читать данные из реестров
    modifier: [],
  },

  {
    id: 'rus-registry-2',
    name: 'россестр 2',
    description: 'useapi read',
    // 111
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные
    prerequisites: ['rus-registry-1'],
    modifier: [],
  },

  {
    id: 'rus-registry-3',
    name: 'россестр 3',
    description: 'useapi read/update',
    // 112
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные лучше
    prerequisites: ['rus-registry-2'],
    modifier: [],
  },

  {
    id: 'meds-and-chrome-1',
    name: 'Медицина и Хром 1',
    description: 'useapi read',
    // 113
    // позволяет читать данные из реестров
    modifier: [],
  },

  {
    id: 'meds-and-chrome-2',
    name: 'Медицина и Хром 2',
    description: 'useapi read',
    // 114
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные
    prerequisites: ['meds-and-chrome-1'],
    modifier: [],
  },

  {
    id: 'meds-and-chrome-3',
    name: 'Медицина и Хром 3',
    description: 'useapi read/update',
    // 115
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные лучше
    prerequisites: ['meds-and-chrome-2'],
    modifier: [],
  },

  {
    id: 'other-control-1',
    name: 'прочий контроль 1',
    description: 'useapi read',
    // 116
    // работа с прочими контролями -1
    modifier: [],
  },

  {
    id: 'other-control-2',
    name: 'прочий контроль 2',
    description: 'useapi read',
    // 117
    // работа с прочими контролями -2
    prerequisites: ['other-control-1'],
    modifier: [],
  },

  {
    id: 'other-control-3',
    name: 'прочий контроль 3',
    description: 'useapi read/update',
    // 118
    // работа с прочими контролями -3
    prerequisites: ['other-control-2'],
    modifier: [],
  },

  {
    id: 'reactivate',
    name: 'reactivate',
    description: 'reactivate <target>',
    // 119
    // Позволяет реактивировать вырубленный IC
    modifier: [],
  },

  {
    id: 'huge-lucker',
    name: 'Конский лак ',
    description: '',
    // 120
    // Позволяет пережить одну атаку черного льда
    modifier: [],
  },

  {
    id: 'admin',
    name: 'Админ',
    description: '',
    // 122
    // Еще 3 хоста, на защиту которых ты можешь подписаться
    // [+3] Хакер_число_админ_хостов
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 3 }),
  },

  {
    id: 'commander',
    name: 'Командир',
    description: '',
    // 123
    // Ты можешь создавать объединять декеров в команду (имунки френдли файр)
    modifier: [],
  },

  {
    id: 'compressor',
    name: 'Компрессор',
    description: '',
    // 124
    // Разобрался со всеми примудростями квантовой компрессии. Позволяет экономить 10% памяти кибердеки при записи софта в деку
    modifier: [],
  },

  {
    id: 'diagnostician',
    name: 'Диагност (техномант)',
    description: '',
    // 125
    // Позволяет реактивировать вырубленый IC
    modifier: [],
  },

  {
    id: 'just-a-normal-guy',
    name: 'Обыкновенный',
    description: '',
    // 126
    // Вэрианс на 10% быстрее падает
    // TODO(https://trello.com/c/MpQX1qld/102-описать-абилку-вэрианс-на-10-быстрее-падает): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'quite-enduring-guy',
    name: 'Стойкий',
    description: '',
    // 127
    // Фейдинг на 10% меньше
    // TODO(https://trello.com/c/CMLLkATK/103-описать-абилку-фейдинг-на-10-меньше): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'squid',
    name: 'Сквид',
    description: '',
    // 130
    // Увеличивает возможное количество бэкдоров. Зависит от уровня резонанса
    // TODO(https://trello.com/c/x5sZnzHz/104-описать-абилку-увеличивает-возможное-количество-бэкдоров-зависит-от-уровня-резонанса): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'last-droplet',
    name: 'Ну еще капельку',
    description: '',
    // 131
    // Бэкдоры дохнут медленнее
    // TODO(https://trello.com/c/HQ0ZOpyH/105-описать-абилки-бэкдоры-дохнут-медленнее): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'very-last-droplet',
    name: 'Выжать до капли',
    description: '',
    // 132
    // Бэкдоры дохнут ну еще медленнее.
    // TODO(https://trello.com/c/HQ0ZOpyH/105-описать-абилки-бэкдоры-дохнут-медленнее): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'longer-vr-stays-1',
    name: 'Мужчина, продлевать будете? ',
    description: '',
    // 134
    // Увеличение длительности пребывания в виаре - для Техномантов. Покупается за карму.
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 60 }),
  },

  {
    id: 'longer-vr-stays-2',
    name: 'Мужчина, продлевать будете?  v2',
    description: '',
    // 135
    // Увеличение длительности пребывания в виаре - для жителей Виара и Основания. Мастерская, дается силой рельсы
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 120 }),
  },

  {
    id: 'unlimited-vr-stays',
    name: 'Виар. А я вообще тут живу.',
    description: '',
    // 136
    // Абилка егостов и ИИ. Мастерская, дается силой рельсы.
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 9000 }),
  },

  {
    id: 'i-am-so-normal',
    name: 'А у меня и так все нормально.',
    description: '',
    // 138
    // Пассивка нормов, увеличивает время в виаре\основании.
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 30 }),
  },

  {
    id: 'resonance-1',
    name: 'Резонанс -1',
    description: '',
    // 139
    // Резонанс +1
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },

  {
    id: 'resonance-2',
    name: 'Резонанс -2',
    description: '',
    // 140
    // Резонанс +1
    prerequisites: ['resonance-1'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },

  {
    id: 'resonance-3',
    name: 'Резонанс -3',
    description: '',
    // 141
    // Резонанс +1
    prerequisites: ['resonance-2'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },

  {
    id: 'resonance-4',
    name: 'Резонанс -4',
    description: '',
    // 142
    // Резонанс +1
    prerequisites: ['resonance-3'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },

  {
    id: 'resonance-5',
    name: 'Резонанс -5',
    description: '',
    // 143
    // Резонанс +1
    prerequisites: ['resonance-4'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },

  {
    id: 'additional-sprite',
    name: 'Намертво!',
    description: '',
    // 146
    // Еще один связанный спрайт
    // TODO(https://trello.com/c/5soHeH5T/106-описать-абилку-еще-один-связанный-спрайт): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'additional-query',
    name: 'Чтец',
    description: '',
    // 147
    // Еще один запрос к контролю
    // TODO(https://trello.com/c/gmWH0D2Z/107-описать-абилку-еще-один-запрос-к-контролю): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'synchronized',
    name: 'Синхронизатор',
    description: '',
    // 148
    // Меньше лаг данных контроля (по умолчанию данные контроля  старее чем 30 минут от момента запроса)
    modifier: [],
  },

  {
    id: 'longer-party-vr-stays-1',
    name: 'Бой часов раздастся вскоре 1',
    description: 'Не нравится мне название :(',
    // 149
    // Добавляет время пребывания в Основании партии ( + Х секунд)
    // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
    modifier: [],
  },

  {
    id: 'longer-party-vr-stays-2',
    name: 'Бой часов раздастся вскоре 2',
    description: '',
    // 150
    // Добавляет время пребывания в Основании партии ( + Х секунд)
    // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
    modifier: [],
  },

  {
    id: 'longer-party-vr-stays-3',
    name: 'Бой часов раздастся вскоре 3',
    description: '',
    // 151
    // Добавляет время пребывания в Основании партии ( + Х секунд)
    // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
    modifier: [],
  },

  {
    id: 'gunslinger',
    name: 'Самый быстрый пистолет на Западе',
    description: '',
    // 163
    // Вне зависимости от уровня резонанса всегда имеет наивысшую инициативу в красной комнате. Если техномантов с такой абилкой несколько - то по уровню резонанса.
    modifier: [],
  },

  {
    id: 'not-the-droids',
    name: 'Мы не те дроиды которых вы ищете',
    description: '',
    // 164
    // Позволяет игнорировать атаку активного агента хоста. (PvE игротеха)
    modifier: [],
  },

  {
    id: 'scan',
    name: 'scan',
    description: 'Сканирует ноду и выводит список обнаруженных в ней агентов\n\nУспешность определяется по Sleaze',
    // 187
    // борьба с чужим софтом (если повезет - то и со спрайтами)
    //
    // IT: команда в Кривда-матрице
    modifier: [],
  },

  {
    id: 'deploy',
    name: 'deploy',
    description: 'Устанавливает агента (софт) в Ноду Хоста\n--name:<имя>\n\n\nУспешность определяется по Sleaze',
    // 188
    // установка дряни / пользы в чужой хост
    //
    // -- shadow (если есть абилка shadow deploy)
    // -- persistent (если есть абилка persistent deploy)
    //
    // IT: команда в Кривда-матрице
    modifier: [],
  },

  {
    id: 'uninstall',
    name: 'uninstall',
    description: 'Удаляет агента с Ноды\n\nУспешность определяется по Sleaze',
    // 189
    // очистка хоста от чужой дряни / пользы
    //
    // IT: команда в Кривда-матрице
    modifier: [],
  },

  {
    id: 'feelmatrix',
    name: 'feelmatrix',
    description:
      'Ты теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в на Хост\nВыдает список хостов, на которых есть другие декеры и примерный уровень группы. Чем сильнее твой Sleaze, тем больше таких хостов ты найдешь',
    // 191
    // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
    //
    // IT: Команда в Кривда-Матрице, основного IT нет
    modifier: [],
  },

  {
    id: 'dump-shock-survivor',
    name: 'Пережитый дамп-шок',
    description:
      'Ты пережил дамп-шок. Тебя преследует постоянная головная боль.\n\n[-1] Резонанс\n[-1] Тело\n[-1] Харизма\n[-1] Интеллект\n[-1] Attack\n[-1] Firewall\n[-1] Sleaze\n[-1] DataProcessing',
    // 194
    // Негативка за пережитый дамп-шок, эффект перманентный пока не излечат,
    // кумулятивен. Присваивается с помощью API
    //
    //
    // IT:
    // [Клиническая смерть]
    // [-1] Резонанс
    // [-1] Тело
    // [-1] Харизма
    // [-1] Интеллект
    // [-1] Attack
    // [-1] Firewall
    // [-1] Sleaze
    // [-1] DataProcessing
    // TODO(https://trello.com/c/9TJlmsbV/100-переписать-дамп-шок-в-терминах-конверсий-атаки-файрвола): Implement and add modifier here
    modifier: [modifierFromEffect(increaseResonance, { amount: -1 })],
  },

  {
    id: 'bypass',
    name: 'bypass',
    description: 'Гениально! Этот IC просто не заметил тебя!\n\nПозволяет проходить мимо IC.\n\nУспешность определяется по Sleaze',
    // 196
    // мини-корова декеров, закрытая этикой
    //
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'hop',
    name: 'hop',
    description:
      'Перемещение по временному трейлу в ноду, в которой установлен якорный агент (backdoor, anchor...) с известным тебе именем (то есть значением ключа --name команды deploy)',
    // 197
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'quell',
    name: 'quell',
    description: 'команда применяется в бою с IC. Атакованный IC пропустит несколько своих следующих атак (зависит от Firewall)',
    // 198
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'getdump',
    name: 'getdump',
    description: 'команда применяется в бою с IC. Позволяет получить фрагмент дампа IC для CVE анализа',
    // 199
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'vulnerabilities-sniffer',
    name: 'Нюх на уязвимости',
    description: 'Позволяет получить дополнительные фрагменты дампов, в зависимости от значения Attack',
    // 200
    // IT: буду запрашивать сам факт наличия фичи
    modifier: [],
  },

  {
    id: 'stubbornness-1',
    name: 'Выдающаяся упертость',
    description: 'Продлевает максимальное время нахождения на хосте на 5 минут',
    // 201
    // IT:
    // [+5] Декер_макс_время_на_хосте
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 5 }),
  },

  {
    id: 'stubbornness-2',
    name: 'Удивительная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на10 минут',
    // 202
    // IT:
    // [+10] Декер_макс_время_на_хосте
    prerequisites: ['stubbornness-1'],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },

  {
    id: 'stubbornness-3',
    name: 'Легендарная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 10 минут',
    // 203
    // IT:
    // [+10] Декер_макс_время_на_хосте
    prerequisites: ['stubbornness-2'],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },

  {
    id: 'persistent-deploy',
    name: 'Persistent deploy',
    description: 'Позволяет применять ключ --persistant команды deploy\n\nключ позволяет агенту переживать обновлие хоста',
    // 204
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'shadow-deploy',
    name: 'Shadow deploy',
    description:
      'Позволяет применять ключ --shadow команды deploy\n\nключ затрудняет обнаружение агента (зависит от значения Sleaze ищущего)',
    // 205
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'quick-to-enter-1',
    name: 'Шустрый',
    description: 'Снижает время входа на хост на 2 минуты',
    // 206
    // IT:
    // [+5] Декер_скорость_входа_на_хост
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 5 }),
  },

  {
    id: 'quick-to-enter-2',
    name: 'Очень шустрый',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 3 минут',
    // 207
    // IT:
    // [+10] Декер_скорость_входа_на_хост
    prerequisites: ['quick-to-enter-1'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },

  {
    id: 'quick-to-enter-3',
    name: 'Супер шустрый',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 5 минут',
    // 208
    // IT:
    // [+10] Декер_скорость_входа_на_хост
    prerequisites: ['quick-to-enter-2'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },

  {
    id: 'flee',
    name: 'flee',
    description: 'Позволяет попытаться сбежать из линклока. \n\nЗависит от соотношения значений  вашего Sleaze и Attack цели',
    // 209
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'breacher-1',
    name: 'Хороший Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    // 210
    // Абилка конверсии Intellect в Firewall
    // IT:
    // [+2] Декер_конверсия_Firewall
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },

  {
    id: 'breacher-2',
    name: 'Отличный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    // 211
    // IT:
    // [+2] Декер_конверсия_Firewall
    prerequisites: ['breacher-1'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },

  {
    id: 'breacher-3',
    name: 'Легендарный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    // 212
    // IT:
    // [+2] Декер_конверсия_Firewall
    prerequisites: ['breacher-2'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },

  {
    id: 'fencer-1',
    name: 'Хороший Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    // 213
    // Абилка конверсии Intellect в Attack
    // IT:
    // [+2] Декер_конверсия_Attack
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },

  {
    id: 'fencer-2',
    name: 'Отличный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    // 214
    // IT:
    // [+2] Декер_конверсия_Attack
    prerequisites: ['fencer-1'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },

  {
    id: 'fencer-3',
    name: 'Легендарный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    // 215
    // IT:
    // [+2] Декер_конверсия_Attack
    prerequisites: ['fencer-2'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },

  {
    id: 'sly-1',
    name: 'Хороший Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    // 216
    // Абилка конверсии Intellect в Sleaze
    // IT:
    // [+2] Декер_конверсия_Sleaze
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },

  {
    id: 'sly-2',
    name: 'Отличный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    // 217
    // IT:
    // [+2] Декер_конверсия_Sleaze
    prerequisites: ['sly-1'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },

  {
    id: 'sly-3',
    name: 'Легендарный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    // 218
    // IT:
    // [+2] Декер_конверсия_Sleaze
    prerequisites: ['sly-2'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },

  {
    id: 'miner-1',
    name: 'Хороший Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    // 219
    // Абилка конверсии Intellect в Dataprocessing
    // IT:
    // [+2] Декер_конверсия_Dataprocessing
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 2 }),
  },

  {
    id: 'miner-2',
    name: 'Отличный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    // 220
    // IT:
    // [+2] Декер_конверсия_Dataprocessing
    prerequisites: ['miner-1'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 2 }),
  },

  {
    id: 'miner-3',
    name: 'Легендарный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    // 221
    // IT:
    // [+2] Декер_конверсия_Dataprocessing
    prerequisites: ['miner-2'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 2 }),
  },

  {
    id: 'burn',
    name: 'burn',
    description:
      'Позволяет наносить урон кибердеке противника, повреждать его моды\n\nУрон зависит от соотношения значений вашей Attack и Firewall цели',
    // 222
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'arpscan',
    name: 'arpscan',
    description:
      'Выводит список всех Персон, находящихся на хосте\n\nВысокие значения Sleaze или специальные спосбности могут обмануть эту команду',
    // 223
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'trace',
    name: 'trace',
    description: 'Отображает якорь PAN хоста поверженного (выброшенного в ходе боя из Матрицы) декера',
    // 224
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'steal',
    name: 'steal',
    description:
      'Находясь на ноде PAN хоста с определенным API, позволяет осуществить перевод автоматически определяемой суммы денег\n\nСумма зависит от значенияй ваших характеристик Sleaze и Dataprocessing',
    // 225
    // IT: команда в кривда-матрице
    modifier: [],
  },

  {
    id: 'steal-pro',
    name: 'Фрод профи',
    description:
      'Разблокирует ключи команды steal\n\n--enterprize: работа с кошельками юр лиц\n--comment: позволяет ввести текст "основания перевода", вместо билиберды по умолчанию',
    // 226
    // IT: ключ команды в кривда-матрице
    modifier: [],
  },

  {
    id: 'steal-expert',
    name: 'Фрод эксперт',
    description: 'Разблокирует ключи команды steal\n\n--SIN: переводит сумму на другой SIN',
    // 227
    // IT: ключ команды в кривда-матрице
    modifier: [],
  },

  {
    id: 'quarter-god',
    name: 'Четвертак',
    description:
      'Русское название для слэнга "qouterGOD", шутливое название для серьезных людей: профессиональных контракторов по частной защиты Хостов.\n\nКоличество защищаемых хостов +5',
    // 228
    // IT:
    // [+5] Хакер_число_админ_хостов
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 5 }),
  },

  {
    id: 'deep-compile',
    name: 'Глубокая компиляция',
    description: 'Тебе проще компилировать спрайты',
    // 229
    // Комулятивно добавляет устойчивость к фейдингу при компиляции спрайтов
    //
    // IT:
    // [+xxxx] Техномант_Устойчивость_Фейдингу_Компиляция
    // TODO(https://trello.com/c/BJ0sZy0Y/101-нативная-компиляция-глубокая-компиляция): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'native-compile',
    name: 'Нативная компиляция',
    description: 'Тебе намного проще компилировать спрайты',
    // 230
    // Комулятивно добавляет устойчивость к фейдингу при компиляции спрайтов
    //
    // IT:
    // [+xxxx] Техномант_Устойчивость_Фейдингу_Компиляция
    // TODO(https://trello.com/c/BJ0sZy0Y/101-нативная-компиляция-глубокая-компиляция): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'sprites-1',
    name: 'Спрайты-1',
    description: 'Ты можешь компилировать спрайты 1 уровня',
    // 231
    //
    // IT:
    // [+1] Техномант_Уровень_Спрайтов
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },

  {
    id: 'sprites-2',
    name: 'Спрайты-2',
    description: 'Ты можешь компилировать спрайты 2 уровня',
    // 232
    //
    // IT:
    // [+1] Техномант_Уровень_Спрайтов
    prerequisites: ['sprites-1'],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },

  {
    id: 'sprites-3',
    name: 'Спрайты-3',
    description: 'Ты можешь компилировать спрайты 3 уровня',
    // 233
    //
    // IT:
    // [+1] Техномант_Уровень_Спрайтов
    prerequisites: ['sprites-2'],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },

  {
    id: 'look-its-shekel',
    name: 'Опа, шекель!',
    description: 'при прохождении данжа ГМ выносит из данжа больше ',
    // 302
    // при прохождении данжа ГМ выносит из данжа + 10% от базовой стоимости лута (бонус зачисляется на счет гм)
    modifier: [],
  },

  {
    id: 'discount-chemo',
    name: 'Скидосы',
    description: 'Скидка 5% при покупке химоты',
    // 304
    // Скидка 5% при покупке химоты
    // TODO(https://trello.com/c/sN70t49E/149-экономика-скидки): Use it to calculate discount
    modifier: [],
  },

  {
    id: 'discount-implants',
    name: 'Скидосы',
    description: 'Скидка 5% при покупке имплантов',
    // 305
    // Скидка 5% при покупке имплантов
    // TODO(https://trello.com/c/sN70t49E/149-экономика-скидки): Use it to calculate discount
    modifier: [],
  },

  {
    id: 'discount-weapons',
    name: 'Скидосы',
    description: 'Скидка 5% при покупке оружия и брони',
    // 306
    // Скидка 5% при покупке оружия и брони
    // TODO(https://trello.com/c/sN70t49E/149-экономика-скидки): Use it to calculate discount
    modifier: [],
  },

  {
    id: 'discount-magic',
    name: 'Скидосы',
    description: 'Скидка 5% при покупке маг реагентов  и маг товаров',
    // 307
    // Скидка 5% при покупке маг реагентов  и маг товаров
    // TODO(https://trello.com/c/sN70t49E/149-экономика-скидки): Use it to calculate discount
    modifier: [],
  },

  {
    id: 'discount-drones',
    name: 'Скидосы',
    description: 'Скидка 5% при покупке дронов и модов для дронов',
    // 308
    // Скидка 5% при покупке дронов и модов для дронов
    // TODO(https://trello.com/c/sN70t49E/149-экономика-скидки): Use it to calculate discount
    modifier: [],
  },

  {
    id: 'ethic-group-creation',
    name: 'Начальный лимит группы',
    description: '',
    // 314
    // начальный лимит группы 5; нельзя принимать других дискурс-монгеров
    modifier: modifierFromEffect(increaseEthicGroupMaxSize, { amount: 5 }),
  },

  {
    id: 'ethic-group-smaller',
    name: 'Нас мало, но мы в тельняшках',
    description: '',
    // 315
    // -2 к лимиту группы
    prerequisites: ['ethic-group-creation'],
    modifier: modifierFromEffect(increaseEthicGroupMaxSize, { amount: -2 }),
  },

  {
    id: 'ethic-group-larger-1',
    name: 'Ибо нас много 1',
    description: '',
    // 316
    // +2 лимиту группы
    prerequisites: ['ethic-group-creation'],
    modifier: modifierFromEffect(increaseEthicGroupMaxSize, { amount: 2 }),
  },

  {
    id: 'ethic-group-larger-2',
    name: 'Ибо нас много 2',
    description: '',
    // 317
    // +2 лимиту группы
    prerequisites: ['ethic-group-larger-1'],
    modifier: modifierFromEffect(increaseEthicGroupMaxSize, { amount: 2 }),
  },

  {
    id: 'ethic-group-larger-3',
    name: 'Имя нам легион 1',
    description: '',
    // 318
    // +4 к лимиту группы
    prerequisites: ['ethic-group-larger-2'],
    modifier: modifierFromEffect(increaseEthicGroupMaxSize, { amount: 4 }),
  },

  {
    id: 'ethic-group-larger-4',
    name: 'Имя нам легион 2',
    description: '',
    // 319
    // +4 к лимиту группы
    prerequisites: ['ethic-group-larger-3'],
    modifier: modifierFromEffect(increaseEthicGroupMaxSize, { amount: 4 }),
  },

  {
    id: 'magic-1',
    name: 'Магия 1',
    description: 'Подвластная тебе Мощь увеличивается',
    // 350
    // Перманентно увеличивает характеристику Магия на 1
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },

  {
    id: 'magic-2',
    name: 'Магия 2',
    description: 'Подвластная тебе Мощь увеличивается',
    // 351
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: ['magic-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },

  {
    id: 'magic-3',
    name: 'Магия 3',
    description: 'Подвластная тебе Мощь увеличивается',
    // 352
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: ['magic-2', 'spirit-enemy-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },

  {
    id: 'magic-4',
    name: 'Магия 4',
    description: 'Подвластная тебе Мощь увеличивается',
    // 353
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: ['magic-3', 'spirit-enemy-2'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },

  {
    id: 'magic-5',
    name: 'Магия 5',
    description: 'Подвластная тебе Мощь увеличивается',
    // 354
    prerequisites: ['magic-4', 'spirit-enemy-3'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },

  {
    id: 'magic-feedback-resistance-1',
    name: 'Сопротивление Откату 1',
    description: 'Ты легче выносишь Откат',
    // 355
    // Перманентно уменьшает Откат после кастования заклинания на 1
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: 1 }),
  },

  {
    id: 'magic-feedback-resistance-2',
    name: 'Сопротивление Откату 2',
    description: 'Ты легче выносишь Откат',
    // 356
    // Перманентно уменьшает Откат после кастования заклинания на 1
    prerequisites: ['magic-feedback-resistance-1'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: 1 }),
  },

  {
    id: 'magic-feedback-resistance-3',
    name: 'Сопротивление Откату 3',
    description: 'Ты легче выносишь Откат',
    // 357
    // Перманентно уменьшает Откат после кастования заклинания на 1
    prerequisites: ['magic-feedback-resistance-2'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: 1 }),
  },

  {
    id: 'magic-feedback-unresistance-1',
    name: 'Откатошный 1',
    description: 'Ты тяжелее выносишь Откат',
    // 358
    // Перманентно увеличивает Откат после кастования заклинания на 1
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: -1 }),
  },

  {
    id: 'magic-feedback-unresistance-2',
    name: 'Откатошный 2',
    description: 'Ты тяжелее выносишь Откат',
    // 359
    // Перманентно увеличивает Откат после кастования заклинания на 1
    prerequisites: ['magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: -1 }),
  },

  {
    id: 'magic-feedback-unresistance-3',
    name: 'Откатошный 3',
    description: 'Ты тяжелее выносишь Откат',
    // 360
    // Перманентно увеличивает Откат после кастования заклинания на 1
    prerequisites: ['magic-feedback-unresistance-2'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: -1 }),
  },

  {
    id: 'magic-recovery-1',
    name: 'Воспрянь и пой 1',
    description: 'Магия возвращается к тебе быстрее',
    // 361
    // Перманентно ускоряет восстановление Магии на 20%
    modifier: modifierFromEffect(increaseMagicRecoverySpeed, { amount: 0.2 }),
  },

  {
    id: 'magic-recovery-2',
    name: 'Воспрянь и пой 2',
    description: 'Магия возвращается к тебе быстрее',
    // 362
    // Перманентно ускоряет восстановление Магии еще на 20%
    prerequisites: ['magic-recovery-1'],
    modifier: modifierFromEffect(increaseMagicRecoverySpeed, { amount: 0.2 }),
  },

  {
    id: 'magic-recovery-3',
    name: 'Воспрянь и пой 3',
    description: 'Магия возвращается к тебе быстрее',
    // 363
    // Перманентно ускоряет восстановление Магии еще на 20%
    prerequisites: ['magic-recovery-2'],
    modifier: modifierFromEffect(increaseMagicRecoverySpeed, { amount: 0.2 }),
  },

  {
    id: 'spirit-friend-1',
    name: 'Дружелюбие духов 1',
    description: 'Ты понимаешь настроения духов',
    // 367
    // Коэффициент Сопротивления Духов у мага перманентно становится меньше на 0.2
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: -0.2 }),
  },

  {
    id: 'spirit-friend-2',
    name: 'Дружелюбие духов 2',
    description: 'Ты понимаешь настроения духов',
    // 368
    // Коэффициент Сопротивления Духов у мага перманентно становится меньше на 0.2
    prerequisites: ['spirit-friend-1', 'magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: -0.2 }),
  },

  {
    id: 'spirit-friend-3',
    name: 'Дружелюбие духов 3',
    description: 'Ты понимаешь настроения духов',
    // 369
    // Коэффициент Сопротивления Духов у мага перманентно становится меньше на 0.2
    prerequisites: ['spirit-friend-2'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: -0.2 }),
  },

  {
    id: 'spirit-enemy-1',
    name: 'Духопротивный 1',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    // 370
    // Коэффициент Сопротивления Духов у мага перманентно становится больше на 0.3
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: 0.2 }),
  },

  {
    id: 'spirit-enemy-2',
    name: 'Духопротивный 2',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    // 371
    // Коэффициент Сопротивления Духов у мага перманентно становится больше на 0.3
    prerequisites: ['spirit-enemy-1'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: 0.2 }),
  },

  {
    id: 'spirit-enemy-3',
    name: 'Духопротивный 3',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    // 372
    // Коэффициент Сопротивления Духов у мага перманентно становится больше на 0.3
    prerequisites: ['spirit-enemy-2'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: 0.2 }),
  },

  {
    id: 'light-step',
    name: 'Light Step ',
    description: 'След твоих заклинаний содержит меньше ауры',
    // 390
    // В астральном следе заклинаний обладателя абилки остается только 60% ауры. То есть Коэффициент Отчетливости Астральных Следов у него равен 0.6
    modifier: modifierFromEffect(increaseAuraMarkMultiplier, { amount: -0.4 }),
  },

  {
    id: 'weightless-step',
    name: 'Weightless Step ',
    description: 'ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ. След содержит по минимуму ауры',
    modifier: modifierFromEffect(increaseAuraMarkMultiplier, { amount: -1 }),
  },

  {
    id: 'dictator-control',
    name: 'Dictator Control',
    description: 'При чтении астральных следов извлекается больше ауры',
    // 391
    // Обладатель абилки при анализе следов заклинаний (заклинания Trackpoint, Trackball, Know each other, Panopticon, Tweet-tweet little bird), извлекает на 20% ауры больше. То есть его Коэффициент чтения астральных следов равен 1.2
    // TODO(https://trello.com/c/aQcxrkDW/108-уточнить-поведение-абилки-dictator-control): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'agnus-dei',
    name: 'Agnus dei ',
    description: 'В ритуальном хоре твой голос неоценим',
    // 412
    // - Когда qr-код обладателя такой способности сканируют во время ритуала, он считается за 3х человек.
    // TODO(aeremin): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'microscope-usage',
    name: 'Микроскоп',
    description: 'Теперь ты можешь пользоваться микроскопом. Ты можешь видеть высокую концентрацию вещества в препарате.',
    // 473
    // Персонаж видит что в таблетке, грубо. 70% контент и больше
    modifier: modifierFromEffect(decreaseChemoPillDetectableThresholdTo, { amount: 70 }),
  },

  {
    id: 'more-chemo-to-sell-1',
    name: 'апгрейд аптеки 1',
    description: 'Ассортимент твоей аптеки расширился.',
    // 474
    // более лучшая химота в продаже
    // TODO(aeremin): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'more-chemo-to-sell-2',
    name: 'апгрейд аптеки 2',
    description: 'Ассортимент твоей аптеки расширился ещё больше.',
    // 475
    // Аптека умеет юзать прототипы (с лимитом на штуки)
    // TODO(aeremin): Implement and add modifier here
    prerequisites: ['more-chemo-to-sell-1'],
    modifier: [],
  },

  {
    id: 'whats-in-the-pill-2',
    name: 'Что в таблетке 2',
    description: 'Ты можешь видеть среднюю концентрацию вещества в препарате.',
    // 476
    // Персонаж видит что в таблетке, средне. 40% контент и больше
    prerequisites: ['microscope-usage'],
    modifier: modifierFromEffect(decreaseChemoPillDetectableThresholdTo, { amount: 40 }),
  },

  {
    id: 'whats-in-the-pill-3',
    name: 'Что в таблетке 3',
    description: 'Ты можешь видеть низкую концентрацию вещества в препарате.',
    // 477
    // Персонаж видит что в таблетке, тонко. 10% контент и больше
    prerequisites: ['whats-in-the-pill-2'],
    modifier: modifierFromEffect(decreaseChemoPillDetectableThresholdTo, { amount: 10 }),
  },

  {
    id: 'whats-in-the-body-1',
    name: 'Что в теле 1',
    description: 'ты можешь анализировать через автодок, что за вещества находятся в теле пациента.\n',
    // 478
    // Персонаж видит состав фуфломицина в поциенте, грубо. 150% контент и больше
    modifier: modifierFromEffect(decreaseChemoBodyDetectableThresholdTo, { amount: 150 }),
  },

  {
    id: 'whats-in-the-body-2',
    name: 'Что в теле 2',
    description: 'ты можешь лучше анализировать через автодок, что за вещества находятся в теле пациента.\n',
    // 479
    // Персонаж видит состав фуфломицина в поциенте, средне. 100% контент и больше
    prerequisites: ['whats-in-the-body-1'],
    modifier: modifierFromEffect(decreaseChemoBodyDetectableThresholdTo, { amount: 100 }),
  },

  {
    id: 'whats-in-the-body-3',
    name: 'Что в теле 3',
    description: 'ты можешь ещё лучше анализировать через автодок, что за вещества находятся в теле пациента.\n',
    // 480
    // Персонаж видит состав фуфломицина в поциенте, тонко. 50% контент и больше
    prerequisites: ['whats-in-the-body-2'],
    modifier: modifierFromEffect(decreaseChemoBodyDetectableThresholdTo, { amount: 50 }),
  },

  {
    id: 'mobile-auto-doc-1',
    name: 'Мобильный автодок',
    description: 'Ты можешь использовать мобильный автодок.',
    // 481
    // Допуск: мобильный автодок
    // TODO(aeremin): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'mobile-auto-doc-3',
    name: 'апгрейд мобильного автодока 2',
    description: 'Ты можешь лечить тяжёлое ранение мобильный автодоком чаще.',
    // 483
    // - лечит тяжран (3 заряда / 6 часов). То есть 3 заряда, у каждого CD 6 часов
    // TODO(aeremin): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'mental-resistance',
    name: 'резист менталке',
    description: 'Немного повышает защиту от ментальных воздействий.',
    // 515
    // Повышает защиту от ментальных заклинаний
    // Модификатор: МентальнаяЗащита +3
    // TODO(aeremin): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'chemo-resistance',
    name: 'сопротивляемость химоте',
    description: 'Дает устойчивость к негативным эффектам при употреблении препаратов.',
    // 516
    // повышает порог кризисной ситуации при употреблении химоты
    // Модификатор: ХимотаКризис +10
    // TODO(aeremin): Implement and add modifier here
    modifier: [],
  },

  {
    id: 'thats-my-chrome',
    name: 'это мой хром!',
    description: 'Импланты, установленные у тебя сложнее вырезать рипоменам.',
    // 517
    // Отбивает с шансом 50% попытку вырезать у тебя имплант.
    // TODO(aeremin): Implement corresponding mechanic
    modifier: [],
  },

  {
    id: 'faster-regen-1',
    name: 'Здоровеньки булы 1',
    description: 'Ты восстанавливаешь все хиты за 45 минут',
    // 518
    // Ускоряет респавн хитов после легкого ранения (45 минут все хиты)
    modifier: [],
  },

  {
    id: 'faster-regen-2',
    name: 'Здоровеньки булы 2',
    description: 'Ты восстанавливаешь все хиты за 30 минут',
    // 519
    // Ускоряет респавн хитов после легкого ранения (30 минут все хиты)
    modifier: [],
  },

  {
    id: 'grenades-usage',
    name: 'гранаты',
    description: 'разрешает использовать гранаты',
    // 533
    // разрешает игроку использовать гранаты
    modifier: [],
  },
];

export const kAllPassiveAbilities: Map<string, PassiveAbility> = (() => {
  const result = new Map<string, PassiveAbility>();
  kAllPassiveAbilitiesList.forEach((f) => {
    if (result.has(f.id)) throw new Error('Non-unique passive ability id: ' + f.id);
    result.set(f.id, f);
  });
  return result;
})();
