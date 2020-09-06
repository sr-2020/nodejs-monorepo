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
  prerequisites: string[];
  modifier: Modifier | Modifier[];
}
// Not exported by design, use kAllPassiveAbilities instead.
const kAllPassiveAbilitiesList: PassiveAbility[] = [
  {
    id: 'feel-matrix',
    name: 'Чувствительность к Матрице',
    description: 'Ты чувствуешь матрицу. Устойчивость к фейдингу техноманта, у декера уменьшается время между входами на хоcт.',
    // TODO(https://trello.com/c/i5oFZkFF/216-метатипы): Implement and add modifier here
    // hacking.fadingResistance +1
    // hacking.enterCooldownReduced 15
    prerequisites: [],
    modifier: [modifierFromEffect(increaseFadingResistance, { amount: 1 })],
  },
  {
    id: 'chem-weak',
    name: 'Чувствительность к препаратам',
    description: 'Для воздействия препарата достаточно уменьшенной дозы. Аккуратно!',
    // chemo.baseEffectThreshold -40
    // chemo.uberEffectThreshold -30
    // chemo.superEffectThreshold -20
    // chemo.crysisThreshold -60
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseСhemoBaseEffectThreshold, { amount: -40 }),
      modifierFromEffect(increaseСhemoUberEffectThreshold, { amount: -30 }),
      modifierFromEffect(increaseСhemoSuperEffectThreshold, { amount: -20 }),
      modifierFromEffect(increaseСhemoCrysisThreshold, { amount: -60 }),
    ],
  },
  {
    id: 'elven-prices',
    name: 'Прекрасные цены',
    description: 'Ваш скоринг прекрасен, эльфийское долголетие всегда в цене! Особая скидка на все покупки!',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'chem-resist',
    name: 'Устойчивость к препаратам.',
    description: 'Сложнее получить передозировку препарата.',
    // chemo.crysisThreshold +40
    prerequisites: [],
    modifier: [modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 40 })],
  },
  {
    id: 'magic-feedback-resist',
    name: 'Устойчивость к Откату магов',
    description: 'Понижает Откат магов',
    // magicStats.feedbackMultiplier *0.9
    prerequisites: [],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  {
    id: 'matrix-feedback-resist',
    name: 'Устойчивость к Матрице',
    description: 'Снижает фейдинг техномантов и улучшает устойчивость к биофидбеку у декеров.',
    // hacking.fadingResistance +1
    // hacking.biofeedbackResistance +1
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseFadingResistance, { amount: 1 }),
      modifierFromEffect(increaseBiofeedbackResistance, { amount: 1 }),
    ],
  },
  {
    id: 'good-rigga',
    name: 'Устойчивость при подключению к дронам.',
    description: 'Снижает урон при выходе из поврежденного дрона.',
    // drones.droneFeedback -1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseDroneFeedback, { amount: -1 })],
  },
  {
    id: 'dont-touch-my-hole',
    name: 'Коротышка',
    description: 'Неотчуждаемый слот для бороды!',
    // у обычных метарасов 6 слотов.
    // у гномов 5 (-1 слот в Теле)
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsSlots, { amount: -1 })],
  },
  {
    id: 'extra-hp',
    name: 'Плюс хит',
    description: 'У тебя дополнительный хит в мясном теле. ',
    // maxHp +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMaxMeatHp, { amount: 1 })],
  },
  {
    id: 'spirit-feed',
    name: 'Знакомец духов',
    description: 'Снижает Сопротивление духов этому магу.',
    // magicStats.spiritResistanceMultiplier *0.8
    prerequisites: [],
    modifier: [modifierFromEffect(multiplySpiritResistanceMultiplier, { amount: 0.8 })],
  },
  {
    id: 'orkish-prices',
    name: 'Так себе цены.',
    description: 'Ваш скоринг очень плох, жизнь орка коротка. Ваши покупки будут дороже, чем у других метарас.',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'skin-armor',
    name: 'Кожный панцирь',
    description: 'Твоя шкура крепкая как броня. Тяжелое оружие бьет тебя по хитам.',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'this-my-glory-hole',
    name: 'Верзила',
    description: 'У троллей есть дополнительный слот для имплантов',
    // у обычных метарасов 6 слотов.
    // у троллей 7 (+7 слот в Теле)
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsSlots, { amount: 1 })],
  },
  {
    id: 'strong-arm',
    name: 'Сильная рука',
    description: 'Биологическая сила! Можно использовать оружие, требующее одной киберруки.',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'feed-tamagochi',
    name: 'Голодный как тролль!',
    description: 'Надо чаще питаться. Большому телу - нужен большой сойбургер!',
    // Обычный персонаж "ест" раз в цикл (в 6 часов), тролли едят каждые 3 часа.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'trollish-prices',
    name: 'Ужасные цены.',
    description: 'Ваш скоринг очень плох, жизнь тролля очень коротка. Ваши покупки будут заметно дороже, чем у других метарас.',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meat-hunger',
    name: 'Голод гулей',
    description: 'Твой эссенс уменьшается  на 0,2 каждый час',
    // Эссенс персонажа уменьшается на 0,2 каждый час
    // Essense_Loss
    //  itGapEssense = увеличивается 20 каждый час
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'blood-thirst',
    name: 'Жажда вампиров',
    description: 'Твой эссенс уменьшается на 1 каждый час',
    // Эссенс персонажа уменьшается на 1 каждый час
    //  itGapEssense = увеличивается 100 каждый час
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'starvation',
    name: 'Алчность',
    description: 'При Эссенс персонажа <1 ты не можешь активировать абилки ',
    // Если itEssense <1, то у персонажа блокируется активация всех активных абилок кроме абилок ghoul-feast и vampire-feast. Проверка проводится при каждом пересчете itEssense.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'chem-resist-heavy',
    name: 'Резистивность к препаратам.',
    description: 'Для правильного воздействия препарата нужны увеличенные дозы. Аккуратно!',
    // chemo.baseEffectThreshold +30
    // chemo.uberEffectThreshold +80
    // chemo.superEffectThreshold +80
    // chemo.crysisThreshold +40
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseСhemoBaseEffectThreshold, { amount: 30 }),
      modifierFromEffect(increaseСhemoUberEffectThreshold, { amount: 80 }),
      modifierFromEffect(increaseСhemoSuperEffectThreshold, { amount: 80 }),
      modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 40 }),
    ],
  },
  {
    id: 'astral-vision',
    name: 'Астральное зрение',
    description: 'Ты можешь видеть существ, находящихся в Астрале и говорить с ними.',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'chrome-blockade',
    name: 'Отторжение хрома',
    description: 'Ты не можешь использовать кибернетические импланты. Биотех - можно.',
    // в типах имплантах есть разделение, надо посмотреть как оно там сделано
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'tech-blockade',
    name: 'Отторжение дронов и Резонанса',
    description: 'Ты не можешь изучать навыки Риггера Пилота и Хакера Техноманта ',
    // вписано в требования архетипов
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'magic-blockade',
    name: 'Отторжение Магии',
    description: 'Ты не можешь изучать навыки Мага',
    // вписано в требования архетипов
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'spirit-attuned',
    name: 'Сильный призыватель духов',
    description: '',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'orkish-ethics',
    name: 'Твердость кодекса',
    description: '',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'trollish-ethics',
    name: '',
    description:
      'Если тролль покидает свою дискурс-группу - он переживает ужасный излом идентичности. Вырази это максимально понятным для окружающих способом, желательно с причинением тяжких телесных повреждений.  ',
    // `
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'elven-ethics',
    name: 'Гибкость кодекса',
    description: 'Этическая особенность Эльфов',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'incriminating-evidence',
    name: 'Собрать компромат',
    description:
      'Напиши большую статью об интересующем тебя человеке или организации. Добейся, чтобы эта статья вошла в топ-20 понравившихся материалов. Получи от МГ компромат на этого человека или организацию. Степень подробности информации зависит от положения статьи в рейтинге топ-20. Вы не можете собирать компромат в течении 12 часов после получения прошлых итогов компромата.',
    // САБЖ, как в описании. Выдаем какую-то прикольную сюжетную инфу
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'always-online',
    name: 'Всегда на связи',
    description:
      'Чтобы с вами ни происходило, в каком бы вы ни были состоянии, как бы вас ни заколдовали, если вы живы - вы можете пользоваться телеграммом для передачи игровых сообщений. В мире игре этого не видно, по вам нельзя понять, что вы что-то пишете, отнять телефон и так далее.',
    // САБЖ, как в описании.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'last-report',
    name: 'Это мой последний репортаж',
    description:
      'Если вас каким-либо образом все-таки убили, вы можете написать сообщение с описанием подробностей вашей смерти, как все это происходило, что вы об этом думаете, оставить последние пожелания для подписчиков и опубликовать это в вашем телеграмм-канале. Вы можете описывать что происходило с вашим телом и вокруг него. ',
    // САБЖ, как в описании.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'ask-anon',
    name: 'Спроси анонимуса',
    description:
      'Раз в 12 часов вы можете получить ответ от мастеров на любой вопрос, подразумевающий ответ "да или нет" или подробный ответ на вопрос, касающийся бэка игры и событий, произошедших в мире игры до ее начала. Кто-то из ваших читателей скинул вам эту инфу в личку. Данную информацию нельзя использовать как доказательства в суде - ведь остальные могут сомневаться в том, что анонимус знает все. Но вы не сомневаетесь в этом. ',
    // САБЖ, как в описании.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'bloggers-support',
    name: 'Поддержка блоггеров',
    description:
      'Раз в 12 часов вы можете назвать мастерам некую личность или организацию и защитить ее от использования способности "собрать компромат" на 12 часов.',
    // САБЖ, как в описании.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'project-manager-1',
    name: 'ты - проект-менеджер1',
    description: 'сертификат проект-менеджера. может вести не более 1 проекта одновременно',
    // для проект-менеджера  с 1 слотом
    // У игрока просто отображается текст пассивной абилки
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'project-manager-3',
    name: 'ты - проект-менеджер3',
    description: 'сертификат проект-менеджера. может вести до 3 проектов одновременно',
    // для проект-менеджера с 3 слотами
    // У игрока просто отображается текст пассивной абилки
    prerequisites: ['project-manager-1'],
    modifier: [],
  },
  {
    id: 'deck-mods-1',
    name: 'уровень 1',
    description: '',
    // возможность пользоваться модами 1 уровня
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'deck-mods-2',
    name: 'уровень 2',
    description: '',
    // возможность пользоваться модами 2 уровня
    prerequisites: ['deck-mods-1'],
    modifier: [],
  },
  {
    id: 'deck-mods-3',
    name: 'уровень 3',
    description: '',
    // возможность пользоваться модами 3 уровня
    prerequisites: ['deck-mods-2'],
    modifier: [],
  },
  {
    id: 'deck-mods-4',
    name: 'уровень 4',
    description: '',
    // возможность пользоваться модами 4 уровня
    prerequisites: ['deck-mods-3'],
    modifier: [],
  },
  {
    id: 'link-lock',
    name: 'linklock',
    description: 'linklock <target>',
    // Захват цели в линк лок
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'auto-link-lock',
    name: 'autolinklock',
    description: 'autolock <target>',
    // Автоматический захват цели в линклок при появлении
    prerequisites: ['link-lock'],
    modifier: [],
  },
  {
    id: 'geo-pro-1',
    name: 'геоспец 1',
    description: 'useapi read',
    // позволяет читать данные из геоапи
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'geo-pro-2',
    name: 'геоспец 2',
    description: 'useapi read',
    // позволяет читать данные из геоапи - лучше. Позволяет изменять данные
    prerequisites: ['geo-pro-1'],
    modifier: [],
  },
  {
    id: 'geo-pro-3',
    name: 'геоспец 3',
    description: 'useapi read/update',
    // позволяет читать данные из геоапи - лучше. Позволяет изменять данные лучше
    prerequisites: ['geo-pro-2'],
    modifier: [],
  },
  {
    id: 'economics-pro-1',
    name: 'эконом 1',
    description: 'useapi read',
    // позволяет читать данные из эконом апи
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'economics-pro-2',
    name: 'эконом 2',
    description: 'useapi read',
    // позволяет читать данные из эконом- лучше. Позволяет немного воровать
    prerequisites: ['economics-pro-1'],
    modifier: [],
  },
  {
    id: 'economics-pro-3',
    name: 'эконом 3',
    description: 'useapi read/update',
    // позволяет читать данные из эконом- лучше. Позволяет немного воровать. Работа с магазин/корпа
    prerequisites: ['economics-pro-2'],
    modifier: [],
  },
  {
    id: 'economics-symbiosis',
    name: 'Эконом-симбиоз',
    description: '',
    // преодолевает анонимизацию фиксира
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'rus-registry-1',
    name: 'россестр 1',
    description: 'useapi read',
    // позволяет читать данные из реестров
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'rus-registry-2',
    name: 'россестр 2',
    description: 'useapi read',
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные
    prerequisites: ['rus-registry-1'],
    modifier: [],
  },
  {
    id: 'rus-registry-3',
    name: 'россестр 3',
    description: 'useapi read/update',
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные лучше
    prerequisites: ['rus-registry-2'],
    modifier: [],
  },
  {
    id: 'meds-and-chrome-1',
    name: 'Медицина и Хром 1',
    description: 'useapi read',
    // позволяет читать данные из реестров
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meds-and-chrome-2',
    name: 'Медицина и Хром 2',
    description: 'useapi read',
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные
    prerequisites: ['meds-and-chrome-1'],
    modifier: [],
  },
  {
    id: 'meds-and-chrome-3',
    name: 'Медицина и Хром 3',
    description: 'useapi read/update',
    // позволяет читать данные из реестров - лучше. Позволяет изменять данные лучше
    prerequisites: ['meds-and-chrome-2'],
    modifier: [],
  },
  {
    id: 'other-control-1',
    name: 'прочий контроль 1',
    description: 'useapi read',
    // работа с прочими контролями -1
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'other-control-2',
    name: 'прочий контроль 2',
    description: 'useapi read',
    // работа с прочими контролями -2
    prerequisites: ['other-control-1'],
    modifier: [],
  },
  {
    id: 'other-control-3',
    name: 'прочий контроль 3',
    description: 'useapi read/update',
    // работа с прочими контролями -3
    prerequisites: ['other-control-2'],
    modifier: [],
  },
  {
    id: 'reactivate',
    name: 'reactivate',
    description: 'reactivate <target>',
    // Позволяет реактивировать вырубленный IC
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'huge-lucker',
    name: 'Конский лак ',
    description: '',
    // Позволяет пережить одну атаку черного льда
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'admin',
    name: 'Админ',
    description: '',
    // Еще 3 хоста, на защиту которых ты можешь подписаться
    prerequisites: [],
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 3 }),
  },
  {
    id: 'compressor',
    name: 'Компрессор',
    description: '',
    // Разобрался со всеми примудростями квантовой компрессии. Позволяет экономить 10% памяти кибердеки при записи софта в деку
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'diagnostician',
    name: 'Диагност (техномант)',
    description: '',
    // Позволяет реактивировать вырубленый IC
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'just-a-normal-guy',
    name: 'Обыкновенный',
    description: '',
    // Вэрианс на 10% быстрее падает
    prerequisites: [],
    modifier: modifierFromEffect(increaseVarianceResistance, { amount: 10 }),
  },
  {
    id: 'quite-enduring-guy',
    name: 'Стойкий',
    description: '',
    // Фейдинг на 10% меньше
    prerequisites: [],
    modifier: modifierFromEffect(increaseFadingResistance, { amount: 10 }),
  },
  {
    id: 'squid',
    name: 'Сквид',
    description: '',
    // Увеличивает возможное количество бэкдоров. Зависит от уровня резонанса
    prerequisites: [],
    modifier: modifierFromEffect(increaseBackdoors, { amount: 3 }),
  },
  {
    id: 'last-droplet',
    name: 'Ну еще капельку',
    description: '',
    // Бэкдоры дохнут медленнее
    //
    // [Время_жизни_бэкдоров] +20
    prerequisites: [],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 20 }),
  },
  {
    id: 'very-last-droplet',
    name: 'Выжать до капли',
    description: '',
    // "Бэкдоры дохнут еще медленнее
    //
    // [Время_жизни_бэкдоров] +40" (комулятивно те в сумме 60)
    prerequisites: [],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 40 }),
  },
  {
    id: 'longer-vr-stays-1',
    name: 'Мужчина, продлевать будете? ',
    description: '',
    // Увеличение длительности пребывания в виаре - для Техномантов. Покупается за карму.
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 60 }),
  },
  {
    id: 'longer-vr-stays-2',
    name: 'Мужчина, продлевать будете?  v2',
    description: '',
    // Увеличение длительности пребывания в виаре - для жителей Виара и Основания. Мастерская, дается силой рельсы
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 120 }),
  },
  {
    id: 'unlimited-vr-stays',
    name: 'Виар. А я вообще тут живу.',
    description: '',
    // Абилка егостов и ИИ. Мастерская, дается силой рельсы.
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 9000 }),
  },
  {
    id: 'resonance-1',
    name: 'Резонанс -1',
    description: '',
    // Резонанс +1
    prerequisites: [],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  {
    id: 'resonance-2',
    name: 'Резонанс -2',
    description: '',
    // Резонанс +1
    prerequisites: ['resonance-1'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  {
    id: 'resonance-3',
    name: 'Резонанс -3',
    description: '',
    // Резонанс +1
    prerequisites: ['resonance-2'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  {
    id: 'resonance-4',
    name: 'Резонанс -4',
    description: '',
    // Резонанс +1
    prerequisites: ['resonance-3'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  {
    id: 'resonance-5',
    name: 'Резонанс -5',
    description: '',
    // Резонанс +1
    prerequisites: ['resonance-4'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  {
    id: 'additional-sprite',
    name: 'Намертво!',
    description: '',
    // Еще один связанный спрайт
    prerequisites: [],
    modifier: modifierFromEffect(increaseSpriteCount, { amount: 1 }),
  },
  {
    id: 'additional-query',
    name: 'Чтец',
    description: '',
    // Еще один запрос к контролю
    prerequisites: [],
    modifier: modifierFromEffect(increaseControlRequests, { amount: 1 }),
  },
  {
    id: 'synchronized',
    name: 'Синхронизатор',
    description: '',
    // Меньше лаг данных контроля (по умолчанию данные контроля  старее чем 30 минут от момента запроса)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'longer-party-vr-stays-1',
    name: 'Бой часов раздастся вскоре 1',
    description: 'Не нравится мне название :(',
    // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
    // Добавляет время пребывания в Основании партии ( + Х секунд)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'longer-party-vr-stays-2',
    name: 'Бой часов раздастся вскоре 2',
    description: '',
    // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
    // Добавляет время пребывания в Основании партии ( + Х секунд)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'longer-party-vr-stays-3',
    name: 'Бой часов раздастся вскоре 3',
    description: '',
    // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
    // Добавляет время пребывания в Основании партии ( + Х секунд)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'gunslinger',
    name: 'Самый быстрый пистолет на Западе',
    description: '',
    // Вне зависимости от уровня резонанса всегда имеет наивысшую инициативу в красной комнате. Если техномантов с такой абилкой несколько - то по уровню резонанса.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'not-the-droids',
    name: 'Мы не те дроиды которых вы ищете',
    description: '',
    // Позволяет игнорировать атаку активного агента хоста. (PvE игротеха)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'scan',
    name: 'scan',
    description: 'Сканирует ноду и выводит список обнаруженных в ней агентов\n\nУспешность определяется по Sleaze',
    // борьба с чужим софтом (если повезет - то и со спрайтами)
    //
    // IT: команда в Кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'deploy',
    name: 'deploy',
    description: 'Устанавливает агента (софт) в Ноду Хоста\n--name:<имя>\n\n\nУспешность определяется по Sleaze',
    // установка дряни / пользы в чужой хост
    //
    // -- shadow (если есть абилка shadow deploy)
    // -- persistent (если есть абилка persistent deploy)
    //
    // IT: команда в Кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'uninstall',
    name: 'uninstall',
    description: 'Удаляет агента с Ноды\n\nУспешность определяется по Sleaze',
    // очистка хоста от чужой дряни / пользы
    //
    // IT: команда в Кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'feelmatrix',
    name: 'feelmatrix',
    description:
      'Ты теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в на Хост\nВыдает список хостов, на которых есть другие декеры и примерный уровень группы. Чем сильнее твой Sleaze, тем больше таких хостов ты найдешь',
    // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
    //
    // IT: Команда в Кривда-Матрице, основного IT нет
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'bypass',
    name: 'bypass',
    description: 'Гениально! Этот IC просто не заметил тебя!\n\nПозволяет проходить мимо IC.\n\nУспешность определяется по Sleaze',
    // мини-корова декеров, закрытая этикой
    //
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'hop',
    name: 'hop',
    description:
      'Перемещение по временному трейлу в ноду, в которой установлен якорный агент (backdoor, anchor...) с известным тебе именем (то есть значением ключа --name команды deploy)',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'quell',
    name: 'quell',
    description: 'команда применяется в бою с IC. Атакованный IC пропустит несколько своих следующих атак (зависит от Firewall)',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'getdump',
    name: 'getdump',
    description: 'команда применяется в бою с IC. Позволяет получить фрагмент дампа IC для CVE анализа',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'vulnerabilities-sniffer',
    name: 'Нюх на уязвимости',
    description: 'Позволяет получить дополнительные фрагменты дампов, в зависимости от значения Attack',
    // IT: буду запрашивать сам факт наличия фичи
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'stubbornness-1',
    name: 'Выдающаяся упертость',
    description: 'Продлевает максимальное время нахождения на хосте на 5 минут',
    // IT:
    // [+5] Декер_макс_время_на_хосте
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 5 }),
  },
  {
    id: 'stubbornness-2',
    name: 'Удивительная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на10 минут',
    // IT:
    // [+10] Декер_макс_время_на_хосте
    prerequisites: ['stubbornness-1'],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },
  {
    id: 'stubbornness-3',
    name: 'Легендарная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 10 минут',
    // IT:
    // [+10] Декер_макс_время_на_хосте
    prerequisites: ['stubbornness-2'],
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },
  {
    id: 'persistent-deploy',
    name: 'Persistent deploy',
    description: 'Позволяет применять ключ --persistant команды deploy\n\nключ позволяет агенту переживать обновлие хоста',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'shadow-deploy',
    name: 'Shadow deploy',
    description:
      'Позволяет применять ключ --shadow команды deploy\n\nключ затрудняет обнаружение агента (зависит от значения Sleaze ищущего)',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'quick-to-enter-1',
    name: 'Шустрый',
    description: 'Снижает время входа на хост на 2 минуты',
    // IT:
    // [+5] Декер_скорость_входа_на_хост
    prerequisites: [],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 5 }),
  },
  {
    id: 'quick-to-enter-2',
    name: 'Очень шустрый',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 3 минут',
    // IT:
    // [+10] Декер_скорость_входа_на_хост
    prerequisites: ['quick-to-enter-1'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },
  {
    id: 'quick-to-enter-3',
    name: 'Супер шустрый',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 5 минут',
    // IT:
    // [+10] Декер_скорость_входа_на_хост
    prerequisites: ['quick-to-enter-2'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },
  {
    id: 'flee',
    name: 'flee',
    description: 'Позволяет попытаться сбежать из линклока. \n\nЗависит от соотношения значений  вашего Sleaze и Attack цели',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'breacher-1',
    name: 'Хороший Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    // Абилка конверсии Intellect в Firewall
    // IT:
    // [+2] Декер_конверсия_Firewall
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  {
    id: 'breacher-2',
    name: 'Отличный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    // IT:
    // [+2] Декер_конверсия_Firewall
    prerequisites: ['breacher-1'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  {
    id: 'breacher-3',
    name: 'Легендарный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    // IT:
    // [+2] Декер_конверсия_Firewall
    prerequisites: ['breacher-2'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  {
    id: 'fencer-1',
    name: 'Хороший Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    // Абилка конверсии Intellect в Attack
    // IT:
    // [+2] Декер_конверсия_Attack
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  {
    id: 'fencer-2',
    name: 'Отличный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    // IT:
    // [+2] Декер_конверсия_Attack
    prerequisites: ['fencer-1'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  {
    id: 'fencer-3',
    name: 'Легендарный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    // IT:
    // [+2] Декер_конверсия_Attack
    prerequisites: ['fencer-2'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  {
    id: 'sly-1',
    name: 'Хороший Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    // Абилка конверсии Intellect в Sleaze
    // IT:
    // [+2] Декер_конверсия_Sleaze
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  {
    id: 'sly-2',
    name: 'Отличный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    // IT:
    // [+2] Декер_конверсия_Sleaze
    prerequisites: ['sly-1'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  {
    id: 'sly-3',
    name: 'Легендарный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    // IT:
    // [+2] Декер_конверсия_Sleaze
    prerequisites: ['sly-2'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  {
    id: 'miner-1',
    name: 'Хороший Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    // Абилка конверсии Intellect в Dataprocessing
    // IT:
    // [+2] Декер_конверсия_Dataprocessing
    prerequisites: [],
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 2 }),
  },
  {
    id: 'miner-2',
    name: 'Отличный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    // IT:
    // [+2] Декер_конверсия_Dataprocessing
    prerequisites: ['miner-1'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, {
      amount: 2,
    }),
  },
  {
    id: 'miner-3',
    name: 'Легендарный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    // IT:
    // [+2] Декер_конверсия_Dataprocessing
    prerequisites: ['miner-2'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, {
      amount: 2,
    }),
  },
  {
    id: 'burn',
    name: 'burn',
    description:
      'Позволяет наносить урон кибердеке противника, повреждать его моды\n\nУрон зависит от соотношения значений вашей Attack и Firewall цели',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'arpscan',
    name: 'arpscan',
    description:
      'Выводит список всех Персон, находящихся на хосте\n\nВысокие значения Sleaze или специальные спосбности могут обмануть эту команду',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'trace',
    name: 'trace',
    description: 'Отображает якорь PAN хоста поверженного (выброшенного в ходе боя из Матрицы) декера',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'steal',
    name: 'steal',
    description:
      'Находясь на ноде PAN хоста с определенным API, позволяет осуществить перевод автоматически определяемой суммы денег\n\nСумма зависит от значенияй ваших характеристик Sleaze и Dataprocessing',
    // IT: команда в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'steal-pro',
    name: 'Фрод профи',
    description:
      'Разблокирует ключи команды steal\n\n--enterprize: работа с кошельками юр лиц\n--comment: позволяет ввести текст "основания перевода", вместо билиберды по умолчанию',
    // IT: ключ команды в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'steal-expert',
    name: 'Фрод эксперт',
    description: 'Разблокирует ключи команды steal\n\n--SIN: переводит сумму на другой SIN',
    // IT: ключ команды в кривда-матрице
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'quarter-god',
    name: 'Четвертак',
    description:
      'Русское название для слэнга "qouterGOD", шутливое название для серьезных людей: профессиональных контракторов по частной защиты Хостов.\n\nКоличество защищаемых хостов +5',
    // IT:
    // [+5] Хакер_число_админ_хостов
    prerequisites: [],
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 5 }),
  },
  {
    id: 'deep-compile',
    name: 'Глубокая компиляция',
    description: 'Тебе проще компилировать спрайты',
    // Комулятивно добавляет устойчивость к фейдингу при компиляции спрайтов
    //
    // IT:
    // [+20] Техномант_Устойчивость_Фейдингу_Компиляция
    prerequisites: [],
    modifier: modifierFromEffect(increaseCompilationFadingResistance, {
      amount: 20,
    }),
  },
  {
    id: 'native-compile',
    name: 'Нативная компиляция',
    description: 'Тебе намного проще компилировать спрайты',
    // Комулятивно добавляет устойчивость к фейдингу при компиляции спрайтов
    //
    // IT:
    // [+30] Техномант_Устойчивость_Фейдингу_Компиляция
    prerequisites: [],
    modifier: modifierFromEffect(increaseCompilationFadingResistance, {
      amount: 30,
    }),
  },
  {
    id: 'sprites-1',
    name: 'Спрайты-1',
    description: 'Ты можешь компилировать спрайты 1 уровня',
    //
    // IT:
    // [+1] Техномант_Уровень_Спрайтов
    prerequisites: [],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  {
    id: 'sprites-2',
    name: 'Спрайты-2',
    description: 'Ты можешь компилировать спрайты 2 уровня',
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
    //
    // IT:
    // [+1] Техномант_Уровень_Спрайтов
    prerequisites: ['sprites-2'],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  {
    id: 'increase-the-charisma-1',
    name: 'Повышение Харизмы от 3 до 4 ',
    description: 'Перманентное увеличение Харизмы персонажа - 1',
    // Увеличивает Харизму персонажа менталиста с 3 до 4
    prerequisites: [],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  {
    id: 'increase-the-charisma-2',
    name: 'Повышение Харизмы от 4 до 5',
    description: 'Перманентное увеличение Харизмы персонажа - 2',
    // Увеличивает Харизму персонажа менталиста с 4 до 5
    prerequisites: ['increase-the-charisma-1'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  {
    id: 'increase-the-charisma-3',
    name: 'Повышение Харизмы от 5 до 6 ',
    description: 'Перманентное увеличение Харизмы персонажа - 3',
    // Увеличивает Харизму персонажа менталиста с 5 до 6
    prerequisites: ['increase-the-charisma-2'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  {
    id: 'increase-the-charisma-4',
    name: 'Повышение Харизмы от 6 до 7',
    description: 'Перманентное увеличение Харизмы персонажа - 4',
    // Увеличивает Харизму персонажа менталиста с 6 до 7
    prerequisites: ['increase-the-charisma-3'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  {
    id: 'increase-the-charisma-5',
    name: 'Повышение Харизмы от 7 до 8',
    description: 'Перманентное увеличение Харизмы персонажа - 5',
    // Увеличивает Харизму персонажа менталиста с 7 до 8
    prerequisites: ['increase-the-charisma-4'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  {
    id: 'look-its-shekel',
    name: 'Опа, шекель!',
    description: 'При получении лута после прохождения данжа покажи данную абилку игротеху. Ты получаешь +10% от лута твоей команды.',
    // при прохождении данжа ГМ выносит из данжа + 10% от базовой стоимости лута
    // Покажи игротеху абилку - получи больше лута на 10%
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'mу-scoring',
    name: 'Мой скоринг',
    description: 'отображается  текущий коэф. скоринга данного персонажа',
    // У гм на экране экономики отображаются  его текущие множители скоринга.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'igra-na-birge-1',
    name: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 2% от всех своих рентных платежей.',
    // После списания рентных платежей гм получает кэшбек в размере 2% от списанной суммы. Начисляется после каждого списания рентных платежей.
    prerequisites: [],
    modifier: modifierFromEffect(increaseStockGainPercentage, { amount: 2 }),
  },
  {
    id: 'igra-na-birge-2',
    name: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 5% от всех своих рентных платежей.',
    // После списания рентных платежей гм получает кэшбек в размере 5% от списанной суммы. Начисляется после каждого списания рентных платежей.
    prerequisites: ['igra-na-birge-1'],
    modifier: modifierFromEffect(increaseStockGainPercentage, {
      amount: 5 - 2,
    }),
  },
  {
    id: 'igra-na-birge-3',
    name: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 13% от всех своих рентных платежей.',
    // После списания рентных платежей гм получает кэшбек в размере 13% от списанной суммы. Начисляется после каждого списания рентных платежей.
    prerequisites: ['igra-na-birge-2'],
    modifier: modifierFromEffect(increaseStockGainPercentage, {
      amount: 13 - 5,
    }),
  },
  {
    id: 'anonymous-transaction',
    name: 'фиксер',
    description: 'гм производит анонимный перевод между двумя персонажами. ',
    // анонимизация перевода - не показываем это в логах никому кроме фиксера, его контрагента и мастеров
    prerequisites: [],
    modifier: modifierFromEffect(setTransactionAnonymous, {}),
  },
  {
    id: 'dm-fanatic-1',
    name: 'Фанатик-1',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 20%',
    // Все кулдауны способностей дискурсмонгера снижены на 20%
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.8,
    }),
  },
  {
    id: 'dm-fanatic-2',
    name: 'Фанатик-2',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 40%',
    // Все кулдауны способностей дискурсмонгера снижены на 40%
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.6 / 0.8,
    }),
  },
  {
    id: 'dm-fanatic-3',
    name: 'Фанатик-3',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 60%',
    // Все кулдауны способностей дискурсмонгера снижены на 60%
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.4 / 0.6,
    }),
  },
  {
    id: 'dm-soul-expert',
    name: 'Душевед',
    description: 'Предъявите экран с описанием способности игроку, чтобы тот показал вам свой этикпрофиль',
    // Абилка-сертификат, позволяющий просмотреть чужой этикпрофиль
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'churched',
    name: 'Воцерковленный',
    description:
      'После исповеди или участия в богослужении вы можете нажать "Готово" на любом Поступке личной этики, не выполняя его требований',
    // Абилка-сертификат
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'discount-all-1',
    name: 'Скидосы - 10%',
    description: 'Скидки. Стоимость товара умножается на 0,9 при покупке любого товара ',
    // Множитель 0,9 на стоимость товара при покупке любого товара  данным персонажем
    //
    prerequisites: [],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.9 }),
  },
  {
    id: 'discount-all-2',
    name: 'Скидосы - 20%',
    description: 'Скидка. Стоимость товара умножается на 0,8 при покупке любого товара',
    // Множитель 0,8 при покупке любого товара  данным персонажем
    prerequisites: ['discount-all-1'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.8 }),
  },
  {
    id: 'discount-all-3',
    name: 'Скидосы - 30%',
    description: 'Скидки Стоимость товара умножается на 0,7 при покупке любого товара ',
    // Множитель 0,7 при покупке любого товара  данным персонажем
    prerequisites: ['discount-all-2'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.7 }),
  },
  {
    id: 'discount-samurai',
    name: 'Скидка на броню и оружие',
    description: 'У тебя есть скидка 10% на покупку оружия и брони.',
    // множитель 0,9 при покупке товаров типа ХОЛОДНОЕ ОРУЖИЕ,
    // ДИСТАНЦИОННОЕ ОРУЖИЕ, БРОНЯ.
    prerequisites: [],
    modifier: modifierFromEffect(multiplyDiscountWeaponsArmor, { amount: 0.9 }),
  },
  {
    id: 'discount-ares',
    name: 'Ares Macrotechnolgy скидка',
    description: 'скидка 10% на товары корпорации Ares Macrotechnolgy',
    // множитель 0,9 на  все товары с параметром Corporation = Ares Macrotechnolgy
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountAres, { amount: 0.9 }),
  },
  {
    id: 'discount-aztechnology',
    name: 'Aztechnology (ORO) скидка',
    description: 'скидка 10% на товары корпорации Aztechnology (ORO)',
    // множитель 0,9 на  все товары с параметром Corporation =Aztechnology (ORO)
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountAztechnology, {
      amount: 0.9,
    }),
  },
  {
    id: 'discount-saeder-krupp',
    name: 'Saeder-Krupp скидка',
    description: 'скидка 10% на товары корпорации Saeder-Krupp',
    // множитель 0,9 на  все товары с параметром Corporation =Saeder-Krupp
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountSaederKrupp, {
      amount: 0.9,
    }),
  },
  {
    id: 'discount-spinradglobal',
    name: 'Spinrad Global (JRJ INT) скидка',
    description: 'скидка 10% на товары корпорации Spinrad Global (JRJ INT)',
    // множитель 0,9 на  все товары с параметром Corporation =.Spinrad Global (JRJ INT)
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountSpinradGlobal, {
      amount: 0.9,
    }),
  },
  {
    id: 'discount-neonet1',
    name: 'NeoNet1 (TransLatviaSeledir) скидка',
    description: 'скидка 10% на товары корпорации NeoNet1 (TransLatviaSeledir)',
    // множитель 0,9 на  все товары с параметром Corporation =NeoNet1 (TransLatviaSeledir)
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountNeonet1, { amount: 0.9 }),
  },
  {
    id: 'discount-evo',
    name: 'EVO скидка',
    description: 'скидка 10% на товары корпорации EVO',
    // множитель 0,9 на  все товары с параметром Corporation =EVO
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountEvo, { amount: 0.9 }),
  },
  {
    id: 'discount-horizon',
    name: 'Horizon скидка',
    description: 'скидка 10% на товары корпорации Horizon',
    // множитель 0,9 на  все товары с параметром Corporation =Horizon
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountHorizon, { amount: 0.9 }),
  },
  {
    id: 'discount-wuxing',
    name: 'Wuxing скидка',
    description: 'скидка 10% на товары корпорации Wuxing',
    // множитель 0,9 на  все товары с параметром Corporation =Wuxing
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountWuxing, { amount: 0.9 }),
  },
  {
    id: 'discount-russia',
    name: 'Россия скидка',
    description: 'скидка 10% на товары корпорации Россия',
    // множитель 0,9 на  все товары с параметром Corporation =Россия
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountRussia, { amount: 0.9 }),
  },
  {
    id: 'discount-renraku',
    name: 'Renraku скидка',
    description: 'скидка 10% на товары корпорации Renraku',
    // множитель 0,9 на  все товары с параметром Corporation =Renraku
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountRenraku, { amount: 0.9 }),
  },
  {
    id: 'discount-mutsuhama',
    name: 'Mutsuhama скидка',
    description: 'скидка 10% на товары корпорации Mutsuhama',
    // множитель 0,9 на  все товары с параметром Corporation =Mutsuhama
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountMutsuhama, {
      amount: 0.9,
    }),
  },
  {
    id: 'discount-shiavase',
    name: 'Shiavase скидка',
    description: 'скидка 10% на товары корпорации Shiavase',
    // множитель 0,9 на  все товары с параметром Corporation =Shiavase
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountShiavase, { amount: 0.9 }),
  },
  {
    id: 'magic-1',
    name: 'Магия 1',
    description: 'Подвластная тебе Мощь увеличивается',
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: [],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-2',
    name: 'Магия 2',
    description: 'Подвластная тебе Мощь увеличивается',
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: ['magic-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-3',
    name: 'Магия 3',
    description: 'Подвластная тебе Мощь увеличивается',
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: ['magic-2', 'spirit-enemy-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-4',
    name: 'Магия 4',
    description: 'Подвластная тебе Мощь увеличивается',
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: ['magic-3', 'spirit-enemy-2'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-5',
    name: 'Магия 5',
    description: 'Подвластная тебе Мощь увеличивается',
    // Перманентно увеличивает характеристику Магия на 1
    prerequisites: ['magic-4', 'spirit-enemy-3'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-feedback-resistance-1',
    name: 'Сопротивление Откату 1',
    description: 'Ты легче выносишь Откат',
    // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. То есть от базового получается 1*0.9=0.9)
    prerequisites: [],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  {
    id: 'magic-feedback-resistance-2',
    name: 'Сопротивление Откату 2',
    description: 'Ты легче выносишь Откат',
    // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимого СопрОткату1 коэффициентСопротивленияОткату = 1*0.9*0.9=0.81)
    prerequisites: ['magic-feedback-resistance-1'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  {
    id: 'magic-feedback-resistance-3',
    name: 'Сопротивление Откату 3',
    description: 'Ты легче выносишь Откат',
    // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимых СопрОткату1-2 коэффициентСопротивленияОткату = 1*0.9*0.9*0.9=0.729)
    prerequisites: ['magic-feedback-resistance-2'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  {
    id: 'magic-feedback-unresistance-1',
    name: 'Откатошный 1',
    description: 'Ты тяжелее выносишь Откат',
    // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. То есть от базового получается 1*1.2=1.2)
    prerequisites: [],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  {
    id: 'magic-feedback-unresistance-2',
    name: 'Откатошный 2',
    description: 'Ты тяжелее выносишь Откат',
    // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимого Откатошный1 коэффициентСопротивленияОткату = 1*1.2*1.2=1.44)
    prerequisites: ['magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  {
    id: 'magic-feedback-unresistance-3',
    name: 'Откатошный 3',
    description: 'Ты тяжелее выносишь Откат',
    // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимых Откатошный1-2 коэффициентСопротивленияОткату = 1*1.2*1.2*1.2=1.728)
    prerequisites: ['magic-feedback-unresistance-2'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  {
    id: 'magic-recovery-1',
    name: 'Воспрянь и пой 1',
    description: 'Магия возвращается к тебе быстрее',
    // Перманентно ускоряет восстановление Магии на 20%. То есть от базового 1 КоэффициентВосстановленияМагии станет 1*1.2=1.2
    prerequisites: [],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  {
    id: 'magic-recovery-2',
    name: 'Воспрянь и пой 2',
    description: 'Магия возвращается к тебе быстрее',
    // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже был взят Воспрянь и пой 1, то КоэффициентВосстановленияМагии станет 1*1.2*1.2=1.44
    prerequisites: ['magic-recovery-1'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  {
    id: 'magic-recovery-3',
    name: 'Воспрянь и пой 3',
    description: 'Магия возвращается к тебе быстрее',
    // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже были Воспрянь и пой 1-2, КоэффициентВосстановленияМагии станет 1*1.2*1.2*1.2=1.728
    prerequisites: ['magic-recovery-2'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  {
    id: 'spirit-friend-1',
    name: 'Дружелюбие духов 1',
    description: 'Ты понимаешь настроения духов',
    // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
    prerequisites: [],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  {
    id: 'spirit-friend-2',
    name: 'Дружелюбие духов 2',
    description: 'Ты понимаешь настроения духов',
    // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
    prerequisites: ['spirit-friend-1', 'magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  {
    id: 'spirit-friend-3',
    name: 'Дружелюбие духов 3',
    description: 'Ты понимаешь настроения духов',
    // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
    prerequisites: ['spirit-friend-2'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  {
    id: 'spirit-enemy-1',
    name: 'Духопротивный 1',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
    prerequisites: [],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  {
    id: 'spirit-enemy-2',
    name: 'Духопротивный 2',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
    prerequisites: ['spirit-enemy-1'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  {
    id: 'spirit-enemy-3',
    name: 'Духопротивный 3',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
    prerequisites: ['spirit-enemy-2'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  {
    id: 'light-step',
    name: 'Light Step ',
    description: 'След твоих заклинаний содержит меньше ауры',
    // В астральном следе заклинаний обладателя абилки остается только 60% ауры. То есть Коэффициент Отчетливости Астральных Следов у него равен 0.6
    prerequisites: [],
    modifier: modifierFromEffect(increaseAuraMarkMultiplier, { amount: -0.4 }),
  },
  {
    id: 'bathory-charger',
    name: 'Bathory Charger',
    description:
      'Использование металюдей для увеличения Мощи и снижения Отката заклинаний на некоторое время. Чем больше жертв использовано, тем больше эффект',
    // Позволяет просканировать во время каста qr-коды мясных тел в состоянии тяжран (не годятся здоров/КС/АС) для эффекта "кровавый ритуал":  Использование (сканирование) N этих кодов приводит к:
    //  1) временному (на T минут) появлению пассивной абилки "Магия в крови", дающей бонус к максимально доступной Мощи в размере √N
    // 2) временному (на T минут) появлению пассивной способности "Кровавый Прилив", добавляющей в КоэффициентСопротивленияОткату множитель K=1/(6+N).
    // T = N*5 минут.
    // Жертва теряет 1ед Эссенса и переходит в КС и в этом состоянии для повторного использования в другом таком же ритуале непригодна.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'dictator-control',
    name: 'Dictator Control',
    description: 'При чтении астральных следов извлекается больше ауры',
    // Обладатель абилки при анализе следов заклинаний (заклинания Trackpoint, Trackball, Know each other, Panopticon, Tweet-tweet little bird), извлекает значение ауры на 20% больше. Например, если заклинание было скастовано с такой Мощью, что должно было извлечь 10 символов, то с этой абилкой будет извлечено 12. То есть Коэффициент чтения астральных следов у этого мага равен 1.2.
    prerequisites: [],
    modifier: modifierFromEffect(increaseAuraReadingMultiplier, {
      amount: 0.2,
    }),
  },
  {
    id: 'agnus-dei',
    name: 'Agnus dei ',
    description: 'В ритуальном хоре твой голос неоценим.',
    // - Когда qr-код обладателя такой способности сканируют во время ритуала, он считается за 3х человек.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'ritual-magic',
    name: 'Ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи',
    // Разблокирует возможность сканить во время каста заклинания qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "ритуал": N разных сосканированных за время действия заклинания qr-кодов увеличивают магу выбранную для этого заклинания Мощь на √N, округленное вверх.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'orthodox-ritual-magic',
    name: 'Православная ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи и снижения Отката',
    // Разблокирует возможность сканить во время каста qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "православный ритуал": N уникальных сосканированных за время действия заклинания qr-кодов для этого заклинания:
    // 1) добавляют √N (округленное вверх) к выбранной магом Мощи
    // 2) включают в КоэффициентСниженияОтката множитель 1/(2+N)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'more-chemo-to-sell-1',
    name: 'апгрейд аптеки 1',
    description: 'Ассортимент твоей аптеки расширился.',
    // TODO(https://trello.com/c/W8G2ZocH/109-описать-подробнее-механику-апгрейдов-аптеки): Implement and add modifier here
    // более лучшая химота в продаже
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'more-chemo-to-sell-2',
    name: 'апгрейд аптеки 2',
    description: 'Ассортимент твоей аптеки расширился ещё больше.',
    // TODO(https://trello.com/c/W8G2ZocH/109-описать-подробнее-механику-апгрейдов-аптеки): Implement and add modifier here
    // Аптека умеет юзать прототипы (с лимитом на штуки)
    prerequisites: ['more-chemo-to-sell-1'],
    modifier: [],
  },
  {
    id: 'mobile-auto-doc-1',
    name: 'Мобильный автодок',
    description: 'Ты можешь использовать мобильный автодок.',
    // TODO(https://trello.com/c/XDq4EE9R/327-реализовать-мобильный-автодок): Implement and add modifier here
    // Допуск: мобильный автодок
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'mobile-auto-doc-2',
    name: 'апгрейд мобильного автодока 1',
    description: 'Ты можешь лечить тяжёлое  ранение мобильный автодоком.',
    // TODO(https://trello.com/c/XDq4EE9R/327-реализовать-мобильный-автодок): Implement and add modifier here
    // находясь в альтернативном теле "медикарт" игрок получает активную абилку "Полевое лечение тяжрана". Кулдаун абилки 60 минут
    prerequisites: ['mobile-auto-doc-1'],
    modifier: [],
  },
  {
    id: 'mobile-auto-doc-3',
    name: 'апгрейд мобильного автодока 2',
    description: 'Ты можешь лечить тяжёлое ранение мобильный автодоком чаще.',
    // TODO(https://trello.com/c/XDq4EE9R/327-реализовать-мобильный-автодок): Implement and add modifier here
    // находясь в альтернативном теле "медикарт" игрок получает три  активных абилки "полевое  лечение тяжрана". Кулдаун абилки 60 минут
    prerequisites: ['mobile-auto-doc-2'],
    modifier: [],
  },
  {
    id: 'arch-rigger-negative-1',
    name: 'Проблемы риггера - 1',
    description: 'У тебя проблемы, ригга.',
    // TODO(https://trello.com/c/D3K8TZPl/351-реализовать-архетипы) Enable prerequisite when it's implemented
    // Intelligence -1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 })],
  },
  {
    id: 'arch-rigger-negative-2',
    name: 'Проблемы риггера - 2',
    description: 'У тебя серьезные проблемы, ригга.',
    // Intelligence -1
    // Body -1
    //
    prerequisites: ['arch-rigger-negative-1'],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 }), modifierFromEffect(increaseBody, { amount: -1 })],
  },
  {
    id: 'arch-rigger-negative-3',
    name: 'Проблемы риггера - 3',
    description: 'У тебя очень серьезные проблемы, ригга.',
    // Intelligence -2
    // Body-2
    // DroneFeedback3 = 1
    prerequisites: ['arch-rigger-negative-2'],
    modifier: [
      modifierFromEffect(increaseIntelligence, { amount: -2 }),
      modifierFromEffect(increaseBody, { amount: -2 }),
      modifierFromEffect(increaseDroneFeedback, { amount: 1 }),
    ],
  },
  {
    id: 'medicraft-1',
    name: 'Медицинские дроны 1',
    description: 'Улучшает управление медикартом.',
    // drones.medicraftBonus +2
    // drones.maxTimeInside +20
    // drones.recoveryTime -20
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 2 }),
    ],
  },
  {
    id: 'medicraft-2',
    name: 'Медицинские дроны 2',
    description: 'Улучшает управление сложными медикартами.',
    // drones.medicraftBonus +4
    // drones.maxTimeInside +10
    // drones.recoveryTime -10
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 4 }),
    ],
  },
  {
    id: 'medicraft-3',
    name: 'Медицинские дроны 3',
    description: 'Улучшает управление самыми сложными медикартами.',
    // drones.medicraftBonus +4
    // drones.maxTimeInside +10
    // drones.recoveryTime -10
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 4 }),
    ],
  },
  {
    id: 'auto-doc-neuro',
    name: 'нейрохирургия\n',
    description: 'Ты можешь использовать автодок для работы с биовэром',
    // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
    // биовэр. Сложность установки 5
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantDifficultyBonus, { amount: 2 }), modifierFromEffect(allowBiowareInstallation, {})],
  },
  {
    id: 'implant-1',
    name: 'Биоинженерия 1',
    description: 'Ты можешь ставить простые импланты.',
    // rigging.implantsBonus+2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsBonus, { amount: 2 })],
  },
  {
    id: 'implant-2',
    name: 'Биоинженерия 2',
    description: 'Ты можешь ставить сложные импланты.',
    // rigging.implantsBonus+2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsBonus, { amount: 2 })],
  },
  {
    id: 'implant-3',
    name: 'Биоинженерия 3',
    description: 'Ты можешь ставить самые сложные импланты, включая биовэр.',
    // rigging.implantsBonus+4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseImplantsBonus, { amount: 4 })],
  },
  {
    id: 'tuning-1',
    name: 'Тюнинг 1',
    description: 'Ты можешь ставить простые моды.',
    // rigging.tuningBonus +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 2 })],
  },
  {
    id: 'tuning-2',
    name: 'Тюнинг 2',
    description: 'Ты можешь ставить сложные моды.',
    // rigging.tuningBonus +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 2 })],
  },
  {
    id: 'tuning-3',
    name: 'Тюнинг 3',
    description: 'Ты можешь ставить самые сложные моды.',
    // rigging.tuningBonus +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 4 })],
  },
  {
    id: 'repoman-1',
    name: 'Было ваше - стало наше 1',
    description: 'Ты можешь снимать простые импланты \\ моды.',
    // rigging.repomanBonus +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  {
    id: 'repoman-2',
    name: 'Было ваше - стало наше 2',
    description: 'Ты можешь снимать сложные импланты \\ моды.',
    // rigging.repomanBonus +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  {
    id: 'repoman-3',
    name: 'Было ваше - стало наше 3',
    description: 'Ты можешь снимать самые сложные импланты \\ моды. ',
    // rigging.repomanBonus +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  {
    id: 'aircraft-1',
    name: 'Воздушные дроны 1',
    description: 'Улучшает управление воздушными дронами.',
    // drones.aircraftBonus =  +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 2 })],
  },
  {
    id: 'aircraft-2',
    name: 'Воздушные дроны 2',
    description: 'Улучшает управление сложными воздушными дронами.',
    // drones.aircraftBonus = +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  {
    id: 'aircraft-3',
    name: 'Воздушные дроны 3',
    description: 'Улучшает управление самыми сложными воздушными дронами.',
    // drones.aircraftBonus = +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  {
    id: 'groundcraft-1',
    name: 'Наземные дроны-1',
    description: 'Улучшает управление наземными дронами.',
    // drones.groundcraftBonus = +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 2 })],
  },
  {
    id: 'groundcraft-2',
    name: 'Наземные дроны-2',
    description: 'Улучшает управление сложными наземными дронами.',
    // drones.groundcraftBonus = +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  {
    id: 'groundcraft-3',
    name: 'Наземные дроны-3',
    description: 'Улучшает управление самыми сложными наземными дронами.',
    // drones.groundcraftBonus = +4
    prerequisites: [],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  {
    id: 'drone-sync-1',
    name: 'Синхронизация 1',
    description: 'Увеличивает время в дроне и сокращает перерыв между включениями.',
    // drones.maxTimeInside  +10
    // drones.recoveryTime= -10
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
    ],
  },
  {
    id: 'drone-sync-2',
    name: 'Синхронизация 2',
    description: 'Сильнее увеличивает время в дроне и сокращает перерыв между включениями.',
    // drones.maxTimeInside +20
    // drones.recoveryTime -20
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  {
    id: 'drone-sync-3',
    name: 'Синхронизация 3',
    description: 'Намного сильнее увеличивает время пребывания в дроне и сокращает перерыв между включениями.',
    // drones.maxTimeInside  +20
    // drones.recoveryTime-20
    prerequisites: [],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  {
    id: 'mental-resistance',
    name: 'резист менталке',
    description: 'Немного повышает защиту от ментальных воздействий.',
    // Повышает защиту от ментальных заклинаний
    // Модификатор: МентальнаяЗащита +3
    prerequisites: [],
    modifier: modifierFromEffect(increaseMentalProtection, { amount: 3 }),
  },
  {
    id: 'chemo-resistance',
    name: 'сопротивляемость химоте',
    description: 'Дает устойчивость к негативным эффектам при употреблении препаратов.',
    // повышает порог кризисной ситуации при употреблении химоты
    // Модификатор: ХимотаКризис +10
    prerequisites: [],
    modifier: modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 10 }),
  },
  {
    id: 'thats-my-chrome',
    name: 'это мой хром!',
    description: 'Импланты, установленные у тебя сложнее вырезать рипоменам.',
    // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Implement corresponding mechanic
    // Отбивает с шансом 50% попытку вырезать у тебя имплант.
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'faster-regen-1',
    name: 'Здоровеньки булы 1',
    description: 'Ты восстанавливаешь все хиты за 45 минут',
    // Ускоряет респавн хитов после легкого ранения (45 минут все хиты)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'faster-regen-2',
    name: 'Здоровеньки булы 2',
    description: 'Ты восстанавливаешь все хиты за 30 минут',
    // Ускоряет респавн хитов после легкого ранения (30 минут все хиты)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'grenades-usage',
    name: 'гранаты',
    description: 'разрешает использовать гранаты',
    // разрешает игроку использовать гранаты
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-dozer',
    name: 'Дрон Бульдозер',
    description: 'Щит. Тяжелая броня.',
    // Описание способностей дрона Бульдозер
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-turret',
    name: 'Дрон Турель',
    description: 'Пушка. Легкая броня.',
    // Описание способностей дрона Турель
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-ekzo',
    name: 'Дрон Экзоскелет',
    description: 'Пулемет. Тяжелая броня.',
    // Описание способностей дрона Экзоскелет
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-copter',
    name: 'Дрон Коптер',
    description: 'Видеокамера. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    // Описание способностей дрона Коптер
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-project',
    name: 'Дрон Коптер-Проектор',
    description: 'Проектор голограмм. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    // Описание способностей дрона Коптер-Проектор
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-kabuum',
    name: 'Дрон Коптер-Камикадзе',
    description: 'Бадабум! Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    // Описание способностей дрона Коптер-Камикадзе
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-heli',
    name: 'Дрон Вертолет',
    description: 'Может перевозить 3 персонажей. Легкая броня. Иммунитет к холодному оружию.',
    // Описание способностей дрона Вертолет
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'drone-medcart',
    name: 'Дрон Медкарт',
    description: 'Медикарт. Легкая броня.',
    // Описание способностей дрона Медкарт
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'comcon-ethic-ability',
    name: 'Вы достигли!',
    description: 'Приходите на наш воскресный семинар по приложению и выиграйте футболку в лотерее!',
    prerequisites: [],
    modifier: [],
  },
  // Abilities given temporarily by other abilities
  {
    id: 'arrowgant-effect',
    name: 'Arrowgant',
    description: 'Защита от дистанционных атак (только от нерфов).',
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'trollton-effect',
    name: 'Trollton',
    description: 'У вас тяжелая броня.',
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'stone-skin-effect',
    name: 'Каменная кожа ',
    description: 'С тебя снимаются хиты, как если бы ты находился в легкой броне.',
    prerequisites: [],
    modifier: [],
  },
  {
    // TODO(aeremin): Merge with automatic-weapons-chemo
    id: 'automatic-weapons-unlock',
    name: 'Автоматическое оружие',
    description: 'Позволяет использовать автоматическое оружие (даже без кибер-рук).',
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'hammer-of-justice-effect',
    name: 'Hammer of Justice',
    description: 'Одноручное оружие считается тяжёлым.',
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'cloud-memory-temporary',
    name: 'Облачная память',
    description: 'Вы не забываете события произошедшие с вами непосредственно перед КС',
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'astro-boy',
    name: 'Астробой',
    description: 'В астральной боёвке 2 меча и 1 щит',
    // Абилка ничего не делает, просто показывает текст "Астрал: 2 меча, 1 щит"
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'astro-fighter',
    name: 'Астробоевик',
    description: 'В астральной боёвке 4 меча и 3 щита',
    // Абилка ничего не делает, просто показывает текст "Астрал: 4 меча, 3 щита"
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'astro-boogie',
    name: 'Астробугай',
    description: 'В астральной боёвке 6 мечей и 5 щитов',
    // Абилка ничего не делает, просто показывает текст "Астрал: 6 мечей, 5 щитов"
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'kudesnik',
    name: 'Кудесник',
    description: 'Ты очень хорошо сопротивляешься Откату',
    // КоэффициентСопротивленияОткату умножается на 0.5
    prerequisites: [],
    modifier: [modifierFromEffect(multiplyMagicFeedbackMultiplier, { amount: 0.5 })],
  },
  {
    id: 'magic-shield',
    name: 'Magic Shield',
    description: 'Доступен "магический щит" (прозрачный зонтик, защищает от любого легкого оружия). Не требует активации',
    // Абилка ничего не делает, просто показывает текст "магический щит, защищает от атак лёгким оружием - холодным и дистанционным"
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'pencil',
    name: 'PENCIL',
    description: 'Одно оружие в руках считается тяжёлым',
    // Абилка ничего не делает, просто показывает текст "какое-то одно оружие в руках считается тяжелым" (необходима его маркировка красной лентой)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'stone-skin-result',
    name: 'Stone skin',
    description: 'Имеющаяся броня считается тяжёлой',
    // Абилка ничего не делает, просто показывает текст "броня считается тяжелым" (необходима её маркировка красной лентой)
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'auto-doc-1',
    name: 'хирургия',
    description: 'Ты можешь использовать автодок.И ставить простые импланты',
    // TODO(aeremin): Implement and add modifier here
    // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
    //  хром и лечить тяжран. Сложность установки 1
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'auto-doc-2',
    name: 'хирургия',
    description: 'Ты можешь использовать автодок. И ставить продвинутые импланты',
    // TODO(aeremin): Implement and add modifier here
    // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
    //  хром и лечить тяжран. Сложность установки 2
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'auto-doc-3',
    name: 'хирургия',
    description: 'Ты можешь использовать автодок. И ставить высокотехнологичные импланты',
    // TODO(aeremin): Implement and add modifier here
    // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
    //  хром и лечить тяжран сложность установки 3
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'in-drone',
    name: 'Статус: Подключен к дрону',
    description: 'Статус: Подключен к дрону',
    // формальная абилка, которая показывает, что риггер подключен к дрону. Вроде бы не нужна, но на нее наверное можно навесить всякие нужные параметры, циферки и что-то еще что надо будет показывать.
    // Кроме того, это обязательный пререквизит для всех дроновских абилок
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-norm',
    name: 'Норм',
    description: 'Ты норм. Самый обычный Sapiens, как и миллионы других.',
    // feel-matrix
    // chem-weak
    // base-body-meat
    // current-body-meat
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-elf',
    name: 'Эльф',
    description: 'Ты эльф. У тебя прекрасные ушки, чувство стиля и ты точно знаешь, что ты лучше всех остальных видов металюдей.',
    // elven-prices
    // base-body-meat
    // current-body-meat
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-dwarf',
    name: 'Гном',
    description:
      'Ты гном. У тебя есть борода, чувство гордости и ты считаешь большинство остальных металюдей - длинномерками. Кстати, я уже говорил про бороду? ',
    // chem-resist
    // magic-feedback-resist
    // matrix-feedback-resist
    // good-rigga
    // dont-touch-my-hole
    // base-body-meat
    // current-body-meat
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-ork',
    name: 'Орк',
    description: 'Ты орк. У тебя восхитительные клыки и крепкие кулаки.',
    // extra-hp
    // spirit-feed
    // base-body-meat
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-troll',
    name: 'Тролль',
    description: 'Ты тролль. У тебя есть клыки, рога, толстая шкура и возможность смотреть на остальных металюдей сверху вниз. ',
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
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-ghoul',
    name: 'HMHVV, тип 3. Гуль',
    description: 'Ты пережил заражение HMHVV вирусом типа 3 и стал Гулем. Ты ешь мясо металюдей. Вкусно, как курочка!',
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
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-vampire',
    name: 'HMHVV, тип 1. Вампир',
    description:
      'Ты пережил заражение HMHVV вирусом типа 1. Ты уверен, что ты теперь сверх-мета-человек. Иногда хочется кушать и тебе нужны другие металюди - в качестве обеда. ',
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
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-ai',
    name: 'Проекция ИИ',
    description: 'Ты часть проекции Искусственного Интеллекта. Твое тело сгусток программ и кода, живущий в Матрице. ',
    // magic-blockade
    // base-body-digital
    // current-body-digital
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-eghost',
    name: 'Электронный призрак',
    description: 'Ты цифровой разум. Твое тело сгусток программ и кода, живущий в Матрице. ',
    // magic-blockade
    // base-body-digital
    // current-body-digital
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'meta-spirit',
    name: 'Дух',
    description: 'Ты магическое создание, живущее в астральном мире.',
    // TODO(aeremin): Implement and add modifier here
    // tech-blockade
    // base-body-astral
    // current-body-astral
    // can-do-fleshpoint
    // can-be-exorcized
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'arch-rigger',
    name: 'Архетип: Риггер',
    description: 'Риггер, повелитель дронов, химии и хрома.',
    // Body +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  {
    id: 'arch-rigger-medic',
    name: 'Аспект: Риггер Медик',
    description: 'Медик. Ты знаешь всё про химию и полевую медицину.',
    // Intelligence +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  {
    id: 'arch-rigger-engineer',
    name: 'Аспект: Риггер Инженер',
    description: 'Инженер. Ставишь импланты, моды, снимаешь моды. ',
    // Intelligence +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  {
    id: 'arch-rigger-pilot',
    name: 'Аспект: Риггер Пилот',
    description: 'Пилот. Умеешь управлять дронами.',
    // Body +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  {
    id: 'arch-rigger-boost',
    name: 'Опытный Риггер',
    description: 'Очень опытный риггер.',
    // Body  +2
    // Intelligence +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseIntelligence, { amount: 2 })],
  },
  {
    id: 'arch-samurai',
    name: 'Архетип: Самурай',
    description: 'Самурай. Практикуешь искусство Воина и враги трепещут при звуках твоего имени.',
    // Body +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  {
    id: 'arch-samurai-gunner',
    name: 'Аспект: Самурай Стрелок',
    description: 'Стрелок. Огнестрельное оружие - твой путь.',
    // Strength +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseStrength, { amount: 1 })],
  },
  {
    id: 'arch-samurai-fighter',
    name: 'Аспект: Самурай Громила',
    description: 'Громила. Холодное оружие и несокрушимая броня - твой путь.',
    // Body +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  {
    id: 'arch-samurai-assasin',
    name: 'Аспект: Самурай Ассасин',
    description: 'Ассасин. Уловки и хитрости - твой путь.',
    // Intelligence +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  {
    id: 'arch-samurai-boost',
    name: 'Опытный Самурай',
    description: 'Очень опытный самурай.',
    // Body  +2
    // Strength +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseStrength, { amount: 2 })],
  },
  {
    id: 'arch-hackerman',
    name: 'Архетип: Хакер',
    description: 'Хакер, владыка Матрицы!',
    // Intelligence +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  {
    id: 'arch-hackerman-decker',
    name: 'Аспект: Хакер Декер',
    description: 'Чаммер, ты смог! ты постиг премудрости работы с кибердекой и научился использовать gUmMMy протокол!',
    // Intelligence +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  {
    id: 'arch-hackerman-technomancer',
    name: 'Аспект: Хакер Техномант',
    description: 'Чаммер, ты смог! Ты теперь чувствуешь Матрицу. Обычные люди на такое не способны',
    //
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'arch-hackerman-cyberadept',
    name: 'Аспект: Техномант Киберадепт',
    description: 'Техномант боец. ',
    // resonance +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  {
    id: 'arch-hackerman-technoshaman',
    name: 'Аспект: Техномант Техношаман',
    description: 'Техномант, специалист по Комплексным формам.',
    // resonance +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  {
    id: 'arch-hackerman-decker-boost',
    name: 'Опытный Декер',
    description: 'Очень опытный хакер декер.',
    // Intelligence +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 2 })],
  },
  {
    id: 'arch-hackerman-technomancer-boost',
    name: 'Опытный Техномант',
    description: 'Очень опытный хакер техномант.',
    // resonance +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseResonance, { amount: 2 })],
  },
  {
    id: 'arch-mage',
    name: 'Архетип: Маг',
    description: 'Маг, повелитель заклинаний!',
    // magic  +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  {
    id: 'arch-mage-adeptus',
    name: 'Аспект: Маг Адепт',
    description: 'Маг адепт. Твои способности выходят за грань доступного метачеловеку, но заклинания ограничены.',
    // Body +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  {
    id: 'arch-mage-spellcaster',
    name: 'Аспект: Маг Заклинатель',
    description: 'Маг заклинатель. Снимаю, порчу, колдую.',
    // magic  +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  {
    id: 'arch-mage-summoner',
    name: 'Аспект: Маг Призыватель',
    description: 'Маг призыватель. Духи и зачарования.',
    // magic  +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  {
    id: 'arch-mage-boost',
    name: 'Опытный Маг',
    description: 'Очень опытный маг.',
    // Magic +2
    // body +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMagic, { amount: 2 }), modifierFromEffect(increaseBody, { amount: 2 })],
  },
  {
    id: 'arch-face',
    name: 'Архетип: Фейс',
    description: 'Фейс, эксперт по переговорам.',
    // charisma +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
  },
  {
    id: 'arch-face-mentalist',
    name: 'Аспект: Фейс Менталист',
    description: 'Менталист. Очень, очень убедителен. И это не просто так.',
    // charisma +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  {
    id: 'arch-face-discursmonger',
    name: 'Аспект: Фейс Дискурсмонгер',
    description: 'Дискурсмонгер. Идеи, концепции и убеждения, твоя работа.',
    // charisma +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  {
    id: 'arch-face-geshaftmacher',
    name: 'Аспект: Фейс Гешефтмахер',
    description: 'Гешефтмахер. Контракты и нюйены интересуют тебя.',
    // charisma +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  {
    id: 'arch-face-boost',
    name: 'Опытный Фейс',
    description: 'Очень опытный фейс',
    // charisma +2
    prerequisites: [],
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
  },
  {
    id: 'arch-ai',
    name: 'Архетип: Искусственный интеллект',
    description: 'Искусственный интеллект. ',
    // depth +1
    prerequisites: [],
    modifier: [modifierFromEffect(increaseDepth, { amount: 1 })],
  },
  {
    id: 'arch-ai-matrix',
    name: 'Аспект: ИИ Матрица',
    description: 'ИИ, специализирующийся на работе с Матрицей',
    // depth +1
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
