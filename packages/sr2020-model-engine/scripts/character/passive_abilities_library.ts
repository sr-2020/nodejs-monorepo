import { Modifier } from '@sr2020/interface/models/alice-model-engine';
import { modifierFromEffect } from './util';
import {
  allowBiowareInstallation,
  increaseAdminHostNumber,
  increaseAircraftBonus,
  increaseAuraMarkMultiplier,
  increaseAuraReadingMultiplier,
  increaseBackdoors,
  increaseBackdoorTtl,
  increaseBiofeedbackResistance,
  increaseBody,
  increaseCharisma,
  increaseCompilationFadingResistance,
  increaseControlRequests,
  increaseConversionAttack,
  increaseConversionDataprocessing,
  increaseConversionFirewall,
  increaseConversionSleaze,
  increaseDepth,
  increaseDroneFeedback,
  increaseFadingResistance,
  increaseGroundcraftBonus,
  increaseHostEntrySpeed,
  increaseImplantDifficultyBonus,
  increaseImplantsBonus,
  increaseImplantsSlots,
  increaseIntelligence,
  increaseMagic,
  increaseMaxMeatHp,
  increaseMaxTimeAtHost,
  increaseMaxTimeInDrone,
  increaseMaxTimeInVr,
  increaseMedicraftBonus,
  increaseMentalProtection,
  increasePostDroneRecoveryTime,
  increaseRepomanBonus,
  increaseResonance,
  increaseSpriteCount,
  increaseSpriteLevel,
  increaseStockGainPercentage,
  increaseStrength,
  increaseTuningBonus,
  increaseVarianceResistance,
  increaseСhemoBaseEffectThreshold,
  increaseСhemoCrysisThreshold,
  increaseСhemoSuperEffectThreshold,
  increaseСhemoUberEffectThreshold,
  muliplyMagicRecoverySpeed,
  multiplyAllDiscounts,
  multiplyCorpDiscountAres,
  multiplyCorpDiscountAztechnology,
  multiplyCorpDiscountEvo,
  multiplyCorpDiscountHorizon,
  multiplyCorpDiscountMutsuhama,
  multiplyCorpDiscountNeonet1,
  multiplyCorpDiscountRenraku,
  multiplyCorpDiscountRussia,
  multiplyCorpDiscountSaederKrupp,
  multiplyCorpDiscountShiavase,
  multiplyCorpDiscountSpinradGlobal,
  multiplyCorpDiscountWuxing,
  multiplyDiscountWeaponsArmor,
  multiplyDiscourseMongerCooldowns,
  multiplyMagicFeedbackMultiplier,
  multiplySpiritResistanceMultiplier,
  setTransactionAnonymous,
} from './basic_effects';
export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  karmaCost: number;
  prerequisites: string[];
  modifier: Modifier | Modifier[];
}
// Not exported by design, use kAllPassiveAbilities instead.
const kAllPassiveAbilitiesList: PassiveAbility[] = [
  // TODO(https://trello.com/c/i5oFZkFF/216-метатипы): Implement and add modifier here
  // hacking.fadingResistance +1
  // hacking.enterCooldownReduced 15
  {
    id: 'feel-matrix',
    name: 'Чувствительность к Матрице',
    description: 'Ты чувствуешь матрицу. Устойчивость к фейдингу техноманта, у декера уменьшается время между входами на хоcт.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseFadingResistance, { amount: 1 })],
  },
  // chemo.baseEffectThreshold -40
  // chemo.uberEffectThreshold -30
  // chemo.superEffectThreshold -20
  // chemo.crysisThreshold -60
  {
    id: 'chem-weak',
    name: 'Чувствительность к препаратам',
    description: 'Для воздействия препарата достаточно уменьшенной дозы. Аккуратно!',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseСhemoBaseEffectThreshold, { amount: -40 }),
      modifierFromEffect(increaseСhemoUberEffectThreshold, { amount: -30 }),
      modifierFromEffect(increaseСhemoSuperEffectThreshold, { amount: -20 }),
      modifierFromEffect(increaseСhemoCrysisThreshold, { amount: -60 }),
    ],
  },
  //
  {
    id: 'elven-prices',
    name: 'Прекрасные цены',
    description: 'Ваш скоринг прекрасен, эльфийское долголетие всегда в цене! Особая скидка на все покупки!',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // chemo.crysisThreshold +40
  {
    id: 'chem-resist',
    name: 'Устойчивость к препаратам.',
    description: 'Сложнее получить передозировку препарата.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 40 })],
  },
  // magicStats.feedbackMultiplier *0.9
  {
    id: 'magic-feedback-resist',
    name: 'Устойчивость к Откату магов',
    description: 'Понижает Откат магов',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // hacking.fadingResistance +1
  // hacking.biofeedbackResistance +1
  {
    id: 'matrix-feedback-resist',
    name: 'Устойчивость к Матрице',
    description: 'Снижает фейдинг техномантов и улучшает устойчивость к биофидбеку у декеров.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseFadingResistance, { amount: 1 }),
      modifierFromEffect(increaseBiofeedbackResistance, { amount: 1 }),
    ],
  },
  // drones.droneFeedback -1
  {
    id: 'good-rigga',
    name: 'Устойчивость при подключению к дронам.',
    description: 'Снижает урон при выходе из поврежденного дрона.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseDroneFeedback, { amount: -1 })],
  },
  // у обычных метарасов 6 слотов.
  // у гномов 5 (-1 слот в Теле)
  {
    id: 'dont-touch-my-hole',
    name: 'Коротышка',
    description: 'Неотчуждаемый слот для бороды!',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsSlots, { amount: -1 })],
  },
  // maxHp +1
  {
    id: 'extra-hp',
    name: 'Плюс хит',
    description: 'У тебя дополнительный хит в мясном теле. ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMaxMeatHp, { amount: 1 })],
  },
  // magicStats.spiritResistanceMultiplier *0.8
  {
    id: 'spirit-feed',
    name: 'Знакомец духов',
    description: 'Снижает Сопротивление духов этому магу.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(multiplySpiritResistanceMultiplier, { amount: 0.8 })],
  },
  //
  {
    id: 'orkish-prices',
    name: 'Так себе цены.',
    description: 'Ваш скоринг очень плох, жизнь орка коротка. Ваши покупки будут дороже, чем у других метарас.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'skin-armor',
    name: 'Кожный панцирь',
    description: 'Твоя шкура крепкая как броня. Тяжелое оружие бьет тебя по хитам.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // у обычных метарасов 6 слотов.
  // у троллей 7 (+7 слот в Теле)
  {
    id: 'this-my-glory-hole',
    name: 'Верзила',
    description: 'У троллей есть дополнительный слот для имплантов',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsSlots, { amount: 1 })],
  },
  //
  {
    id: 'strong-arm',
    name: 'Сильная рука',
    description: 'Биологическая сила! Можно использовать оружие, требующее одной киберруки.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Обычный персонаж "ест" раз в цикл (в 6 часов), тролли едят каждые 3 часа.
  {
    id: 'feed-tamagochi',
    name: 'Голодный как тролль!',
    description: 'Надо чаще питаться. Большому телу - нужен большой сойбургер!',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'trollish-prices',
    name: 'Ужасные цены.',
    description: 'Ваш скоринг очень плох, жизнь тролля очень коротка. Ваши покупки будут заметно дороже, чем у других метарас.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Эссенс персонажа уменьшается на 0,2 каждый час
  // Essense_Loss
  //  itGapEssense = увеличивается 20 каждый час
  {
    id: 'meat-hunger',
    name: 'Голод гулей',
    description: 'Твой эссенс уменьшается  на 0,2 каждый час',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Эссенс персонажа уменьшается на 1 каждый час
  //  itGapEssense = увеличивается 100 каждый час
  {
    id: 'blood-thirst',
    name: 'Жажда вампиров',
    description: 'Твой эссенс уменьшается на 1 каждый час',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Если itEssense <1, то у персонажа блокируется активация всех активных абилок кроме абилок ghoul-feast и vampire-feast. Проверка проводится при каждом пересчете itEssense.
  {
    id: 'starvation',
    name: 'Алчность',
    description: 'При Эссенс персонажа <1 ты не можешь активировать абилки ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // chemo.baseEffectThreshold +30
  // chemo.uberEffectThreshold +80
  // chemo.superEffectThreshold +80
  // chemo.crysisThreshold +40
  {
    id: 'chem-resist-heavy',
    name: 'Резистивность к препаратам.',
    description: 'Для правильного воздействия препарата нужны увеличенные дозы. Аккуратно!',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseСhemoBaseEffectThreshold, { amount: 30 }),
      modifierFromEffect(increaseСhemoUberEffectThreshold, { amount: 80 }),
      modifierFromEffect(increaseСhemoSuperEffectThreshold, { amount: 80 }),
      modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 40 }),
    ],
  },
  //
  {
    id: 'astral-vision',
    name: 'Астральное зрение',
    description: 'Ты можешь видеть существ, находящихся в Астрале и говорить с ними.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // в типах имплантах есть разделение, надо посмотреть как оно там сделано
  {
    id: 'chrome-blockade',
    name: 'Отторжение хрома',
    description: 'Ты не можешь использовать кибернетические импланты. Биотех - можно.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // вписано в требования архетипов
  {
    id: 'tech-blockade',
    name: 'Отторжение дронов и Резонанса',
    description: 'Ты не можешь изучать навыки Риггера Пилота и Хакера Техноманта ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // вписано в требования архетипов
  {
    id: 'magic-blockade',
    name: 'Отторжение Магии',
    description: 'Ты не можешь изучать навыки Мага',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'spirit-attuned',
    name: 'Сильный призыватель духов',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'orkish-ethics',
    name: 'Твердость кодекса',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // `
  {
    id: 'trollish-ethics',
    name: '',
    description:
      'Если тролль покидает свою дискурс-группу - он переживает ужасный излом идентичности. Вырази это максимально понятным для окружающих способом, желательно с причинением тяжких телесных повреждений.  ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'elven-ethics',
    name: 'Гибкость кодекса',
    description: 'Этическая особенность Эльфов',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании. Выдаем какую-то прикольную сюжетную инфу
  {
    id: 'incriminating-evidence',
    name: 'Собрать компромат',
    description:
      'Напиши большую статью об интересующем тебя человеке или организации. Добейся, чтобы эта статья вошла в топ-20 понравившихся материалов. Получи от МГ компромат на этого человека или организацию. Степень подробности информации зависит от положения статьи в рейтинге топ-20. Вы не можете собирать компромат в течении 12 часов после получения прошлых итогов компромата.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'always-online',
    name: 'Всегда на связи',
    description:
      'Чтобы с вами ни происходило, в каком бы вы ни были состоянии, как бы вас ни заколдовали, если вы живы - вы можете пользоваться телеграммом для передачи игровых сообщений. В мире игре этого не видно, по вам нельзя понять, что вы что-то пишете, отнять телефон и так далее.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'last-report',
    name: 'Это мой последний репортаж',
    description:
      'Если вас каким-либо образом все-таки убили, вы можете написать сообщение с описанием подробностей вашей смерти, как все это происходило, что вы об этом думаете, оставить последние пожелания для подписчиков и опубликовать это в вашем телеграмм-канале. Вы можете описывать что происходило с вашим телом и вокруг него. ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'ask-anon',
    name: 'Спроси анонимуса',
    description:
      'Раз в 12 часов вы можете получить ответ от мастеров на любой вопрос, подразумевающий ответ "да или нет" или подробный ответ на вопрос, касающийся бэка игры и событий, произошедших в мире игры до ее начала. Кто-то из ваших читателей скинул вам эту инфу в личку. Данную информацию нельзя использовать как доказательства в суде - ведь остальные могут сомневаться в том, что анонимус знает все. Но вы не сомневаетесь в этом. ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'bloggers-support',
    name: 'Поддержка блоггеров',
    description:
      'Раз в 12 часов вы можете назвать мастерам некую личность или организацию и защитить ее от использования способности "собрать компромат" на 12 часов.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // для проект-менеджера  с 1 слотом
  // У игрока просто отображается текст пассивной абилки
  {
    id: 'project-manager-1',
    name: 'ты - проект-менеджер1',
    description: 'сертификат проект-менеджера. может вести не более 1 проекта одновременно',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // для проект-менеджера с 3 слотами
  // У игрока просто отображается текст пассивной абилки
  {
    id: 'project-manager-3',
    name: 'ты - проект-менеджер3',
    description: 'сертификат проект-менеджера. может вести до 3 проектов одновременно',
    karmaCost: 0,
    prerequisites: ['project-manager-1'],
    modifier: [],
  },
  // возможность пользоваться модами 1 уровня
  {
    id: 'deck-mods-1',
    name: 'уровень 1',
    description: '',
    karmaCost: 1,
    prerequisites: [],
    modifier: [],
  },
  // возможность пользоваться модами 2 уровня
  {
    id: 'deck-mods-2',
    name: 'уровень 2',
    description: '',
    karmaCost: 2,
    prerequisites: ['deck-mods-1'],
    modifier: [],
  },
  // возможность пользоваться модами 3 уровня
  {
    id: 'deck-mods-3',
    name: 'уровень 3',
    description: '',
    karmaCost: 4,
    prerequisites: ['deck-mods-2'],
    modifier: [],
  },
  // возможность пользоваться модами 4 уровня
  {
    id: 'deck-mods-4',
    name: 'уровень 4',
    description: '',
    karmaCost: 8,
    prerequisites: ['deck-mods-3'],
    modifier: [],
  },
  // Захват цели в линк лок
  {
    id: 'link-lock',
    name: 'linklock',
    description: 'linklock <target>',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // Автоматический захват цели в линклок при появлении
  {
    id: 'auto-link-lock',
    name: 'autolinklock',
    description: 'autolock <target>',
    karmaCost: 4,
    prerequisites: ['link-lock'],
    modifier: [],
  },
  // позволяет читать данные из геоапи
  {
    id: 'geo-pro-1',
    name: 'геоспец 1',
    description: 'useapi read',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // позволяет читать данные из геоапи - лучше. Позволяет изменять данные
  {
    id: 'geo-pro-2',
    name: 'геоспец 2',
    description: 'useapi read',
    karmaCost: 4,
    prerequisites: ['geo-pro-1'],
    modifier: [],
  },
  // позволяет читать данные из геоапи - лучше. Позволяет изменять данные лучше
  {
    id: 'geo-pro-3',
    name: 'геоспец 3',
    description: 'useapi read/update',
    karmaCost: 8,
    prerequisites: ['geo-pro-2'],
    modifier: [],
  },
  // позволяет читать данные из эконом апи
  {
    id: 'economics-pro-1',
    name: 'эконом 1',
    description: 'useapi read',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // позволяет читать данные из эконом- лучше. Позволяет немного воровать
  {
    id: 'economics-pro-2',
    name: 'эконом 2',
    description: 'useapi read',
    karmaCost: 4,
    prerequisites: ['economics-pro-1'],
    modifier: [],
  },
  // позволяет читать данные из эконом- лучше. Позволяет немного воровать. Работа с магазин/корпа
  {
    id: 'economics-pro-3',
    name: 'эконом 3',
    description: 'useapi read/update',
    karmaCost: 8,
    prerequisites: ['economics-pro-2'],
    modifier: [],
  },
  // преодолевает анонимизацию фиксира
  {
    id: 'economics-symbiosis',
    name: 'Эконом-симбиоз',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // позволяет читать данные из реестров
  {
    id: 'rus-registry-1',
    name: 'россестр 1',
    description: 'useapi read',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // позволяет читать данные из реестров - лучше. Позволяет изменять данные
  {
    id: 'rus-registry-2',
    name: 'россестр 2',
    description: 'useapi read',
    karmaCost: 4,
    prerequisites: ['rus-registry-1'],
    modifier: [],
  },
  // позволяет читать данные из реестров - лучше. Позволяет изменять данные лучше
  {
    id: 'rus-registry-3',
    name: 'россестр 3',
    description: 'useapi read/update',
    karmaCost: 8,
    prerequisites: ['rus-registry-2'],
    modifier: [],
  },
  // позволяет читать данные из реестров
  {
    id: 'meds-and-chrome-1',
    name: 'Медицина и Хром 1',
    description: 'useapi read',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // позволяет читать данные из реестров - лучше. Позволяет изменять данные
  {
    id: 'meds-and-chrome-2',
    name: 'Медицина и Хром 2',
    description: 'useapi read',
    karmaCost: 4,
    prerequisites: ['meds-and-chrome-1'],
    modifier: [],
  },
  // позволяет читать данные из реестров - лучше. Позволяет изменять данные лучше
  {
    id: 'meds-and-chrome-3',
    name: 'Медицина и Хром 3',
    description: 'useapi read/update',
    karmaCost: 8,
    prerequisites: ['meds-and-chrome-2'],
    modifier: [],
  },
  // работа с прочими контролями -1
  {
    id: 'other-control-1',
    name: 'прочий контроль 1',
    description: 'useapi read',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // работа с прочими контролями -2
  {
    id: 'other-control-2',
    name: 'прочий контроль 2',
    description: 'useapi read',
    karmaCost: 4,
    prerequisites: ['other-control-1'],
    modifier: [],
  },
  // работа с прочими контролями -3
  {
    id: 'other-control-3',
    name: 'прочий контроль 3',
    description: 'useapi read/update',
    karmaCost: 8,
    prerequisites: ['other-control-2'],
    modifier: [],
  },
  // Позволяет реактивировать вырубленный IC
  {
    id: 'reactivate',
    name: 'reactivate',
    description: 'reactivate <target>',
    karmaCost: 4,
    prerequisites: [],
    modifier: [],
  },
  // Позволяет пережить одну атаку черного льда
  {
    id: 'huge-lucker',
    name: 'Конский лак ',
    description: '',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // Еще 3 хоста, на защиту которых ты можешь подписаться
  {
    id: 'admin',
    name: 'Админ',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 3 }),
  },
  // Разобрался со всеми примудростями квантовой компрессии. Позволяет экономить 10% памяти кибердеки при записи софта в деку
  {
    id: 'compressor',
    name: 'Компрессор',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: [],
  },
  // Позволяет реактивировать вырубленый IC
  {
    id: 'diagnostician',
    name: 'Диагност (техномант)',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: [],
  },
  // Вэрианс на 10% быстрее падает
  {
    id: 'just-a-normal-guy',
    name: 'Обыкновенный',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseVarianceResistance, { amount: 10 }),
  },
  // Фейдинг на 10% меньше
  {
    id: 'quite-enduring-guy',
    name: 'Стойкий',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseFadingResistance, { amount: 10 }),
  },
  // Увеличивает возможное количество бэкдоров. Зависит от уровня резонанса
  {
    id: 'squid',
    name: 'Сквид',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseBackdoors, { amount: 3 }),
  },
  // Бэкдоры дохнут медленнее
  //
  // [Время_жизни_бэкдоров] +20
  {
    id: 'last-droplet',
    name: 'Ну еще капельку',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 20 }),
  },
  // "Бэкдоры дохнут еще медленнее
  //
  // [Время_жизни_бэкдоров] +40" (комулятивно те в сумме 60)
  {
    id: 'very-last-droplet',
    name: 'Выжать до капли',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 40 }),
  },
  // Увеличение длительности пребывания в виаре - для Техномантов. Покупается за карму.
  {
    id: 'longer-vr-stays-1',
    name: 'Мужчина, продлевать будете? ',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 60 }),
  },
  // Увеличение длительности пребывания в виаре - для жителей Виара и Основания. Мастерская, дается силой рельсы
  {
    id: 'longer-vr-stays-2',
    name: 'Мужчина, продлевать будете?  v2',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 120 }),
  },
  // Абилка егостов и ИИ. Мастерская, дается силой рельсы.
  {
    id: 'unlimited-vr-stays',
    name: 'Виар. А я вообще тут живу.',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 9000 }),
  },
  // Резонанс +1
  {
    id: 'resonance-1',
    name: 'Резонанс -1',
    description: '',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-2',
    name: 'Резонанс -2',
    description: '',
    karmaCost: 4,
    prerequisites: ['resonance-1'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-3',
    name: 'Резонанс -3',
    description: '',
    karmaCost: 8,
    prerequisites: ['resonance-2'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-4',
    name: 'Резонанс -4',
    description: '',
    karmaCost: 8,
    prerequisites: ['resonance-3'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-5',
    name: 'Резонанс -5',
    description: '',
    karmaCost: 16,
    prerequisites: ['resonance-4'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Еще один связанный спрайт
  {
    id: 'additional-sprite',
    name: 'Намертво!',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseSpriteCount, { amount: 1 }),
  },
  // Еще один запрос к контролю
  {
    id: 'additional-query',
    name: 'Чтец',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseControlRequests, { amount: 1 }),
  },
  // Меньше лаг данных контроля (по умолчанию данные контроля  старее чем 30 минут от момента запроса)
  {
    id: 'synchronized',
    name: 'Синхронизатор',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
  // Добавляет время пребывания в Основании партии ( + Х секунд)
  {
    id: 'longer-party-vr-stays-1',
    name: 'Бой часов раздастся вскоре 1',
    description: 'Не нравится мне название :(',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
  // Добавляет время пребывания в Основании партии ( + Х секунд)
  {
    id: 'longer-party-vr-stays-2',
    name: 'Бой часов раздастся вскоре 2',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
  // Добавляет время пребывания в Основании партии ( + Х секунд)
  {
    id: 'longer-party-vr-stays-3',
    name: 'Бой часов раздастся вскоре 3',
    description: '',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Вне зависимости от уровня резонанса всегда имеет наивысшую инициативу в красной комнате. Если техномантов с такой абилкой несколько - то по уровню резонанса.
  {
    id: 'gunslinger',
    name: 'Самый быстрый пистолет на Западе',
    description: '',
    karmaCost: 16,
    prerequisites: [],
    modifier: [],
  },
  // Позволяет игнорировать атаку активного агента хоста. (PvE игротеха)
  {
    id: 'not-the-droids',
    name: 'Мы не те дроиды которых вы ищете',
    description: '',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // борьба с чужим софтом (если повезет - то и со спрайтами)
  //
  // IT: команда в Кривда-матрице
  {
    id: 'scan',
    name: 'scan',
    description: 'Сканирует ноду и выводит список обнаруженных в ней агентов\n\nУспешность определяется по Sleaze',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // установка дряни / пользы в чужой хост
  //
  // -- shadow (если есть абилка shadow deploy)
  // -- persistent (если есть абилка persistent deploy)
  //
  // IT: команда в Кривда-матрице
  {
    id: 'deploy',
    name: 'deploy',
    description: 'Устанавливает агента (софт) в Ноду Хоста\n--name:<имя>\n\n\nУспешность определяется по Sleaze',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // очистка хоста от чужой дряни / пользы
  //
  // IT: команда в Кривда-матрице
  {
    id: 'uninstall',
    name: 'uninstall',
    description: 'Удаляет агента с Ноды\n\nУспешность определяется по Sleaze',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
  //
  // IT: Команда в Кривда-Матрице, основного IT нет
  {
    id: 'feelmatrix',
    name: 'feelmatrix',
    description:
      'Ты теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в на Хост\nВыдает список хостов, на которых есть другие декеры и примерный уровень группы. Чем сильнее твой Sleaze, тем больше таких хостов ты найдешь',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // мини-корова декеров, закрытая этикой
  //
  // IT: команда в кривда-матрице
  {
    id: 'bypass',
    name: 'bypass',
    description: 'Гениально! Этот IC просто не заметил тебя!\n\nПозволяет проходить мимо IC.\n\nУспешность определяется по Sleaze',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'hop',
    name: 'hop',
    description:
      'Перемещение по временному трейлу в ноду, в которой установлен якорный агент (backdoor, anchor...) с известным тебе именем (то есть значением ключа --name команды deploy)',
    karmaCost: 4,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'quell',
    name: 'quell',
    description: 'команда применяется в бою с IC. Атакованный IC пропустит несколько своих следующих атак (зависит от Firewall)',
    karmaCost: 4,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'getdump',
    name: 'getdump',
    description: 'команда применяется в бою с IC. Позволяет получить фрагмент дампа IC для CVE анализа',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // IT: буду запрашивать сам факт наличия фичи
  {
    id: 'vulnerabilities-sniffer',
    name: 'Нюх на уязвимости',
    description: 'Позволяет получить дополнительные фрагменты дампов, в зависимости от значения Attack',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // IT:
  // [+5] Декер_макс_время_на_хосте
  {
    id: 'stubbornness-1',
    name: 'Выдающаяся упертость',
    description: 'Продлевает максимальное время нахождения на хосте на 5 минут',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 5 }),
  },
  // IT:
  // [+10] Декер_макс_время_на_хосте
  {
    id: 'stubbornness-2',
    name: 'Удивительная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на10 минут',
    karmaCost: 4,
    prerequisites: ['stubbornness-1'],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },
  // IT:
  // [+10] Декер_макс_время_на_хосте
  {
    id: 'stubbornness-3',
    name: 'Легендарная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 10 минут',
    karmaCost: 4,
    prerequisites: ['stubbornness-2'],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'persistent-deploy',
    name: 'Persistent deploy',
    description: 'Позволяет применять ключ --persistant команды deploy\n\nключ позволяет агенту переживать обновлие хоста',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'shadow-deploy',
    name: 'Shadow deploy',
    description:
      'Позволяет применять ключ --shadow команды deploy\n\nключ затрудняет обнаружение агента (зависит от значения Sleaze ищущего)',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // IT:
  // [+5] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-1',
    name: 'Шустрый',
    description: 'Снижает время входа на хост на 2 минуты',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 5 }),
  },
  // IT:
  // [+10] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-2',
    name: 'Очень шустрый',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 3 минут',
    karmaCost: 4,
    prerequisites: ['quick-to-enter-1'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },
  // IT:
  // [+10] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-3',
    name: 'Супер шустрый',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 5 минут',
    karmaCost: 4,
    prerequisites: ['quick-to-enter-2'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'flee',
    name: 'flee',
    description: 'Позволяет попытаться сбежать из линклока. \n\nЗависит от соотношения значений  вашего Sleaze и Attack цели',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // Абилка конверсии Intellect в Firewall
  // IT:
  // [+2] Декер_конверсия_Firewall
  {
    id: 'breacher-1',
    name: 'Хороший Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Firewall
  {
    id: 'breacher-2',
    name: 'Отличный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    karmaCost: 4,
    prerequisites: ['breacher-1'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Firewall
  {
    id: 'breacher-3',
    name: 'Легендарный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    karmaCost: 4,
    prerequisites: ['breacher-2'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  // Абилка конверсии Intellect в Attack
  // IT:
  // [+2] Декер_конверсия_Attack
  {
    id: 'fencer-1',
    name: 'Хороший Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Attack
  {
    id: 'fencer-2',
    name: 'Отличный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    karmaCost: 4,
    prerequisites: ['fencer-1'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Attack
  {
    id: 'fencer-3',
    name: 'Легендарный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    karmaCost: 4,
    prerequisites: ['fencer-2'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  // Абилка конверсии Intellect в Sleaze
  // IT:
  // [+2] Декер_конверсия_Sleaze
  {
    id: 'sly-1',
    name: 'Хороший Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Sleaze
  {
    id: 'sly-2',
    name: 'Отличный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    karmaCost: 4,
    prerequisites: ['sly-1'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Sleaze
  {
    id: 'sly-3',
    name: 'Легендарный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    karmaCost: 4,
    prerequisites: ['sly-2'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  // Абилка конверсии Intellect в Dataprocessing
  // IT:
  // [+2] Декер_конверсия_Dataprocessing
  {
    id: 'miner-1',
    name: 'Хороший Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Dataprocessing
  {
    id: 'miner-2',
    name: 'Отличный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    karmaCost: 4,
    prerequisites: ['miner-1'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, {
      amount: 2,
    }),
  },
  // IT:
  // [+2] Декер_конверсия_Dataprocessing
  {
    id: 'miner-3',
    name: 'Легендарный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    karmaCost: 4,
    prerequisites: ['miner-2'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, {
      amount: 2,
    }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'burn',
    name: 'burn',
    description:
      'Позволяет наносить урон кибердеке противника, повреждать его моды\n\nУрон зависит от соотношения значений вашей Attack и Firewall цели',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'arpscan',
    name: 'arpscan',
    description:
      'Выводит список всех Персон, находящихся на хосте\n\nВысокие значения Sleaze или специальные спосбности могут обмануть эту команду',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'trace',
    name: 'trace',
    description: 'Отображает якорь PAN хоста поверженного (выброшенного в ходе боя из Матрицы) декера',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'steal',
    name: 'steal',
    description:
      'Находясь на ноде PAN хоста с определенным API, позволяет осуществить перевод автоматически определяемой суммы денег\n\nСумма зависит от значенияй ваших характеристик Sleaze и Dataprocessing',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // IT: ключ команды в кривда-матрице
  {
    id: 'steal-pro',
    name: 'Фрод профи',
    description:
      'Разблокирует ключи команды steal\n\n--enterprize: работа с кошельками юр лиц\n--comment: позволяет ввести текст "основания перевода", вместо билиберды по умолчанию',
    karmaCost: 4,
    prerequisites: [],
    modifier: [],
  },
  // IT: ключ команды в кривда-матрице
  {
    id: 'steal-expert',
    name: 'Фрод эксперт',
    description: 'Разблокирует ключи команды steal\n\n--SIN: переводит сумму на другой SIN',
    karmaCost: 4,
    prerequisites: [],
    modifier: [],
  },
  // IT:
  // [+5] Хакер_число_админ_хостов
  {
    id: 'quarter-god',
    name: 'Четвертак',
    description:
      'Русское название для слэнга "qouterGOD", шутливое название для серьезных людей: профессиональных контракторов по частной защиты Хостов.\n\nКоличество защищаемых хостов +5',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 5 }),
  },
  // Комулятивно добавляет устойчивость к фейдингу при компиляции спрайтов
  //
  // IT:
  // [+20] Техномант_Устойчивость_Фейдингу_Компиляция
  {
    id: 'deep-compile',
    name: 'Глубокая компиляция',
    description: 'Тебе проще компилировать спрайты',
    karmaCost: 8,
    prerequisites: [],
    modifier: modifierFromEffect(increaseCompilationFadingResistance, {
      amount: 20,
    }),
  },
  // Комулятивно добавляет устойчивость к фейдингу при компиляции спрайтов
  //
  // IT:
  // [+30] Техномант_Устойчивость_Фейдингу_Компиляция
  {
    id: 'native-compile',
    name: 'Нативная компиляция',
    description: 'Тебе намного проще компилировать спрайты',
    karmaCost: 8,
    prerequisites: [],
    modifier: modifierFromEffect(increaseCompilationFadingResistance, {
      amount: 30,
    }),
  },
  //
  // IT:
  // [+1] Техномант_Уровень_Спрайтов
  {
    id: 'sprites-1',
    name: 'Спрайты-1',
    description: 'Ты можешь компилировать спрайты 1 уровня',
    karmaCost: 8,
    prerequisites: [],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  //
  // IT:
  // [+1] Техномант_Уровень_Спрайтов
  {
    id: 'sprites-2',
    name: 'Спрайты-2',
    description: 'Ты можешь компилировать спрайты 2 уровня',
    karmaCost: 8,
    prerequisites: ['sprites-1'],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  //
  // IT:
  // [+1] Техномант_Уровень_Спрайтов
  {
    id: 'sprites-3',
    name: 'Спрайты-3',
    description: 'Ты можешь компилировать спрайты 3 уровня',
    karmaCost: 8,
    prerequisites: ['sprites-2'],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста с 3 до 4
  {
    id: 'increase-the-charisma-1',
    name: 'Повышение Харизмы от 3 до 4 ',
    description: 'Перманентное увеличение Харизмы персонажа - 1',
    karmaCost: 16,
    prerequisites: [],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста с 4 до 5
  {
    id: 'increase-the-charisma-2',
    name: 'Повышение Харизмы от 4 до 5',
    description: 'Перманентное увеличение Харизмы персонажа - 2',
    karmaCost: 0,
    prerequisites: ['increase-the-charisma-1'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста с 5 до 6
  {
    id: 'increase-the-charisma-3',
    name: 'Повышение Харизмы от 5 до 6 ',
    description: 'Перманентное увеличение Харизмы персонажа - 3',
    karmaCost: 0,
    prerequisites: ['increase-the-charisma-2'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста с 6 до 7
  {
    id: 'increase-the-charisma-4',
    name: 'Повышение Харизмы от 6 до 7',
    description: 'Перманентное увеличение Харизмы персонажа - 4',
    karmaCost: 0,
    prerequisites: ['increase-the-charisma-3'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста с 7 до 8
  {
    id: 'increase-the-charisma-5',
    name: 'Повышение Харизмы от 7 до 8',
    description: 'Перманентное увеличение Харизмы персонажа - 5',
    karmaCost: 0,
    prerequisites: ['increase-the-charisma-4'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // при прохождении данжа ГМ выносит из данжа + 10% от базовой стоимости лута
  // Покажи игротеху абилку - получи больше лута на 10%
  {
    id: 'look-its-shekel',
    name: 'Опа, шекель!',
    description: 'При получении лута после прохождения данжа покажи данную абилку игротеху. Ты получаешь +10% от лута твоей команды.',
    karmaCost: 10,
    prerequisites: [],
    modifier: [],
  },
  // У гм на экране экономики отображаются  его текущие множители скоринга.
  {
    id: 'mу-scoring',
    name: 'Мой скоринг',
    description: 'отображается  текущий коэф. скоринга данного персонажа',
    karmaCost: 10,
    prerequisites: [],
    modifier: [],
  },
  // После списания рентных платежей гм получает кэшбек в размере 2% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-1',
    name: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 2% от всех своих рентных платежей.',
    karmaCost: 10,
    prerequisites: [],
    modifier: modifierFromEffect(increaseStockGainPercentage, { amount: 2 }),
  },
  // После списания рентных платежей гм получает кэшбек в размере 5% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-2',
    name: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 5% от всех своих рентных платежей.',
    karmaCost: 40,
    prerequisites: ['igra-na-birge-1'],
    modifier: modifierFromEffect(increaseStockGainPercentage, {
      amount: 5 - 2,
    }),
  },
  // После списания рентных платежей гм получает кэшбек в размере 13% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-3',
    name: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 13% от всех своих рентных платежей.',
    karmaCost: 80,
    prerequisites: ['igra-na-birge-2'],
    modifier: modifierFromEffect(increaseStockGainPercentage, {
      amount: 13 - 5,
    }),
  },
  // анонимизация перевода - не показываем это в логах никому кроме фиксера, его контрагента и мастеров
  {
    id: 'anonymous-transaction',
    name: 'фиксер',
    description: 'гм производит анонимный перевод между двумя персонажами. ',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(setTransactionAnonymous, {}),
  },
  // Все кулдауны способностей дискурсмонгера снижены на 20%
  {
    id: 'dm-fanatic-1',
    name: 'Фанатик-1',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 20%',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.8,
    }),
  },
  // Все кулдауны способностей дискурсмонгера снижены на 40%
  {
    id: 'dm-fanatic-2',
    name: 'Фанатик-2',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 40%',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.6 / 0.8,
    }),
  },
  // Все кулдауны способностей дискурсмонгера снижены на 60%
  {
    id: 'dm-fanatic-3',
    name: 'Фанатик-3',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 60%',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.4 / 0.6,
    }),
  },
  // Абилка-сертификат, позволяющий просмотреть чужой этикпрофиль
  {
    id: 'dm-soul-expert',
    name: 'Душевед',
    description: 'Предъявите экран с описанием способности игроку, чтобы тот показал вам свой этикпрофиль',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка-сертификат
  {
    id: 'churched',
    name: 'Воцерковленный',
    description:
      'После исповеди или участия в богослужении вы можете нажать "Готово" на любом Поступке личной этики, не выполняя его требований',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Множитель 0,9 на стоимость товара при покупке любого товара  данным персонажем
  //
  {
    id: 'discount-all-1',
    name: 'Скидосы - 10%',
    description: 'Скидки. Стоимость товара умножается на 0,9 при покупке любого товара ',
    karmaCost: 10,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.9 }),
  },
  // Множитель 0,8 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-2',
    name: 'Скидосы - 20%',
    description: 'Скидка. Стоимость товара умножается на 0,8 при покупке любого товара',
    karmaCost: 40,
    prerequisites: ['discount-all-1'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.8 }),
  },
  // Множитель 0,7 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-3',
    name: 'Скидосы - 30%',
    description: 'Скидки Стоимость товара умножается на 0,7 при покупке любого товара ',
    karmaCost: 80,
    prerequisites: ['discount-all-2'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.7 }),
  },
  // множитель 0,9 при покупке товаров типа ХОЛОДНОЕ ОРУЖИЕ,
  // ДИСТАНЦИОННОЕ ОРУЖИЕ, БРОНЯ.
  {
    id: 'discount-samurai',
    name: 'Скидка на броню и оружие',
    description: 'У тебя есть скидка 10% на покупку оружия и брони.',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscountWeaponsArmor, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation = Ares Macrotechnolgy
  {
    id: 'discount-ares',
    name: 'Ares Macrotechnolgy скидка',
    description: 'скидка 10% на товары корпорации Ares Macrotechnolgy',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountAres, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Aztechnology (ORO)
  {
    id: 'discount-aztechnology',
    name: 'Aztechnology (ORO) скидка',
    description: 'скидка 10% на товары корпорации Aztechnology (ORO)',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountAztechnology, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Saeder-Krupp
  {
    id: 'discount-saeder-krupp',
    name: 'Saeder-Krupp скидка',
    description: 'скидка 10% на товары корпорации Saeder-Krupp',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountSaederKrupp, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =.Spinrad Global (JRJ INT)
  {
    id: 'discount-spinradglobal',
    name: 'Spinrad Global (JRJ INT) скидка',
    description: 'скидка 10% на товары корпорации Spinrad Global (JRJ INT)',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountSpinradGlobal, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =NeoNet1 (TransLatviaSeledir)
  {
    id: 'discount-neonet1',
    name: 'NeoNet1 (TransLatviaSeledir) скидка',
    description: 'скидка 10% на товары корпорации NeoNet1 (TransLatviaSeledir)',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountNeonet1, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =EVO
  {
    id: 'discount-evo',
    name: 'EVO скидка',
    description: 'скидка 10% на товары корпорации EVO',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountEvo, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Horizon
  {
    id: 'discount-horizon',
    name: 'Horizon скидка',
    description: 'скидка 10% на товары корпорации Horizon',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountHorizon, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Wuxing
  {
    id: 'discount-wuxing',
    name: 'Wuxing скидка',
    description: 'скидка 10% на товары корпорации Wuxing',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountWuxing, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Россия
  {
    id: 'discount-russia',
    name: 'Россия скидка',
    description: 'скидка 10% на товары корпорации Россия',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountRussia, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Renraku
  {
    id: 'discount-renraku',
    name: 'Renraku скидка',
    description: 'скидка 10% на товары корпорации Renraku',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountRenraku, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Mutsuhama
  {
    id: 'discount-mutsuhama',
    name: 'Mutsuhama скидка',
    description: 'скидка 10% на товары корпорации Mutsuhama',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountMutsuhama, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Shiavase
  {
    id: 'discount-shiavase',
    name: 'Shiavase скидка',
    description: 'скидка 10% на товары корпорации Shiavase',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountShiavase, { amount: 0.9 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-1',
    name: 'Магия 1',
    description: 'Подвластная тебе Мощь увеличивается',
    karmaCost: 1,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-2',
    name: 'Магия 2',
    description: 'Подвластная тебе Мощь увеличивается',
    karmaCost: 2,
    prerequisites: ['magic-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-3',
    name: 'Магия 3',
    description: 'Подвластная тебе Мощь увеличивается',
    karmaCost: 4,
    prerequisites: ['magic-2', 'spirit-enemy-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-4',
    name: 'Магия 4',
    description: 'Подвластная тебе Мощь увеличивается',
    karmaCost: 8,
    prerequisites: ['magic-3', 'spirit-enemy-2'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-5',
    name: 'Магия 5',
    description: 'Подвластная тебе Мощь увеличивается',
    karmaCost: 16,
    prerequisites: ['magic-4', 'spirit-enemy-3'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. То есть от базового получается 1*0.9=0.9)
  {
    id: 'magic-feedback-resistance-1',
    name: 'Сопротивление Откату 1',
    description: 'Ты легче выносишь Откат',
    karmaCost: 2,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимого СопрОткату1 коэффициентСопротивленияОткату = 1*0.9*0.9=0.81)
  {
    id: 'magic-feedback-resistance-2',
    name: 'Сопротивление Откату 2',
    description: 'Ты легче выносишь Откат',
    karmaCost: 4,
    prerequisites: ['magic-feedback-resistance-1'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимых СопрОткату1-2 коэффициентСопротивленияОткату = 1*0.9*0.9*0.9=0.729)
  {
    id: 'magic-feedback-resistance-3',
    name: 'Сопротивление Откату 3',
    description: 'Ты легче выносишь Откат',
    karmaCost: 8,
    prerequisites: ['magic-feedback-resistance-2'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. То есть от базового получается 1*1.2=1.2)
  {
    id: 'magic-feedback-unresistance-1',
    name: 'Откатошный 1',
    description: 'Ты тяжелее выносишь Откат',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимого Откатошный1 коэффициентСопротивленияОткату = 1*1.2*1.2=1.44)
  {
    id: 'magic-feedback-unresistance-2',
    name: 'Откатошный 2',
    description: 'Ты тяжелее выносишь Откат',
    karmaCost: 0,
    prerequisites: ['magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимых Откатошный1-2 коэффициентСопротивленияОткату = 1*1.2*1.2*1.2=1.728)
  {
    id: 'magic-feedback-unresistance-3',
    name: 'Откатошный 3',
    description: 'Ты тяжелее выносишь Откат',
    karmaCost: 0,
    prerequisites: ['magic-feedback-unresistance-2'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. То есть от базового 1 КоэффициентВосстановленияМагии станет 1*1.2=1.2
  {
    id: 'magic-recovery-1',
    name: 'Воспрянь и пой 1',
    description: 'Магия возвращается к тебе быстрее',
    karmaCost: 2,
    prerequisites: [],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже был взят Воспрянь и пой 1, то КоэффициентВосстановленияМагии станет 1*1.2*1.2=1.44
  {
    id: 'magic-recovery-2',
    name: 'Воспрянь и пой 2',
    description: 'Магия возвращается к тебе быстрее',
    karmaCost: 4,
    prerequisites: ['magic-recovery-1'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже были Воспрянь и пой 1-2, КоэффициентВосстановленияМагии станет 1*1.2*1.2*1.2=1.728
  {
    id: 'magic-recovery-3',
    name: 'Воспрянь и пой 3',
    description: 'Магия возвращается к тебе быстрее',
    karmaCost: 8,
    prerequisites: ['magic-recovery-2'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-1',
    name: 'Дружелюбие духов 1',
    description: 'Ты понимаешь настроения духов',
    karmaCost: 2,
    prerequisites: [],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-2',
    name: 'Дружелюбие духов 2',
    description: 'Ты понимаешь настроения духов',
    karmaCost: 4,
    prerequisites: ['spirit-friend-1', 'magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-3',
    name: 'Дружелюбие духов 3',
    description: 'Ты понимаешь настроения духов',
    karmaCost: 8,
    prerequisites: ['spirit-friend-2'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
  {
    id: 'spirit-enemy-1',
    name: 'Духопротивный 1',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
  {
    id: 'spirit-enemy-2',
    name: 'Духопротивный 2',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    karmaCost: 0,
    prerequisites: ['spirit-enemy-1'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
  {
    id: 'spirit-enemy-3',
    name: 'Духопротивный 3',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    karmaCost: 0,
    prerequisites: ['spirit-enemy-2'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  // В астральном следе заклинаний обладателя абилки остается только 60% ауры. То есть Коэффициент Отчетливости Астральных Следов у него равен 0.6
  {
    id: 'light-step',
    name: 'Light Step ',
    description: 'След твоих заклинаний содержит меньше ауры',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseAuraMarkMultiplier, { amount: -0.4 }),
  },
  // Позволяет просканировать во время каста qr-коды мясных тел в состоянии тяжран (не годятся здоров/КС/АС) для эффекта "кровавый ритуал":  Использование (сканирование) N этих кодов приводит к:
  //  1) временному (на T минут) появлению пассивной абилки "Магия в крови", дающей бонус к максимально доступной Мощи в размере √N
  // 2) временному (на T минут) появлению пассивной способности "Кровавый Прилив", добавляющей в КоэффициентСопротивленияОткату множитель K=1/(6+N).
  // T = N*5 минут.
  // Жертва теряет 1ед Эссенса и переходит в КС и в этом состоянии для повторного использования в другом таком же ритуале непригодна.
  {
    id: 'bathory-charger',
    name: 'Bathory Charger',
    description:
      'Использование металюдей для увеличения Мощи и снижения Отката заклинаний на некоторое время. Чем больше жертв использовано, тем больше эффект',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // Обладатель абилки при анализе следов заклинаний (заклинания Trackpoint, Trackball, Know each other, Panopticon, Tweet-tweet little bird), извлекает значение ауры на 20% больше. Например, если заклинание было скастовано с такой Мощью, что должно было извлечь 10 символов, то с этой абилкой будет извлечено 12. То есть Коэффициент чтения астральных следов у этого мага равен 1.2.
  {
    id: 'dictator-control',
    name: 'Dictator Control',
    description: 'При чтении астральных следов извлекается больше ауры',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseAuraReadingMultiplier, {
      amount: 0.2,
    }),
  },
  // - Когда qr-код обладателя такой способности сканируют во время ритуала, он считается за 3х человек.
  {
    id: 'agnus-dei',
    name: 'Agnus dei ',
    description: 'В ритуальном хоре твой голос неоценим.',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // Разблокирует возможность сканить во время каста заклинания qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "ритуал": N разных сосканированных за время действия заклинания qr-кодов увеличивают магу выбранную для этого заклинания Мощь на √N, округленное вверх.
  {
    id: 'ritual-magic',
    name: 'Ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  // Разблокирует возможность сканить во время каста qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "православный ритуал": N уникальных сосканированных за время действия заклинания qr-кодов для этого заклинания:
  // 1) добавляют √N (округленное вверх) к выбранной магом Мощи
  // 2) включают в КоэффициентСниженияОтката множитель 1/(2+N)
  {
    id: 'orthodox-ritual-magic',
    name: 'Православная ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи и снижения Отката',
    karmaCost: 1,
    prerequisites: [],
    modifier: [],
  },
  // TODO(https://trello.com/c/W8G2ZocH/109-описать-подробнее-механику-апгрейдов-аптеки): Implement and add modifier here
  // более лучшая химота в продаже
  {
    id: 'more-chemo-to-sell-1',
    name: 'апгрейд аптеки 1',
    description: 'Ассортимент твоей аптеки расширился.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(https://trello.com/c/W8G2ZocH/109-описать-подробнее-механику-апгрейдов-аптеки): Implement and add modifier here
  // Аптека умеет юзать прототипы (с лимитом на штуки)
  {
    id: 'more-chemo-to-sell-2',
    name: 'апгрейд аптеки 2',
    description: 'Ассортимент твоей аптеки расширился ещё больше.',
    karmaCost: 0,
    prerequisites: ['more-chemo-to-sell-1'],
    modifier: [],
  },
  // TODO(https://trello.com/c/XDq4EE9R/327-реализовать-мобильный-автодок): Implement and add modifier here
  // Допуск: мобильный автодок
  {
    id: 'mobile-auto-doc-1',
    name: 'Мобильный автодок',
    description: 'Ты можешь использовать мобильный автодок.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(https://trello.com/c/XDq4EE9R/327-реализовать-мобильный-автодок): Implement and add modifier here
  // находясь в альтернативном теле "медикарт" игрок получает активную абилку "Полевое лечение тяжрана". Кулдаун абилки 60 минут
  {
    id: 'mobile-auto-doc-2',
    name: 'апгрейд мобильного автодока 1',
    description: 'Ты можешь лечить тяжёлое  ранение мобильный автодоком.',
    karmaCost: 0,
    prerequisites: ['mobile-auto-doc-1'],
    modifier: [],
  },
  // TODO(https://trello.com/c/XDq4EE9R/327-реализовать-мобильный-автодок): Implement and add modifier here
  // находясь в альтернативном теле "медикарт" игрок получает три  активных абилки "полевое  лечение тяжрана". Кулдаун абилки 60 минут
  {
    id: 'mobile-auto-doc-3',
    name: 'апгрейд мобильного автодока 2',
    description: 'Ты можешь лечить тяжёлое ранение мобильный автодоком чаще.',
    karmaCost: 0,
    prerequisites: ['mobile-auto-doc-2'],
    modifier: [],
  },
  // TODO(https://trello.com/c/D3K8TZPl/351-реализовать-архетипы) Enable prerequisite when it's implemented
  // Intelligence -1
  {
    id: 'arch-rigger-negative-1',
    name: 'Проблемы риггера - 1',
    description: 'У тебя проблемы, ригга.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 })],
  },
  // Intelligence -1
  // Body -1
  //
  {
    id: 'arch-rigger-negative-2',
    name: 'Проблемы риггера - 2',
    description: 'У тебя серьезные проблемы, ригга.',
    karmaCost: 0,
    prerequisites: ['arch-rigger-negative-1'],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 }), modifierFromEffect(increaseBody, { amount: -1 })],
  },
  // Intelligence -2
  // Body-2
  // DroneFeedback3 = 1
  {
    id: 'arch-rigger-negative-3',
    name: 'Проблемы риггера - 3',
    description: 'У тебя очень серьезные проблемы, ригга.',
    karmaCost: 0,
    prerequisites: ['arch-rigger-negative-2'],
    modifier: [
      modifierFromEffect(increaseIntelligence, { amount: -2 }),
      modifierFromEffect(increaseBody, { amount: -2 }),
      modifierFromEffect(increaseDroneFeedback, { amount: 1 }),
    ],
  },
  // drones.medicraftBonus +2
  // drones.maxTimeInside +20
  // drones.recoveryTime -20
  {
    id: 'medicraft-1',
    name: 'Медицинские дроны 1',
    description: 'Улучшает управление медикартом.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 2 }),
    ],
  },
  // drones.medicraftBonus +4
  // drones.maxTimeInside +10
  // drones.recoveryTime -10
  {
    id: 'medicraft-2',
    name: 'Медицинские дроны 2',
    description: 'Улучшает управление сложными медикартами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 4 }),
    ],
  },
  // drones.medicraftBonus +4
  // drones.maxTimeInside +10
  // drones.recoveryTime -10
  {
    id: 'medicraft-3',
    name: 'Медицинские дроны 3',
    description: 'Улучшает управление самыми сложными медикартами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 4 }),
    ],
  },
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
  // биовэр. Сложность установки 5
  {
    id: 'auto-doc-neuro',
    name: 'нейрохирургия\n',
    description: 'Ты можешь использовать автодок для работы с биовэром',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantDifficultyBonus, { amount: 2 }), modifierFromEffect(allowBiowareInstallation, {})],
  },
  // rigging.implantsBonus+2
  {
    id: 'implant-1',
    name: 'Биоинженерия 1',
    description: 'Ты можешь ставить простые импланты.',
    karmaCost: 20,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsBonus, { amount: 2 })],
  },
  // rigging.implantsBonus+2
  {
    id: 'implant-2',
    name: 'Биоинженерия 2',
    description: 'Ты можешь ставить сложные импланты.',
    karmaCost: 80,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsBonus, { amount: 2 })],
  },
  // rigging.implantsBonus+4
  {
    id: 'implant-3',
    name: 'Биоинженерия 3',
    description: 'Ты можешь ставить самые сложные импланты, включая биовэр.',
    karmaCost: 80,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsBonus, { amount: 4 })],
  },
  // rigging.tuningBonus +2
  {
    id: 'tuning-1',
    name: 'Тюнинг 1',
    description: 'Ты можешь ставить простые моды.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 2 })],
  },
  // rigging.tuningBonus +2
  {
    id: 'tuning-2',
    name: 'Тюнинг 2',
    description: 'Ты можешь ставить сложные моды.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 2 })],
  },
  // rigging.tuningBonus +4
  {
    id: 'tuning-3',
    name: 'Тюнинг 3',
    description: 'Ты можешь ставить самые сложные моды.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +4
  {
    id: 'repoman-1',
    name: 'Было ваше - стало наше 1',
    description: 'Ты можешь снимать простые импланты \\ моды.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +4
  {
    id: 'repoman-2',
    name: 'Было ваше - стало наше 2',
    description: 'Ты можешь снимать сложные импланты \\ моды.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +4
  {
    id: 'repoman-3',
    name: 'Было ваше - стало наше 3',
    description: 'Ты можешь снимать самые сложные импланты \\ моды. ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // drones.aircraftBonus =  +2
  {
    id: 'aircraft-1',
    name: 'Воздушные дроны 1',
    description: 'Улучшает управление воздушными дронами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 2 })],
  },
  // drones.aircraftBonus = +4
  {
    id: 'aircraft-2',
    name: 'Воздушные дроны 2',
    description: 'Улучшает управление сложными воздушными дронами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  // drones.aircraftBonus = +4
  {
    id: 'aircraft-3',
    name: 'Воздушные дроны 3',
    description: 'Улучшает управление самыми сложными воздушными дронами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  // drones.groundcraftBonus = +2
  {
    id: 'groundcraft-1',
    name: 'Наземные дроны-1',
    description: 'Улучшает управление наземными дронами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 2 })],
  },
  // drones.groundcraftBonus = +4
  {
    id: 'groundcraft-2',
    name: 'Наземные дроны-2',
    description: 'Улучшает управление сложными наземными дронами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  // drones.groundcraftBonus = +4
  {
    id: 'groundcraft-3',
    name: 'Наземные дроны-3',
    description: 'Улучшает управление самыми сложными наземными дронами.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  // drones.maxTimeInside  +10
  // drones.recoveryTime= -10
  {
    id: 'drone-sync-1',
    name: 'Синхронизация 1',
    description: 'Увеличивает время в дроне и сокращает перерыв между включениями.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
    ],
  },
  // drones.maxTimeInside +20
  // drones.recoveryTime -20
  {
    id: 'drone-sync-2',
    name: 'Синхронизация 2',
    description: 'Сильнее увеличивает время в дроне и сокращает перерыв между включениями.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  // drones.maxTimeInside  +20
  // drones.recoveryTime-20
  {
    id: 'drone-sync-3',
    name: 'Синхронизация 3',
    description: 'Намного сильнее увеличивает время пребывания в дроне и сокращает перерыв между включениями.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  // Повышает защиту от ментальных заклинаний
  // Модификатор: МентальнаяЗащита +3
  {
    id: 'mental-resistance',
    name: 'резист менталке',
    description: 'Немного повышает защиту от ментальных воздействий.',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMentalProtection, { amount: 3 }),
  },
  // повышает порог кризисной ситуации при употреблении химоты
  // Модификатор: ХимотаКризис +10
  {
    id: 'chemo-resistance',
    name: 'сопротивляемость химоте',
    description: 'Дает устойчивость к негативным эффектам при употреблении препаратов.',
    karmaCost: 4,
    prerequisites: [],
    modifier: modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 10 }),
  },
  // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Implement corresponding mechanic
  // Отбивает с шансом 50% попытку вырезать у тебя имплант.
  {
    id: 'thats-my-chrome',
    name: 'это мой хром!',
    description: 'Импланты, установленные у тебя сложнее вырезать рипоменам.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Ускоряет респавн хитов после легкого ранения (45 минут все хиты)
  {
    id: 'faster-regen-1',
    name: 'Здоровеньки булы 1',
    description: 'Ты восстанавливаешь все хиты за 45 минут',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Ускоряет респавн хитов после легкого ранения (30 минут все хиты)
  {
    id: 'faster-regen-2',
    name: 'Здоровеньки булы 2',
    description: 'Ты восстанавливаешь все хиты за 30 минут',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // разрешает игроку использовать гранаты
  {
    id: 'grenades-usage',
    name: 'гранаты',
    description: 'разрешает использовать гранаты',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Бульдозер
  {
    id: 'drone-dozer',
    name: 'Дрон Бульдозер',
    description: 'Щит. Тяжелая броня.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Турель
  {
    id: 'drone-turret',
    name: 'Дрон Турель',
    description: 'Пушка. Легкая броня.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Экзоскелет
  {
    id: 'drone-ekzo',
    name: 'Дрон Экзоскелет',
    description: 'Пулемет. Тяжелая броня.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Коптер
  {
    id: 'drone-copter',
    name: 'Дрон Коптер',
    description: 'Видеокамера. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Коптер-Проектор
  {
    id: 'drone-project',
    name: 'Дрон Коптер-Проектор',
    description: 'Проектор голограмм. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Коптер-Камикадзе
  {
    id: 'drone-kabuum',
    name: 'Дрон Коптер-Камикадзе',
    description: 'Бадабум! Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Вертолет
  {
    id: 'drone-heli',
    name: 'Дрон Вертолет',
    description: 'Может перевозить 3 персонажей. Легкая броня. Иммунитет к холодному оружию.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Описание способностей дрона Медкарт
  {
    id: 'drone-medcart',
    name: 'Дрон Медкарт',
    description: 'Медикарт. Легкая броня.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'comcon-ethic-ability',
    name: 'Вы достигли!',
    description: 'Приходите на наш воскресный семинар по приложению и выиграйте футболку в лотерее!',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'arrowgant-effect',
    name: 'Arrowgant',
    description: 'Защита от дистанционных атак (только от нерфов).',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'trollton-effect',
    name: 'Trollton',
    description: 'У вас тяжелая броня.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'stone-skin-effect',
    name: 'Каменная кожа ',
    description: 'С тебя снимаются хиты, как если бы ты находился в легкой броне.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(aeremin): Merge with automatic-weapons-chemo
  {
    id: 'automatic-weapons-unlock',
    name: 'Автоматическое оружие',
    description: 'Позволяет использовать автоматическое оружие (даже без кибер-рук).',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'hammer-of-justice-effect',
    name: 'Hammer of Justice',
    description: 'Одноручное оружие считается тяжёлым.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'cloud-memory-temporary',
    name: 'Облачная память',
    description: 'Вы не забываете события произошедшие с вами непосредственно перед КС',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 2 меча, 1 щит"
  {
    id: 'astro-boy',
    name: 'Астробой',
    description: 'В астральной боёвке 2 меча и 1 щит',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 4 меча, 3 щита"
  {
    id: 'astro-fighter',
    name: 'Астробоевик',
    description: 'В астральной боёвке 4 меча и 3 щита',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 6 мечей, 5 щитов"
  {
    id: 'astro-boogie',
    name: 'Астробугай',
    description: 'В астральной боёвке 6 мечей и 5 щитов',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // КоэффициентСопротивленияОткату умножается на 0.5
  {
    id: 'kudesnik',
    name: 'Кудесник',
    description: 'Ты очень хорошо сопротивляешься Откату',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(multiplyMagicFeedbackMultiplier, { amount: 0.5 })],
  },
  // Абилка ничего не делает, просто показывает текст "магический щит, защищает от атак лёгким оружием - холодным и дистанционным"
  {
    id: 'magic-shield',
    name: 'Magic Shield',
    description: 'Доступен "магический щит" (прозрачный зонтик, защищает от любого легкого оружия). Не требует активации',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "какое-то одно оружие в руках считается тяжелым" (необходима его маркировка красной лентой)
  {
    id: 'pencil',
    name: 'PENCIL',
    description: 'Одно оружие в руках считается тяжёлым',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "броня считается тяжелым" (необходима её маркировка красной лентой)
  {
    id: 'stone-skin-result',
    name: 'Stone skin',
    description: 'Имеющаяся броня считается тяжёлой',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
  //  хром и лечить тяжран. Сложность установки 1
  {
    id: 'auto-doc-1',
    name: 'хирургия',
    description: 'Ты можешь использовать автодок.И ставить простые импланты',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
  //  хром и лечить тяжран. Сложность установки 2
  {
    id: 'auto-doc-2',
    name: 'хирургия',
    description: 'Ты можешь использовать автодок. И ставить продвинутые импланты',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
  //  хром и лечить тяжран сложность установки 3
  {
    id: 'auto-doc-3',
    name: 'хирургия',
    description: 'Ты можешь использовать автодок. И ставить высокотехнологичные импланты',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // формальная абилка, которая показывает, что риггер подключен к дрону. Вроде бы не нужна, но на нее наверное можно навесить всякие нужные параметры, циферки и что-то еще что надо будет показывать.
  // Кроме того, это обязательный пререквизит для всех дроновских абилок
  {
    id: 'in-drone',
    name: 'Статус: Подключен к дрону',
    description: 'Статус: Подключен к дрону',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // feel-matrix
  // chem-weak
  // base-body-meat
  // current-body-meat
  {
    id: 'meta-norm',
    name: 'Норм',
    description: 'Ты норм. Самый обычный Sapiens, как и миллионы других.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // elven-prices
  // base-body-meat
  // current-body-meat
  {
    id: 'meta-elf',
    name: 'Эльф',
    description: 'Ты эльф. У тебя прекрасные ушки, чувство стиля и ты точно знаешь, что ты лучше всех остальных видов металюдей.',
    karmaCost: 20,
    prerequisites: [],
    modifier: [],
  },
  // chem-resist
  // magic-feedback-resist
  // matrix-feedback-resist
  // good-rigga
  // dont-touch-my-hole
  // base-body-meat
  // current-body-meat
  {
    id: 'meta-dwarf',
    name: 'Гном',
    description:
      'Ты гном. У тебя есть борода, чувство гордости и ты считаешь большинство остальных металюдей - длинномерками. Кстати, я уже говорил про бороду? ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // extra-hp
  // spirit-feed
  // base-body-meat
  {
    id: 'meta-ork',
    name: 'Орк',
    description: 'Ты орк. У тебя восхитительные клыки и крепкие кулаки.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // extra-hp
  // magic-feedback-resist
  // matrix-feedback-resist
  // good-rigga
  // base-body-meat
  // current-body-meat
  //
  // skin-armor
  // this-my-glory-hole
  // strong-arm
  // feed-tamagochi
  {
    id: 'meta-troll',
    name: 'Тролль',
    description: 'Ты тролль. У тебя есть клыки, рога, толстая шкура и возможность смотреть на остальных металюдей сверху вниз. ',
    karmaCost: 40,
    prerequisites: [],
    modifier: [],
  },
  // strong-arm
  //
  // meat-hunger
  // ghoul-feast
  // starvation
  // chem-resist-heavy
  // astral-vision
  // chrome-blockade
  // tech-blockade
  // base-body-hmhvv
  // current-body-hmhvv
  {
    id: 'meta-ghoul',
    name: 'HMHVV, тип 3. Гуль',
    description: 'Ты пережил заражение HMHVV вирусом типа 3 и стал Гулем. Ты ешь мясо металюдей. Вкусно, как курочка!',
    karmaCost: 20,
    prerequisites: [],
    modifier: [],
  },
  // strong-arm
  // starvation
  // chem-resist-heavy
  // chrome-blockade
  // tech-blockade
  // base-body-hmhvv
  // current-body-hmhvv
  //
  // blood-thirst
  // vampire-feast
  {
    id: 'meta-vampire',
    name: 'HMHVV, тип 1. Вампир',
    description:
      'Ты пережил заражение HMHVV вирусом типа 1. Ты уверен, что ты теперь сверх-мета-человек. Иногда хочется кушать и тебе нужны другие металюди - в качестве обеда. ',
    karmaCost: 20,
    prerequisites: [],
    modifier: [],
  },
  // magic-blockade
  // base-body-digital
  // current-body-digital
  {
    id: 'meta-ai',
    name: 'Проекция ИИ',
    description: 'Ты часть проекции Искусственного Интеллекта. Твое тело сгусток программ и кода, живущий в Матрице. ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // magic-blockade
  // base-body-digital
  // current-body-digital
  {
    id: 'meta-eghost',
    name: 'Электронный призрак',
    description: 'Ты цифровой разум. Твое тело сгусток программ и кода, живущий в Матрице. ',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // tech-blockade
  // base-body-astral
  // current-body-astral
  // can-do-fleshpoint
  // can-be-exorcized
  {
    id: 'meta-spirit',
    name: 'Дух',
    description: 'Ты магическое создание, живущее в астральном мире.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Body +1
  {
    id: 'arch-rigger',
    name: 'Архетип: Риггер',
    description: 'Риггер, повелитель дронов, химии и хрома.',
    karmaCost: 100,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // Intelligence +1
  {
    id: 'arch-rigger-medic',
    name: 'Аспект: Риггер Медик',
    description: 'Медик. Ты знаешь всё про химию и полевую медицину.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // Intelligence +1
  {
    id: 'arch-rigger-engineer',
    name: 'Аспект: Риггер Инженер',
    description: 'Инженер. Ставишь импланты, моды, снимаешь моды. ',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // Body +1
  {
    id: 'arch-rigger-pilot',
    name: 'Аспект: Риггер Пилот',
    description: 'Пилот. Умеешь управлять дронами.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // Body  +2
  // Intelligence +2
  {
    id: 'arch-rigger-boost',
    name: 'Опытный Риггер',
    description: 'Очень опытный риггер.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseIntelligence, { amount: 2 })],
  },
  // Body +1
  {
    id: 'arch-samurai',
    name: 'Архетип: Самурай',
    description: 'Самурай. Практикуешь искусство Воина и враги трепещут при звуках твоего имени.',
    karmaCost: 100,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // Strength +1
  {
    id: 'arch-samurai-gunner',
    name: 'Аспект: Самурай Стрелок',
    description: 'Стрелок. Огнестрельное оружие - твой путь.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseStrength, { amount: 1 })],
  },
  // Body +1
  {
    id: 'arch-samurai-fighter',
    name: 'Аспект: Самурай Громила',
    description: 'Громила. Холодное оружие и несокрушимая броня - твой путь.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // Intelligence +1
  {
    id: 'arch-samurai-assasin',
    name: 'Аспект: Самурай Ассасин',
    description: 'Ассасин. Уловки и хитрости - твой путь.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // Body  +2
  // Strength +2
  {
    id: 'arch-samurai-boost',
    name: 'Опытный Самурай',
    description: 'Очень опытный самурай.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseStrength, { amount: 2 })],
  },
  // Intelligence +1
  {
    id: 'arch-hackerman',
    name: 'Архетип: Хакер',
    description: 'Хакер, владыка Матрицы!',
    karmaCost: 100,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // Intelligence +1
  {
    id: 'arch-hackerman-decker',
    name: 'Аспект: Хакер Декер',
    description: 'Чаммер, ты смог! ты постиг премудрости работы с кибердекой и научился использовать gUmMMy протокол!',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  //
  {
    id: 'arch-hackerman-technomancer',
    name: 'Аспект: Хакер Техномант',
    description: 'Чаммер, ты смог! Ты теперь чувствуешь Матрицу. Обычные люди на такое не способны',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // resonance +1
  {
    id: 'arch-hackerman-cyberadept',
    name: 'Аспект: Техномант Киберадепт',
    description: 'Техномант боец. ',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // resonance +1
  {
    id: 'arch-hackerman-technoshaman',
    name: 'Аспект: Техномант Техношаман',
    description: 'Техномант, специалист по Комплексным формам.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // Intelligence +2
  {
    id: 'arch-hackerman-decker-boost',
    name: 'Опытный Декер',
    description: 'Очень опытный хакер декер.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 2 })],
  },
  // resonance +2
  {
    id: 'arch-hackerman-technomancer-boost',
    name: 'Опытный Техномант',
    description: 'Очень опытный хакер техномант.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseResonance, { amount: 2 })],
  },
  // magic  +1
  {
    id: 'arch-mage',
    name: 'Архетип: Маг',
    description: 'Маг, повелитель заклинаний!',
    karmaCost: 100,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Body +1
  {
    id: 'arch-mage-adeptus',
    name: 'Аспект: Маг Адепт',
    description: 'Маг адепт. Твои способности выходят за грань доступного метачеловеку, но заклинания ограничены.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // magic  +1
  {
    id: 'arch-mage-spellcaster',
    name: 'Аспект: Маг Заклинатель',
    description: 'Маг заклинатель. Снимаю, порчу, колдую.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // magic  +1
  {
    id: 'arch-mage-summoner',
    name: 'Аспект: Маг Призыватель',
    description: 'Маг призыватель. Духи и зачарования.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Magic +2
  // body +2
  {
    id: 'arch-mage-boost',
    name: 'Опытный Маг',
    description: 'Очень опытный маг.',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 2 }), modifierFromEffect(increaseBody, { amount: 2 })],
  },
  // charisma +2
  {
    id: 'arch-face',
    name: 'Архетип: Фейс',
    description: 'Фейс, эксперт по переговорам.',
    karmaCost: 100,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
  },
  // charisma +1
  {
    id: 'arch-face-mentalist',
    name: 'Аспект: Фейс Менталист',
    description: 'Менталист. Очень, очень убедителен. И это не просто так.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  // charisma +1
  {
    id: 'arch-face-discursmonger',
    name: 'Аспект: Фейс Дискурсмонгер',
    description: 'Дискурсмонгер. Идеи, концепции и убеждения, твоя работа.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  // charisma +1
  {
    id: 'arch-face-geshaftmacher',
    name: 'Аспект: Фейс Гешефтмахер',
    description: 'Гешефтмахер. Контракты и нюйены интересуют тебя.',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  // charisma +2
  {
    id: 'arch-face-boost',
    name: 'Опытный Фейс',
    description: 'Очень опытный фейс',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
  },
  // depth +1
  {
    id: 'arch-ai',
    name: 'Архетип: Искусственный интеллект',
    description: 'Искусственный интеллект. ',
    karmaCost: 100,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseDepth, { amount: 1 })],
  },
  // depth +1
  {
    id: 'arch-ai-matrix',
    name: 'Аспект: ИИ Матрица',
    description: 'ИИ, специализирующийся на работе с Матрицей',
    karmaCost: 60,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseDepth, { amount: 1 })],
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
