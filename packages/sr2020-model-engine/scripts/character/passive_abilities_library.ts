import { modifierFromEffect } from './util';
import {
  allowBiowareInstallation,
  decreaseChemoSensitivity,
  increaseAdminHostNumber,
  increaseAircraftBonus,
  increaseAuraMarkMultiplier,
  increaseAuraReadingMultiplier,
  increaseAutodocBonus,
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
  increaseImplantsBonus,
  increaseImplantsSlots,
  increaseIntelligence,
  increaseMagic,
  increaseMaxEctoplasmHp,
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
  setImplantsRemovalResistance,
  setTransactionAnonymous,
  unlockAutodockImplantInstall,
  unlockAutodockImplantRemoval,
  unlockAutodockScreen,
} from './basic_effects';
import { PassiveAbility } from '@alice/sr2020-common/models/common_definitions';
import { setAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
// Not exported by design, use getAllPassiveAbilities() instead.
const kAllPassiveAbilitiesList: PassiveAbility[] = [
  // hacking.fadingResistance +1
  // hacking.enterCooldownReduced 15
  {
    id: 'feel-matrix',
    humanReadableName: 'Чувствительность к Матрице',
    description: 'Ты чувствуешь матрицу. Устойчивость к фейдингу техноманта, у декера уменьшается время между входами на хоcт.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-norm', level: 1 },
    modifier: [modifierFromEffect(increaseFadingResistance, { amount: 1 })],
  },
  // chemo.baseEffectThreshold -40
  // chemo.uberEffectThreshold -30
  // chemo.superEffectThreshold -20
  // chemo.crysisThreshold -60
  {
    id: 'chem-weak',
    humanReadableName: 'Чувствительность к препаратам',
    description: 'Для воздействия препарата достаточно уменьшенной дозы. Аккуратно!',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-norm', level: 1 },
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
    humanReadableName: 'Прекрасные цены',
    description: 'Ваш скоринг прекрасен, эльфийское долголетие всегда в цене! Особая скидка на все покупки!',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-elf', level: 1 },
    modifier: [],
  },
  // chemo.crysisThreshold +40
  {
    id: 'chem-resist',
    humanReadableName: 'Устойчивость к препаратам.',
    description: 'Сложнее получить передозировку препарата.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-dwarf', level: 1 },
    modifier: [modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 40 })],
  },
  // magicStats.feedbackMultiplier *0.9
  {
    id: 'magic-feedback-resist',
    humanReadableName: 'Устойчивость к Откату магов',
    description: 'Понижает Откат магов',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-dwarf', level: 1 },
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // hacking.fadingResistance +1
  // hacking.biofeedbackResistance +1
  {
    id: 'matrix-feedback-resist',
    humanReadableName: 'Устойчивость к Матрице',
    description: 'Снижает фейдинг техномантов и улучшает устойчивость к биофидбеку у декеров.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-dwarf', level: 1 },
    modifier: [
      modifierFromEffect(increaseFadingResistance, { amount: 1 }),
      modifierFromEffect(increaseBiofeedbackResistance, { amount: 1 }),
    ],
  },
  // drones.droneFeedback -1
  {
    id: 'good-rigga',
    humanReadableName: 'Устойчивость при подключению к дронам.',
    description: 'Снижает урон при выходе из поврежденного дрона.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-dwarf', level: 1 },
    modifier: [modifierFromEffect(increaseDroneFeedback, { amount: -1 })],
  },
  // у обычных метарасов 6 слотов.
  // у гномов 5 (-1 слот в Теле)
  {
    id: 'dont-touch-my-hole',
    humanReadableName: 'Коротышка',
    description: 'Неотчуждаемый слот для бороды!',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-dwarf', level: 1 },
    modifier: [modifierFromEffect(increaseImplantsSlots, { amount: -1 })],
  },
  // maxHp +1
  {
    id: 'extra-hp',
    humanReadableName: 'Плюс хит',
    description: 'У тебя дополнительный хит в мясном теле. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ork', level: 1 },
    modifier: [modifierFromEffect(increaseMaxMeatHp, { amount: 1 })],
  },
  // magicStats.spiritResistanceMultiplier *0.8
  {
    id: 'spirit-feed',
    humanReadableName: 'Знакомец духов',
    description: 'Снижает Сопротивление духов этому магу.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ork', level: 1 },
    modifier: [modifierFromEffect(multiplySpiritResistanceMultiplier, { amount: 0.8 })],
  },
  //
  {
    id: 'orkish-prices',
    humanReadableName: 'Так себе цены.',
    description: 'Ваш скоринг очень плох, жизнь орка коротка. Ваши покупки будут дороже, чем у других метарас.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ork', level: 1 },
    modifier: [],
  },
  //
  {
    id: 'skin-armor',
    humanReadableName: 'Кожный панцирь',
    description: 'Твоя шкура крепкая как броня. Тяжелое оружие бьет тебя по хитам.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-troll', level: 1 },
    modifier: [],
  },
  // у обычных метарасов 6 слотов.
  // у троллей 7 (+7 слот в Теле)
  {
    id: 'this-my-glory-hole',
    humanReadableName: 'Верзила',
    description: 'У троллей есть дополнительный слот для имплантов',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-troll', level: 1 },
    modifier: [modifierFromEffect(increaseImplantsSlots, { amount: 1 })],
  },
  //
  {
    id: 'strong-arm',
    humanReadableName: 'БиоСила',
    description: 'Биологическая сила! Можно использовать оружие, требующее одной киберруки.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-troll', level: 1 },
    modifier: [],
  },
  // Обычный персонаж "ест" раз в цикл (в 6 часов), тролли едят каждые 3 часа.
  {
    id: 'feed-tamagochi',
    humanReadableName: 'Голодный как тролль!',
    description: 'Надо чаще питаться. Большому телу - нужен большой сойбургер!',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-troll', level: 1 },
    modifier: [],
  },
  //
  {
    id: 'trollish-prices',
    humanReadableName: 'Ужасные цены.',
    description: 'Ваш скоринг очень плох, жизнь тролля очень коротка. Ваши покупки будут заметно дороже, чем у других метарас.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-troll', level: 1 },
    modifier: [],
  },
  // Эссенс персонажа уменьшается на 0,2 каждый час
  // Essense_Loss
  //  itGapEssense = увеличивается 20 каждый час
  {
    id: 'meat-hunger',
    humanReadableName: 'Голод гулей',
    description: 'Твой эссенс уменьшается  на 0,2 каждый час',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['meta-ghoul'],
    pack: { id: 'gen-meta-ghoul', level: 1 },
    modifier: [],
  },
  // Эссенс персонажа уменьшается на 1 каждый час
  //  itGapEssense = увеличивается 100 каждый час
  {
    id: 'blood-thirst',
    humanReadableName: 'Жажда вампиров',
    description: 'Твой эссенс уменьшается на 1 каждый час',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['meta-vampire'],
    pack: { id: 'gen-meta-vampire', level: 1 },
    modifier: [],
  },
  // Если itEssense <1, то у персонажа блокируется активация всех активных абилок кроме абилок ghoul-feast и vampire-feast. Проверка проводится при каждом пересчете itEssense.
  {
    id: 'starvation',
    humanReadableName: 'Алчность',
    description: 'При Эссенс персонажа <1 ты не можешь активировать абилки ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ghoul', level: 1 },
    modifier: [],
  },
  // chemo.baseEffectThreshold +30
  // chemo.uberEffectThreshold +80
  // chemo.superEffectThreshold +80
  // chemo.crysisThreshold +40
  {
    id: 'chem-resist-heavy',
    humanReadableName: 'Резистивность к препаратам.',
    description: 'Для правильного воздействия препарата нужны увеличенные дозы. Аккуратно!',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ghoul', level: 1 },
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
    humanReadableName: 'Астральное зрение',
    description: 'Ты можешь видеть существ, находящихся в Астрале (красный дождевик) и говорить с ними.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ghoul', level: 1 },
    modifier: [],
  },
  // в типах имплантах есть разделение, надо посмотреть как оно там сделано
  {
    id: 'chrome-blockade',
    humanReadableName: 'Отторжение хрома',
    description: 'Ты не можешь использовать кибернетические импланты. Биотех - можно.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ghoul', level: 1 },
    modifier: [],
  },
  // вписано в требования архетипов
  {
    id: 'tech-blockade',
    humanReadableName: 'Отторжение дронов и Резонанса',
    description: 'Ты не можешь изучать навыки Риггера Пилота и Хакера Техноманта ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ghoul', level: 1 },
    modifier: [],
  },
  // вписано в требования архетипов
  {
    id: 'magic-blockade',
    humanReadableName: 'Отторжение Магии',
    description: 'Ты не можешь изучать навыки Мага и не можешь быть целью Магии.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['meta-digital'],
    pack: { id: 'gen-meta-AI', level: 1 },
    modifier: [],
  },
  //
  {
    id: 'spirit-attuned',
    humanReadableName: 'Сильный призыватель духов',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'orkish-ethics',
    humanReadableName: 'Твердость кодекса',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // `
  {
    id: 'trollish-ethics',
    humanReadableName: '',
    description:
      'Если тролль покидает свою дискурс-группу - он переживает ужасный излом идентичности. Вырази это максимально понятным для окружающих способом, желательно с причинением тяжких телесных повреждений.  ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'elven-ethics',
    humanReadableName: 'Гибкость кодекса',
    description: 'Этическая особенность Эльфов',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании. Выдаем какую-то прикольную сюжетную инфу
  {
    id: 'incriminating-evidence',
    humanReadableName: 'Собрать компромат',
    description:
      'Напиши большую статью об интересующем тебя человеке или организации. Добейся, чтобы эта статья вошла в топ-20 понравившихся материалов. Получи от МГ компромат на этого человека или организацию. Степень подробности информации зависит от положения статьи в рейтинге топ-20. Вы не можете собирать компромат в течении 12 часов после получения прошлых итогов компромата.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'always-online',
    humanReadableName: 'Всегда на связи',
    description:
      'Чтобы с вами ни происходило, в каком бы вы ни были состоянии, как бы вас ни заколдовали, если вы живы - вы можете пользоваться телеграммом для передачи игровых сообщений. В мире игре этого не видно, по вам нельзя понять, что вы что-то пишете, отнять телефон и так далее.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'last-report',
    humanReadableName: 'Это мой последний репортаж',
    description:
      'Если вас каким-либо образом все-таки убили, вы можете написать сообщение с описанием подробностей вашей смерти, как все это происходило, что вы об этом думаете, оставить последние пожелания для подписчиков и опубликовать это в вашем телеграмм-канале. Вы можете описывать что происходило с вашим телом и вокруг него. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'ask-anon',
    humanReadableName: 'Спроси анонимуса',
    description:
      'Раз в 12 часов вы можете получить ответ от мастеров на любой вопрос, подразумевающий ответ "да или нет" или подробный ответ на вопрос, касающийся бэка игры и событий, произошедших в мире игры до ее начала. Кто-то из ваших читателей скинул вам эту инфу в личку. Данную информацию нельзя использовать как доказательства в суде - ведь остальные могут сомневаться в том, что анонимус знает все. Но вы не сомневаетесь в этом. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'bloggers-support',
    humanReadableName: 'Поддержка блоггеров',
    description:
      'Раз в 12 часов вы можете назвать мастерам некую личность или организацию и защитить ее от использования способности "собрать компромат" на 12 часов.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // для проект-менеджера  с 1 слотом
  // У игрока просто отображается текст пассивной абилки
  {
    id: 'project-manager-1',
    humanReadableName: 'ты - проект-менеджер1',
    description: 'сертификат проект-менеджера. может вести не более 1 проекта одновременно',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // для проект-менеджера с 3 слотами
  // У игрока просто отображается текст пассивной абилки
  {
    id: 'project-manager-3',
    humanReadableName: 'ты - проект-менеджер3',
    description: 'сертификат проект-менеджера. может вести до 3 проектов одновременно',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Захват цели в линк лок
  {
    id: 'link-lock',
    humanReadableName: 'linklock',
    description: 'новая команда linklock [target]\nхакер, захваченный в линклок не может перемещаться некоторое время',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'fencer-1'],
    pack: { id: 'hack-deck-fencer', level: 1 },
    modifier: [],
  },
  // Автоматический захват цели в линклок при появлении
  {
    id: 'auto-link-lock',
    humanReadableName: 'autolinklock',
    description:
      'новая команда: autolock [target]\nона автоматически попытается захватить в линклок цель (то есть без ручного ввода команды)',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'link-lock'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // Позволяет реактивировать вырубленный IC
  {
    id: 'reactivate',
    humanReadableName: 'reactivate',
    description: 'новая команда: reactivate <target>\nвключает назад вырубленный Лед',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'breacher-2'],
    pack: { id: 'hack-deck-breacher', level: 2 },
    modifier: [],
  },
  // Позволяет пережить одну атаку черного льда
  {
    id: 'huge-lucker',
    humanReadableName: 'Конский лак ',
    description: 'Говорят, ты родился в рубашке. Возможно, ожнажды эта "рубашка" спасет тебе жизнь',
    availability: 'closed',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    modifier: [],
  },
  // Еще 3 хоста, на защиту которых ты можешь подписаться
  {
    id: 'admin',
    humanReadableName: 'Админ',
    description: 'Еще 3 хоста, на защиту которых ты можешь подписаться',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-1'],
    pack: { id: 'hack-deck-guru', level: 2 },
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 3 }),
  },
  // Разобрался со всеми примудростями квантовой компрессии. Позволяет экономить 10% памяти кибердеки при записи софта в деку
  {
    id: 'compressor',
    humanReadableName: 'Компрессор',
    description: 'Значительно экономит память деки, позволяя размесить в ней больше софта',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-1'],
    pack: { id: 'hack-deck-guru', level: 1 },
    modifier: [],
  },
  // Увеличивает возможное количество бэкдоров
  {
    id: 'squid',
    humanReadableName: 'Сквид',
    description: 'Увеличивает возможное количество бэкдоров',
    availability: 'closed',
    karmaCost: 40,
    prerequisites: ['arch-hackerman-decker'],
    modifier: modifierFromEffect(increaseBackdoors, { amount: 3 }),
  },
  // Бэкдоры дохнут медленнее
  // [Время_жизни_бэкдоров] +20
  {
    id: 'last-droplet',
    humanReadableName: 'Ну еще капельку',
    description: 'Бэкдоры живут медленнее. Твои бекдоры живут на 20 минут больше',
    availability: 'closed',
    karmaCost: 40,
    prerequisites: ['arch-hackerman-decker'],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 20 }),
  },
  {
    id: 'very-last-droplet',
    humanReadableName: 'Выжать до капли',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 40 }),
  },
  // Увеличение длительности пребывания в виаре - для Техномантов. Покупается за карму.
  // maxTimeInVr+20 минут
  {
    id: 'longer-vr-stays-1',
    humanReadableName: 'Мужчина, продлевать будете? ',
    description: 'Ты можешь находиться в VR на 20 минут дольше',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 60 }),
  },
  // Увеличение длительности пребывания в виаре - для жителей Виара и Основания. Мастерская, дается силой рельсы
  // maxTimeInVr+300 минут
  {
    id: 'longer-vr-stays-2',
    humanReadableName: 'Мужчина, продлевать будете?  v2',
    description: 'Ты можешь находиться в VR на 300 минут дольше',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 120 }),
  },
  // Абилка егостов и ИИ. Мастерская, дается силой рельсы.
  {
    id: 'unlimited-vr-stays',
    humanReadableName: 'Виар. А я вообще тут живу.',
    description: 'Ты можешь вообще не покидать VR',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 9000 }),
  },
  // Резонанс +1
  {
    id: 'resonance-1',
    humanReadableName: 'Резонанс -1',
    description: 'Резонанс вырос на единицу',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-2',
    humanReadableName: 'Резонанс -2',
    description: 'Резонанс вырос на единицу',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['resonance-1'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-3',
    humanReadableName: 'Резонанс -3',
    description: 'Резонанс вырос на единицу',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['resonance-2'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-4',
    humanReadableName: 'Резонанс -4',
    description: 'Резонанс вырос на единицу',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['resonance-3'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-5',
    humanReadableName: 'Резонанс -5',
    description: 'Резонанс вырос на единицу',
    availability: 'open',
    karmaCost: 16,
    prerequisites: ['resonance-4'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  {
    id: 'additional-sprite',
    humanReadableName: 'Намертво!',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseSpriteCount, { amount: 1 }),
  },
  {
    id: 'additional-query',
    humanReadableName: 'Чтец',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseControlRequests, { amount: 1 }),
  },
  {
    id: 'synchronized',
    humanReadableName: 'Синхронизатор',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
  {
    id: 'longer-party-vr-stays-1',
    humanReadableName: 'Бой часов раздастся вскоре 1',
    description: 'Не нравится мне название :(',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
  {
    id: 'longer-party-vr-stays-2',
    humanReadableName: 'Бой часов раздастся вскоре 2',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // TODO(https://trello.com/c/J6ufYQBm/99-формализовать-абилки-добавляет-время-пребывания-в-основании-партии): Implement
  {
    id: 'longer-party-vr-stays-3',
    humanReadableName: 'Бой часов раздастся вскоре 3',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // борьба с чужим софтом (если повезет - то и со спрайтами)
  //
  // IT: команда в Кривда-матрице
  {
    id: 'scan',
    humanReadableName: 'scan',
    description: 'новая команда: scan\nСканирует ноду и выводит список обнаруженных в ней агентов\nУспешность определяется по Sleaze',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'sly-1'],
    pack: { id: 'hack-deck-sly', level: 1 },
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
    humanReadableName: 'deploy',
    description: 'новая команда: deploy\nУстанавливает агента (софт) в Ноду Хоста\n--name:<имя>\nУспешность определяется по Sleaze',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'sly-1'],
    pack: { id: 'hack-deck-sly', level: 1 },
    modifier: [],
  },
  // очистка хоста от чужой дряни / пользы
  //
  // IT: команда в Кривда-матрице
  {
    id: 'uninstall',
    humanReadableName: 'uninstall',
    description: 'новая команда: uninstall\nУдаляет агента с Ноды\nУспешность определяется по Sleaze',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'sly-2'],
    pack: { id: 'hack-deck-sly', level: 2 },
    modifier: [],
  },
  // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
  //
  // IT: Команда в Кривда-Матрице, основного IT нет
  {
    id: 'feelmatrix',
    humanReadableName: 'feelmatrix',
    description:
      'новая команда:feelmatrix\nТы теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\nАктивируется перед входом в на Хост\nВыдает список хостов, на которых есть другие декеры и примерный уровень группы. Чем сильнее твой Sleaze, тем больше таких хостов ты найдешь',
    availability: 'closed',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    modifier: [],
  },
  // ЭТИКА
  // мини-корова декеров, закрытая этикой
  //
  // IT: команда в кривда-матрице
  // 15 (датапроцессинг) - написать правильную формулу
  {
    id: 'bypass',
    humanReadableName: 'bypass',
    description:
      'новая команда: bypass\nГениально! Этот IC просто не заметил тебя!\nПозволяет проходить мимо IC.\nУспешность определяется по Sleaze',
    availability: 'closed',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'sly-2'],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'hop',
    humanReadableName: 'hop',
    description:
      'новая команда: hop\nМгновенное перемещение по временному трейлу в ноду, в которой установлен якорный агент (backdoor, anchor...) с известным тебе именем (то есть значением ключа --name команды deploy)',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'sly-2'],
    pack: { id: 'hack-deck-sly', level: 2 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'getdump',
    humanReadableName: 'getdump',
    description: 'новая команда: getdump\nкоманда применяется в бою с IC. Позволяет получить фрагмент дампа IC для CVE анализа',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'breacher-1'],
    pack: { id: 'hack-deck-breacher', level: 1 },
    modifier: [],
  },
  // IT: буду запрашивать сам факт наличия фичи
  {
    id: 'vulnerabilities-sniffer',
    humanReadableName: 'Нюх на уязвимости',
    description: 'Позволяет получить дополнительные фрагменты дампов, в зависимости от значения Attack',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'breacher-2'],
    pack: { id: 'hack-deck-breacher', level: 3 },
    modifier: [],
  },
  // IT:
  // [+5] Декер_макс_время_на_хосте
  {
    id: 'stubbornness-1',
    humanReadableName: 'Выдающаяся упертость',
    description: 'Продлевает максимальное время нахождения на хосте на 5 минут',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'hack-deck-guru', level: 1 },
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 5 }),
  },
  // IT:
  // [+10] Декер_макс_время_на_хосте
  {
    id: 'stubbornness-2',
    humanReadableName: 'Удивительная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на10 минут',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-1'],
    pack: { id: 'hack-deck-guru', level: 2 },
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },
  // IT:
  // [+10] Декер_макс_время_на_хосте
  {
    id: 'stubbornness-3',
    humanReadableName: 'Легендарная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 10 минут',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-2'],
    pack: { id: 'hack-deck-guru', level: 3 },
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'persistent-deploy',
    humanReadableName: 'Persistent deploy',
    description:
      'новый ключ:install --persistent\nПозволяет применять ключ --persistant команды deploy\nключ позволяет агенту переживать обновлие хоста',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'sly-1', 'deploy'],
    pack: { id: 'hack-deck-sly', level: 1 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'shadow-deploy',
    humanReadableName: 'Shadow deploy',
    description:
      'новый ключ:install --shadow\nПозволяет применять ключ --shadow команды deploy\nключ затрудняет обнаружение агента (зависит от значения Sleaze ищущего)',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'sly-2', 'deploy'],
    pack: { id: 'hack-deck-sly', level: 2 },
    modifier: [],
  },
  // IT:
  // [+5] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-1',
    humanReadableName: 'Шустрый',
    description: 'Снижает время входа на хост на 2 минуты',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'fencer-1'],
    pack: { id: 'hack-deck-fencer', level: 1 },
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 5 }),
  },
  // IT:
  // [+10] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-2',
    humanReadableName: 'Очень шустрый',
    description: 'Снижает время входа на хост на еще на 2 минуты',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'quick-to-enter-1', 'fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },
  // IT:
  // [+10] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-3',
    humanReadableName: 'Супер шустрый',
    description: '.. и еще снижает время входа на хост на 1 минуту',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'quick-to-enter-2', 'fencer-3'],
    pack: { id: 'hack-deck-fencer', level: 3 },
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'flee',
    humanReadableName: 'flee',
    description:
      'новая команда:flee\nПозволяет попытаться сбежать из линклока. \nЗависит от соотношения значений  вашего Sleaze и Attack цели',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'sly-2'],
    pack: { id: 'hack-deck-sly', level: 2 },
    modifier: [],
  },
  // Абилка конверсии Intellect в Firewall
  // IT:
  // [+2] Декер_конверсия_Firewall
  {
    id: 'breacher-1',
    humanReadableName: 'Хороший Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'hack-deck-breacher', level: 1 },
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Firewall
  {
    id: 'breacher-2',
    humanReadableName: 'Отличный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'breacher-1'],
    pack: { id: 'hack-deck-breacher', level: 2 },
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Firewall
  {
    id: 'breacher-3',
    humanReadableName: 'Легендарный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'breacher-2'],
    pack: { id: 'hack-deck-breacher', level: 3 },
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 2 }),
  },
  // Абилка конверсии Intellect в Attack
  // IT:
  // [+2] Декер_конверсия_Attack
  {
    id: 'fencer-1',
    humanReadableName: 'Хороший Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'hack-deck-fencer', level: 1 },
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Attack
  {
    id: 'fencer-2',
    humanReadableName: 'Отличный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'fencer-1'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Attack
  {
    id: 'fencer-3',
    humanReadableName: 'Легендарный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 3 },
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 2 }),
  },
  // Абилка конверсии Intellect в Sleaze
  // IT:
  // [+2] Декер_конверсия_Sleaze
  {
    id: 'sly-1',
    humanReadableName: 'Хороший Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'hack-deck-sly', level: 1 },
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Sleaze
  {
    id: 'sly-2',
    humanReadableName: 'Отличный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'sly-1'],
    pack: { id: 'hack-deck-sly', level: 2 },
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Sleaze
  {
    id: 'sly-3',
    humanReadableName: 'Легендарный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'sly-2'],
    pack: { id: 'hack-deck-sly', level: 3 },
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 2 }),
  },
  // Абилка конверсии Intellect в Dataprocessing
  // IT:
  // [+2] Декер_конверсия_Dataprocessing
  {
    id: 'miner-1',
    humanReadableName: 'Хороший Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'hack-deck-miner', level: 1 },
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 2 }),
  },
  // IT:
  // [+2] Декер_конверсия_Dataprocessing
  {
    id: 'miner-2',
    humanReadableName: 'Отличный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'miner-1'],
    pack: { id: 'hack-deck-miner', level: 2 },
    modifier: modifierFromEffect(increaseConversionDataprocessing, {
      amount: 2,
    }),
  },
  // IT:
  // [+2] Декер_конверсия_Dataprocessing
  {
    id: 'miner-3',
    humanReadableName: 'Легендарный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'miner-2'],
    pack: { id: 'hack-deck-miner', level: 3 },
    modifier: modifierFromEffect(increaseConversionDataprocessing, {
      amount: 2,
    }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'burn',
    humanReadableName: 'burn',
    description:
      'новая команда: burn\nПозволяет наносить урон кибердеке противника, повреждать ее моды\nУрон зависит от соотношения значений вашей Attack и Firewall цели',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['fencer-2', 'master-of-the-universe'],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'arpscan',
    humanReadableName: 'arpscan',
    description:
      'новая команда:arpscan\nВыводит список всех Персон, находящихся на хосте\n\nВысокие значения Sleaze или специальные спосбности могут обмануть эту команду',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-2'],
    pack: { id: 'hack-deck-guru', level: 2 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'steal',
    humanReadableName: 'steal',
    description:
      'новая команда: steal\nНаходясь на ноде PAN хоста с определенным API, позволяет осуществить перевод автоматически определяемой суммы денег\nСумма зависит от значенияй ваших характеристик Sleaze и Dataprocessing',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'miner-1'],
    pack: { id: 'hack-deck-miner', level: 2 },
    modifier: [],
  },
  // IT: ключ команды в кривда-матрице
  {
    id: 'steal-pro',
    humanReadableName: 'Фрод профи',
    description:
      'Новый ключ: steal --enterprize:\nработа с кошельками юр лиц\nНовый ключ: steal --comment\nпозволяет ввести текст "основания перевода", вместо билиберды по умолчанию\nувеличивает сумму кражи',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-hackerman-decker', 'steal'],
    pack: { id: 'hack-deck-miner', level: 2 },
    modifier: [],
  },
  // IT: ключ команды в кривда-матрице
  {
    id: 'steal-expert',
    humanReadableName: 'Фрод эксперт',
    description: 'Новый ключ: steal --SIN:\n--SIN: переводит сумму на другой SIN\nдополнительно увеличивает сумму кражи',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-hackerman-decker', 'steal-pro'],
    pack: { id: 'hack-deck-miner', level: 3 },
    modifier: [],
  },
  // IT:
  // [+5] Хакер_число_админ_хостов
  {
    id: 'quarter-god',
    humanReadableName: 'Четвертак',
    description:
      'Русское название для слэнга "qouterGOD", шутливое название для серьезных людей: профессиональных контракторов по частной защиты Хостов.\nЕще 5 хостов, на защиту которых ты можешь подписаться',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-2'],
    pack: { id: 'hack-deck-guru', level: 3 },
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 5 }),
  },
  {
    id: 'deep-compile',
    humanReadableName: 'Глубокая компиляция',
    description: 'Тебе проще компилировать спрайты',
    availability: 'open',
    karmaCost: 8,
    prerequisites: [],
    modifier: modifierFromEffect(increaseCompilationFadingResistance, {
      amount: 20,
    }),
  },
  {
    id: 'native-compile',
    humanReadableName: 'Нативная компиляция',
    description: 'Тебе намного проще компилировать спрайты',
    availability: 'open',
    karmaCost: 8,
    prerequisites: [],
    modifier: modifierFromEffect(increaseCompilationFadingResistance, {
      amount: 30,
    }),
  },
  {
    id: 'sprites-1',
    humanReadableName: 'Спрайты-1',
    description: 'Ты можешь компилировать спрайты 1 уровня',
    availability: 'open',
    karmaCost: 8,
    prerequisites: [],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  {
    id: 'sprites-2',
    humanReadableName: 'Спрайты-2',
    description: 'Ты можешь компилировать спрайты 2 уровня',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['sprites-1'],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  {
    id: 'sprites-3',
    humanReadableName: 'Спрайты-3',
    description: 'Ты можешь компилировать спрайты 3 уровня',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['sprites-2'],
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста на +1
  {
    id: 'increase-the-charisma-1',
    humanReadableName: 'Увеличение харизмы 1',
    description: 'Перманентное увеличение Харизмы персонажа - 1',
    availability: 'closed',
    karmaCost: 80,
    prerequisites: ['arch-face'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста на +1
  {
    id: 'increase-the-charisma-2',
    humanReadableName: 'Увеличение харизмы 2',
    description: 'Перманентное увеличение Харизмы персонажа - 2',
    availability: 'closed',
    karmaCost: 80,
    prerequisites: ['arch-face', 'increase-the-charisma-1'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста на +1
  {
    id: 'increase-the-charisma-3',
    humanReadableName: 'Увеличение харизмы 3',
    description: 'Перманентное увеличение Харизмы персонажа - 3',
    availability: 'closed',
    karmaCost: 100,
    prerequisites: ['arch-face', 'increase-the-charisma-2'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста на +1
  {
    id: 'increase-the-charisma-4',
    humanReadableName: 'Увеличение харизмы 4',
    description: 'Перманентное увеличение Харизмы персонажа - 4',
    availability: 'closed',
    karmaCost: 100,
    prerequisites: ['arch-face', 'increase-the-charisma-3'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // Увеличивает Харизму персонажа менталиста на +1
  {
    id: 'increase-the-charisma-5',
    humanReadableName: 'Увеличение харизмы 5',
    description: 'Перманентное увеличение Харизмы персонажа - 5',
    availability: 'closed',
    karmaCost: 100,
    prerequisites: ['arch-face', 'increase-the-charisma-4'],
    modifier: modifierFromEffect(increaseCharisma, { amount: 1 }),
  },
  // при прохождении данжа ГМ выносит из данжа + 10% от базовой стоимости лута
  // Покажи игротеху абилку - получи больше лута на 10%
  {
    id: 'look-its-shekel',
    humanReadableName: 'Опа, шекель!',
    description: 'При получении лута после прохождения данжа покажи данную абилку игротеху. Ты получаешь +10% от лута твоей команды.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-face'],
    modifier: [],
  },
  // У гм на экране экономики отображаются  его текущие множители скоринга.
  {
    id: 'my-scoring',
    humanReadableName: 'Мой скоринг',
    description: 'отображается  текущий коэф. скоринга данного персонажа с множителями.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-face'],
    modifier: [],
  },
  // После списания рентных платежей гм получает кэшбек в размере 2% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-1',
    humanReadableName: 'Игра на бирже 1',
    description: 'ты получаешь кэшбэк 2% от всех своих рентных платежей.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-face'],
    modifier: modifierFromEffect(increaseStockGainPercentage, { amount: 2 }),
  },
  // После списания рентных платежей гм получает кэшбек в размере 5% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-2',
    humanReadableName: 'Игра на бирже 2',
    description: 'ты получаешь кэшбэк 5% от всех своих рентных платежей.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-face', 'igra-na-birge-1'],
    modifier: modifierFromEffect(increaseStockGainPercentage, {
      amount: 5 - 2,
    }),
  },
  // После списания рентных платежей гм получает кэшбек в размере 13% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-3',
    humanReadableName: 'Игра на бирже 3',
    description: 'ты получаешь кэшбэк 13% от всех своих рентных платежей.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-face', 'igra-na-birge-2'],
    modifier: modifierFromEffect(increaseStockGainPercentage, {
      amount: 13 - 5,
    }),
  },
  // анонимизация перевода - не показываем это в логах никому кроме фиксера, его контрагента и мастеров
  {
    id: 'anonymous-transaction',
    humanReadableName: 'фиксер',
    description: 'гм производит анонимный перевод между двумя персонажами. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(setTransactionAnonymous, {}),
  },
  // Все кулдауны способностей дискурсмонгера снижены на 20%
  {
    id: 'dm-fanatic-1',
    humanReadableName: 'Фанатик-1',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 20%',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.8,
    }),
  },
  // Все кулдауны способностей дискурсмонгера снижены на 40%
  {
    id: 'dm-fanatic-2',
    humanReadableName: 'Фанатик-2',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 40%',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.6 / 0.8,
    }),
  },
  // Все кулдауны способностей дискурсмонгера снижены на 60%
  {
    id: 'dm-fanatic-3',
    humanReadableName: 'Фанатик-3',
    description: 'Все кулдауны способностей дискурсмонгера снижены на 60%',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: modifierFromEffect(multiplyDiscourseMongerCooldowns, {
      amount: 0.4 / 0.6,
    }),
  },
  // Абилка-сертификат, позволяющий просмотреть чужой этикпрофиль
  {
    id: 'dm-soul-expert',
    humanReadableName: 'Душевед',
    description: 'Предъявите экран с описанием способности игроку, чтобы тот показал вам свой этикпрофиль',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // Абилка-сертификат
  {
    id: 'churched',
    humanReadableName: 'Воцерковленный',
    description:
      'После исповеди или участия в богослужении вы можете нажать "Готово" на любом Поступке личной этики, не выполняя его требований',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Множитель 0,9 на стоимость товара при покупке любого товара  данным персонажем
  //
  {
    id: 'discount-all-1',
    humanReadableName: 'Скидосы - 10%',
    description: 'Скидки. Стоимость товара умножается на 0,9 при покупке любого товара ',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-face'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.9 }),
  },
  // Множитель 0,8 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-2',
    humanReadableName: 'Скидосы - 20%',
    description: 'Скидка. Стоимость товара умножается на 0,8 при покупке любого товара',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-face', 'discount-all-1'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.8 }),
  },
  // Множитель 0,7 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-3',
    humanReadableName: 'Скидосы - 30%',
    description: 'Скидки Стоимость товара умножается на 0,7 при покупке любого товара ',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-face', 'discount-all-2'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.7 }),
  },
  // Множитель 0,6 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-4',
    humanReadableName: 'Скидосы - 40%',
    description: 'Скидки Стоимость товара умножается на 0,6 при покупке любого товара ',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-face', 'discount-all-3', 'igra-na-birge-1'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.6 }),
  },
  // Множитель 0,5 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-5',
    humanReadableName: 'Скидосы - 50%',
    description: 'Скидки Стоимость товара умножается на 0,5 при покупке любого товара ',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-face', 'discount-all-4', 'igra-na-birge-2'],
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.5 }),
  },
  // множитель 0,9 при покупке товаров типа ХОЛОДНОЕ ОРУЖИЕ,
  // ДИСТАНЦИОННОЕ ОРУЖИЕ, БРОНЯ.
  {
    id: 'discount-samurai',
    humanReadableName: 'Скидка на броню и оружие',
    description: 'У тебя есть скидка 10% на покупку оружия и брони.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-samurai'],
    pack: { id: 'Samurai-pack', level: 1 },
    modifier: modifierFromEffect(multiplyDiscountWeaponsArmor, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation = Ares Macrotechnolgy
  {
    id: 'discount-ares',
    humanReadableName: 'Ares Macrotechnolgy скидка',
    description: 'скидка 10% на товары корпорации Ares Macrotechnolgy',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountAres, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Aztechnology (ORO)
  {
    id: 'discount-aztechnology',
    humanReadableName: 'Aztechnology (ORO) скидка',
    description: 'скидка 10% на товары корпорации Aztechnology (ORO)',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountAztechnology, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Saeder-Krupp
  {
    id: 'discount-saeder-krupp',
    humanReadableName: 'Saeder-Krupp скидка',
    description: 'скидка 10% на товары корпорации Saeder-Krupp',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountSaederKrupp, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =.Spinrad Global (JRJ INT)
  {
    id: 'discount-spinradglobal',
    humanReadableName: 'Spinrad Global (JRJ INT) скидка',
    description: 'скидка 10% на товары корпорации Spinrad Global (JRJ INT)',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountSpinradGlobal, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =NeoNet1 (TransLatviaSeledir)
  {
    id: 'discount-neonet1',
    humanReadableName: 'NeoNet1 (TransLatviaSeledir) скидка',
    description: 'скидка 10% на товары корпорации NeoNet1 (TransLatviaSeledir)',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountNeonet1, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =EVO
  {
    id: 'discount-evo',
    humanReadableName: 'EVO скидка',
    description: 'скидка 10% на товары корпорации EVO',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountEvo, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Horizon
  {
    id: 'discount-horizon',
    humanReadableName: 'Horizon скидка',
    description: 'скидка 10% на товары корпорации Horizon',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountHorizon, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Wuxing
  {
    id: 'discount-wuxing',
    humanReadableName: 'Wuxing скидка',
    description: 'скидка 10% на товары корпорации Wuxing',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountWuxing, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Россия
  {
    id: 'discount-russia',
    humanReadableName: 'Россия скидка',
    description: 'скидка 10% на товары корпорации Россия',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountRussia, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Renraku
  {
    id: 'discount-renraku',
    humanReadableName: 'Renraku скидка',
    description: 'скидка 10% на товары корпорации Renraku',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountRenraku, { amount: 0.9 }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Mutsuhama
  {
    id: 'discount-mutsuhama',
    humanReadableName: 'Mutsuhama скидка',
    description: 'скидка 10% на товары корпорации Mutsuhama',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountMutsuhama, {
      amount: 0.9,
    }),
  },
  // множитель 0,9 на  все товары с параметром Corporation =Shiavase
  {
    id: 'discount-shiavase',
    humanReadableName: 'Shiavase скидка',
    description: 'скидка 10% на товары корпорации Shiavase',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyCorpDiscountShiavase, { amount: 0.9 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-1',
    humanReadableName: 'Магия 1',
    description: 'Перманентно увеличивает характеристику Магия на 1',
    availability: 'master',
    karmaCost: 40,
    prerequisites: [],
    pack: { id: 'mage-conjur-combat', level: 2 },
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-2',
    humanReadableName: 'Магия 2',
    description: 'Перманентно увеличивает характеристику Магия на 1',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['magic-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-3',
    humanReadableName: 'Магия 3',
    description: 'Перманентно увеличивает характеристику Магия на 1',
    availability: 'master',
    karmaCost: 50,
    prerequisites: ['magic-2', 'spirit-enemy-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-4',
    humanReadableName: 'Магия 4',
    description: 'Перманентно увеличивает характеристику Магия на 1',
    availability: 'master',
    karmaCost: 70,
    prerequisites: ['magic-3', 'spirit-enemy-2'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-5',
    humanReadableName: 'Магия 5',
    description: 'Перманентно увеличивает характеристику Магия на 1',
    availability: 'master',
    karmaCost: 90,
    prerequisites: ['magic-4', 'spirit-enemy-3'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. То есть от базового получается 1*0.9=0.9)
  {
    id: 'magic-feedback-resistance-1',
    humanReadableName: 'Сопротивление Откату 1',
    description: 'Перманентно снижает Откат на 10%',
    availability: 'open',
    karmaCost: 40,
    prerequisites: [],
    pack: { id: 'mage-conjur-combat', level: 2 },
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимого СопрОткату1 коэффициентСопротивленияОткату = 1*0.9*0.9=0.81)
  {
    id: 'magic-feedback-resistance-2',
    humanReadableName: 'Сопротивление Откату 2',
    description: 'Перманентно снижает Откат на 10%',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-feedback-resistance-1'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимых СопрОткату1-2 коэффициентСопротивленияОткату = 1*0.9*0.9*0.9=0.729)
  {
    id: 'magic-feedback-resistance-3',
    humanReadableName: 'Сопротивление Откату 3',
    description: 'Перманентно снижает Откат на 10%',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-feedback-resistance-2'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. То есть от базового получается 1*1.2=1.2)
  {
    id: 'magic-feedback-unresistance-1',
    humanReadableName: 'Откатошный 1',
    description: 'Перманентно увеличивает Откат на 20%',
    availability: 'open',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимого Откатошный1 коэффициентСопротивленияОткату = 1*1.2*1.2=1.44)
  {
    id: 'magic-feedback-unresistance-2',
    humanReadableName: 'Откатошный 2',
    description: 'Перманентно увеличивает Откат на 20%',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимых Откатошный1-2 коэффициентСопротивленияОткату = 1*1.2*1.2*1.2=1.728)
  {
    id: 'magic-feedback-unresistance-3',
    humanReadableName: 'Откатошный 3',
    description: 'Перманентно увеличивает Откат на 20%',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['magic-feedback-unresistance-2'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. То есть от базового 1 КоэффициентВосстановленияМагии станет 1*1.2=1.2
  {
    id: 'magic-recovery-1',
    humanReadableName: 'Воспрянь и пой 1',
    description: 'Перманентно ускоряет восстановление Магии на 20%.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: [],
    pack: { id: 'mage-conjur-simpatic', level: 2 },
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже был взят Воспрянь и пой 1, то КоэффициентВосстановленияМагии станет 1*1.2*1.2=1.44
  {
    id: 'magic-recovery-2',
    humanReadableName: 'Воспрянь и пой 2',
    description: 'Перманентно ускоряет восстановление Магии на 20%.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-recovery-1'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже были Воспрянь и пой 1-2, КоэффициентВосстановленияМагии станет 1*1.2*1.2*1.2=1.728
  {
    id: 'magic-recovery-3',
    humanReadableName: 'Воспрянь и пой 3',
    description: 'Перманентно ускоряет восстановление Магии на 20%.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-recovery-2'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-1',
    humanReadableName: 'Дружелюбие духов 1',
    description: 'Перманентно уменьшает Сопротивление духов',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['master-of-the-universe'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-2',
    humanReadableName: 'Дружелюбие духов 2',
    description: 'Перманентно уменьшает Сопротивление духов',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['spirit-friend-1', 'magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-3',
    humanReadableName: 'Дружелюбие духов 3',
    description: 'Перманентно уменьшает Сопротивление духов',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['spirit-friend-2'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
  {
    id: 'spirit-enemy-1',
    humanReadableName: 'Духопротивный 1',
    description: 'Перманентно увеличивает Сопротивление духов',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
  {
    id: 'spirit-enemy-2',
    humanReadableName: 'Духопротивный 2',
    description: 'Перманентно увеличивает Сопротивление духов',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['spirit-enemy-1'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
  {
    id: 'spirit-enemy-3',
    humanReadableName: 'Духопротивный 3',
    description: 'Перманентно увеличивает Сопротивление духов',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['spirit-enemy-2'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  // В астральном следе заклинаний обладателя абилки остается только 60% ауры. То есть Коэффициент Отчетливости Астральных Следов у него равен 0.6
  {
    id: 'light-step',
    humanReadableName: 'Light Step ',
    description: 'В астральном следе заклинаний обладателя абилки остается только 60% его ауры. ',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['master-of-the-universe'],
    pack: { id: 'mage-conjur-simpatic', level: 1 },
    modifier: modifierFromEffect(increaseAuraMarkMultiplier, { amount: -0.4 }),
  },
  // Позволяет просканировать во время каста qr-коды мясных тел в состоянии тяжран (не годятся здоров/КС/АС) и с Эссенсом>=1ед для эффекта "кровавый ритуал":  Использование (сканирование) N этих кодов приводит к:
  //  1) временному (на T минут) появлению пассивной абилки "Магия в крови" (amount = √N)
  // 2) временному (на T минут) появлению пассивной способности "Кровавый Прилив" (amount = N),
  // T = N*5 минут.
  // Жертва теряет 1ед Эссенса и переходит в КС и в этом состоянии для повторного использования в другом таком же ритуале непригодна.
  {
    id: 'bathory-charger',
    humanReadableName: 'Bathory Charger',
    description:
      'Можно использовать людей в тяжране (сканируя их QR) для увеличения (по времени, а не на один каст) доступной Мощи и снижения Отката',
    availability: 'closed',
    karmaCost: 70,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // Обладатель абилки при анализе следов заклинаний (заклинания Trackpoint, Trackball, Know each other, Panopticon, Tweet-tweet little bird), извлекает значение ауры на 20% больше. Например, если заклинание было скастовано с такой Мощью, что должно было извлечь 10 символов, то с этой абилкой будет извлечено 12. То есть Коэффициент чтения астральных следов у этого мага равен 1.2.
  {
    id: 'dictator-control',
    humanReadableName: 'Dictator Control',
    description: 'При чтении астральных следов ты извлекаешь на 20% больше ауры',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['master-of-the-universe'],
    pack: { id: 'mage-summon-astralog', level: 1 },
    modifier: modifierFromEffect(increaseAuraReadingMultiplier, {
      amount: 0.2,
    }),
  },
  // - Когда qr-код обладателя такой способности сканируют во время ритуала, он считается за 3х человек.
  {
    id: 'agnus-dei',
    humanReadableName: 'Agnus dei ',
    description: 'В ритуальных практиках ты считаешься за 3х человек',
    availability: 'open',
    karmaCost: 90,
    prerequisites: ['master-of-the-universe'],
    pack: { id: 'mage-adept-healer', level: 1 },
    modifier: [],
  },
  // Разблокирует возможность сканить во время каста заклинания qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "ритуал": N разных сосканированных за время действия заклинания qr-кодов увеличивают магу выбранную для этого заклинания Мощь на √N, округленное вверх.
  {
    id: 'ritual-magic',
    humanReadableName: 'Ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи',
    availability: 'closed',
    karmaCost: 80,
    prerequisites: ['master-of-the-universe'],
    pack: { id: 'mage-conjur-simpatic', level: 3 },
    modifier: [],
  },
  // Разблокирует возможность сканить во время каста qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "православный ритуал": N уникальных сосканированных за время действия заклинания qr-кодов для этого заклинания:
  // 1) добавляют √N (округленное вверх) к выбранной магом Мощи
  // 2) включают в КоэффициентСниженияОтката множитель 1/(2+N)
  {
    id: 'orthodox-ritual-magic',
    humanReadableName: 'Православная ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи и снижения Отката',
    availability: 'closed',
    karmaCost: 80,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // Intelligence -1
  {
    id: 'arch-rigger-negative-1',
    humanReadableName: 'Проблемы риггера - 1',
    description: 'У тебя проблемы, ригга. (штраф на Интеллект)',
    availability: 'open',
    karmaCost: -20,
    prerequisites: ['arch-rigger'],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 })],
  },
  // Body -1
  {
    id: 'arch-rigger-negative-2',
    humanReadableName: 'Проблемы риггера - 2',
    description: 'У тебя серьезные проблемы, ригга. (штраф на Телосложение)',
    availability: 'open',
    karmaCost: -30,
    prerequisites: ['arch-rigger-negative-1'],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 }), modifierFromEffect(increaseBody, { amount: -1 })],
  },
  // Intelligence -1
  // Body-1
  // DroneFeedback3 = 1
  {
    id: 'arch-rigger-negative-3',
    humanReadableName: 'Проблемы риггера - 3',
    description: 'У тебя очень серьезные проблемы, ригга. (дополнительный штраф на Интеллект, Телосложение, и урон при выходе из дрона)',
    availability: 'open',
    karmaCost: -40,
    prerequisites: ['arch-rigger-negative-2'],
    modifier: [
      modifierFromEffect(increaseIntelligence, { amount: -2 }),
      modifierFromEffect(increaseBody, { amount: -2 }),
      modifierFromEffect(increaseDroneFeedback, { amount: 1 }),
    ],
  },
  // drones.medicraftBonus +2
  {
    id: 'medicraft-1',
    humanReadableName: 'Медицинские дроны 1',
    description: 'Улучшает способность по управлению медикартом.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 2 }),
    ],
  },
  // drones.medicraftBonus +4
  {
    id: 'medicraft-2',
    humanReadableName: 'Медицинские дроны 2',
    description: 'Сильнее улучшает способность по управлению медикартами.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-rigger', 'medicraft-1'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 4 }),
    ],
  },
  // drones.medicraftBonus +8
  // drones.aircraftBonus = +2
  // drones.groundcraftBonus = +2
  // drones.autodocBonus +2
  {
    id: 'medicraft-3',
    humanReadableName: 'Медицинские дроны 3',
    description: 'Максимально улучшает способность по управлению медикартами. Немного улучшает навык для всех остальных типов дронов.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-rigger', 'medicraft-2'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseAircraftBonus, { amount: 4 }),
      modifierFromEffect(increaseAutodocBonus, { amount: 2 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 8 }),
    ],
  },
  // rigging.implantsBonus +4
  // drones.autodocBonus +4
  // rigging.canWorkWithBioware true
  {
    id: 'auto-doc-neuro',
    humanReadableName: 'Нейрохирургия',
    description: 'Ты можешь использовать автодок для установки биоимплантов.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger', 'auto-doc-3'],
    modifier: [
      modifierFromEffect(increaseAutodocBonus, { amount: 4 }),
      modifierFromEffect(increaseImplantsBonus, { amount: 4 }),
      modifierFromEffect(allowBiowareInstallation, {}),
    ],
  },
  // rigging.repomanBonus +4
  {
    id: 'repoman-1',
    humanReadableName: 'Было ваше - стало наше 1',
    description: 'Увеличивает сложность имплантов, который ты можешь снять. ',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-rigger', 'repoman-active'],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +4
  {
    id: 'repoman-2',
    humanReadableName: 'Было ваше - стало наше 2',
    description: 'Сильнее увеличивает сложность имплантов, который ты можешь снять. ',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'repoman-1'],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +2
  {
    id: 'repoman-3',
    humanReadableName: 'Было ваше - стало наше 3',
    description: 'Максимально увеличивает сложность имплантов, который ты можешь снять. ',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'repoman-2'],
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 2 })],
  },
  // drones.aircraftBonus =  +2
  {
    id: 'aircraft-1',
    humanReadableName: 'Воздушные дроны 1',
    description: 'Улучшает способность по управлению воздушными дронами.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger'],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 2 })],
  },
  // drones.aircraftBonus = +4
  {
    id: 'aircraft-2',
    humanReadableName: 'Воздушные дроны 2',
    description: 'Сильнее улучшает способность по управлению воздушными дронами.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['aircraft-1', 'arch-rigger'],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  // drones.aircraftBonus = +4
  {
    id: 'aircraft-3',
    humanReadableName: 'Воздушные дроны 3',
    description: 'Максимально улучшает способность по управлению воздушными дронами.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['aircraft-2', 'arch-rigger'],
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  // drones.groundcraftBonus = +2
  {
    id: 'groundcraft-1',
    humanReadableName: 'Наземные дроны-1',
    description: 'Улучшает способность по управлению наземными дронами.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger'],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 2 })],
  },
  // drones.groundcraftBonus = +4
  {
    id: 'groundcraft-2',
    humanReadableName: 'Наземные дроны-2',
    description: 'Сильнее улучшает способность по управлению наземными дронами.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['groundcraft-1', 'arch-rigger'],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  // drones.groundcraftBonus = +4
  {
    id: 'groundcraft-3',
    humanReadableName: 'Наземные дроны-3',
    description: 'Максимально улучшает способность по управлению наземными дронами.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['groundcraft-2', 'arch-rigger'],
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  // drones.maxTimeInside  +20
  // drones.recoveryTime= -20
  {
    id: 'drone-sync-1',
    humanReadableName: 'Синхронизация 1',
    description: 'Увеличивает время в дроне и сокращает перерыв между включениями.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  // drones.maxTimeInside +10
  // drones.recoveryTime -10
  {
    id: 'drone-sync-2',
    humanReadableName: 'Синхронизация 2',
    description: 'Сильнее увеличивает время в дроне и сокращает перерыв между включениями.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['drone-sync-1', 'arch-rigger'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
    ],
  },
  // drones.maxTimeInside  +10
  // drones.recoveryTime-10
  {
    id: 'drone-sync-3',
    humanReadableName: 'Синхронизация 3',
    description: 'Намного сильнее увеличивает время пребывания в дроне и сокращает перерыв между включениями.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['drone-sync-2', 'arch-rigger'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
    ],
  },
  // Повышает защиту от ментальных заклинаний
  // Модификатор: МентальнаяЗащита +3
  {
    id: 'mental-resistance',
    humanReadableName: 'Защита разума',
    description: 'Немного повышает защиту от ментальных воздействий.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-samurai', 'faster-regen-1'],
    modifier: modifierFromEffect(increaseMentalProtection, { amount: 3 }),
  },
  // повышает порог кризисной ситуации при употреблении химоты
  // Модификатор: ХимотаКризис порог +40
  {
    id: 'chemo-resistance',
    humanReadableName: 'Устойчивость к химии',
    description: 'Дает устойчивость к негативным эффектам при употреблении препаратов.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-samurai', 'faster-regen-1'],
    modifier: modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 40 }),
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'faster-regen-1',
    humanReadableName: 'Регенерация 1',
    description: 'Ты восстанавливаешь все хиты за 40 минут, если не находишься в тяжелом ранении',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-samurai'],
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'faster-regen-2',
    humanReadableName: 'Регенерация 2',
    description: 'Ты восстанавливаешь все хиты за 20 минут, если не находишься в тяжелом ранении',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-samurai', 'faster-regen-1'],
    modifier: [],
  },
  // Описание способностей дрона Бульдозер
  {
    id: 'drone-dozer',
    humanReadableName: 'Дрон Бульдозер',
    description: 'Щит. Тяжелая броня.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Турель
  {
    id: 'drone-turret',
    humanReadableName: 'Дрон Турель',
    description: 'Пушка.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Экзоскелет
  {
    id: 'drone-ekzo',
    humanReadableName: 'Дрон Экзоскелет',
    description: 'Пулемет. Тяжелая броня.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Коптер
  {
    id: 'drone-copter',
    humanReadableName: 'Дрон Коптер',
    description: 'Видеокамера. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Коптер-Проектор
  {
    id: 'drone-project',
    humanReadableName: 'Дрон Коптер-Проектор',
    description: 'Проектор голограмм. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Коптер-Камикадзе
  {
    id: 'drone-kabuum',
    humanReadableName: 'Дрон Коптер-Камикадзе',
    description:
      'Бадабум!  Иммунитет ко всему холодному оружию и легкому огнестрельному.\nПри активации необходимо громко озвучить словесный маркер "ВЗРЫВ".  Эффект = атака тяжелым оружием по всем персонажам в радиусе 2 метров от точки взрыва . (3 хита по персонажам без брони \\ 1 хит по персонажам в тяжелой броне). После взрыва активируй "аварийный выход", после возврата в тело - порви куар дрона.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Вертолет
  {
    id: 'drone-heli',
    humanReadableName: 'Дрон Вертолет',
    description: 'Может перевозить 3 персонажей. Иммунитет ко всему холодному оружию и легкому огнестрельному. Тяжелая броня.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Медкарт
  {
    id: 'drone-medcart',
    humanReadableName: 'Дрон Медкарт',
    description: 'Медикарт',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  //
  {
    id: 'comcon-ethic-ability',
    humanReadableName: 'Вы достигли!',
    description: 'Приходите на наш воскресный семинар по приложению и выиграйте футболку в лотерее!',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'arrowgant-effect',
    humanReadableName: 'Arrowgant',
    description: 'Защита от дистанционных атак (только от нерфов).',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'trollton-effect',
    humanReadableName: 'Trollton',
    description: 'У вас тяжёлая броня.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Эффект *-armor абилок
  {
    id: 'granite-skin-effect',
    humanReadableName: 'Гранитная кожа',
    description: 'С тебя снимаются хиты, как если бы ты находился в легкой броне.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Эффект *-shooter абилок и химоты
  {
    id: 'automatic-weapons-unlock',
    humanReadableName: 'Автоматическое оружие',
    description: 'Позволяет использовать автоматическое оружие (даже без кибер-рук).',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'hammer-of-justice-effect',
    humanReadableName: 'Hammer of Justice',
    description: 'Одноручное оружие считается тяжёлым.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'cloud-memory-temporary',
    humanReadableName: 'Облачная память',
    description: 'Вы не забываете события произошедшие с вами непосредственно перед КС',
    availability: 'closed',
    karmaCost: 80,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 4 меча, 3 щита"
  {
    id: 'astro-fighter',
    humanReadableName: 'Астробоевик',
    description: 'В астральной боёвке 4 меча и 3 щита',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['astro-boy-summ'],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 6 мечей, 5 щитов"
  {
    id: 'astro-boogie',
    humanReadableName: 'Астробугай',
    description: 'В астральной боёвке 6 мечей и 5 щитов',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['astro-fighter'],
    modifier: [],
  },
  // КоэффициентСопротивленияОткату умножается на 0.5
  {
    id: 'kudesnik',
    humanReadableName: 'Кудесник',
    description: 'Откат делится пополам',
    availability: 'closed',
    karmaCost: 20,
    prerequisites: ['master-of-the-universe'],
    modifier: [modifierFromEffect(multiplyMagicFeedbackMultiplier, { amount: 0.5 })],
  },
  // Абилка ничего не делает, просто показывает текст "магический щит, защищает от атак лёгким оружием - холодным и дистанционным"
  {
    id: 'magic-shield',
    humanReadableName: 'Magic Shield',
    description: 'Доступен "магический щит" (прозрачный зонтик, защищает от любого легкого оружия). Не требует активации',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "какое-то одно оружие в руках 5 минут считается тяжелым (необходима его маркировка красной лентой)"
  {
    id: 'pencil',
    humanReadableName: 'PENCIL',
    description: 'Одно оружие в руках считается тяжёлым',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Имеющаяся броня 5 минут считается тяжелым (необходима её маркировка красной лентой)"
  {
    id: 'stone-skin-result',
    humanReadableName: 'Stone skin',
    description: 'Имеющаяся броня считается тяжёлой',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // rigging.implantsBonus +2
  // drones.autodocBonus +2
  {
    id: 'auto-doc-1',
    humanReadableName: 'Хирургия 1',
    description: 'Улучшает способность по использованию автодока и повышает сложность имплантов которые ты можешь ставить.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-rigger', 'implant-install'],
    modifier: [modifierFromEffect(increaseAutodocBonus, { amount: 2 }), modifierFromEffect(increaseImplantsBonus, { amount: 2 })],
  },
  // rigging.implantsBonus +2
  // drones.autodocBonus +2
  {
    id: 'auto-doc-2',
    humanReadableName: 'Хирургия 2',
    description: 'Сильнее улучшает способность по использованию автодока и повышает сложность имплантов которые ты можешь ставить.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-rigger', 'auto-doc-1'],
    modifier: [modifierFromEffect(increaseAutodocBonus, { amount: 2 }), modifierFromEffect(increaseImplantsBonus, { amount: 2 })],
  },
  // rigging.implantsBonus +2
  // drones.autodocBonus +2
  {
    id: 'auto-doc-3',
    humanReadableName: 'Хирургия 3',
    description: 'Максимально улучшает способность по использованию автодока и повышает сложность имплантов которые ты можешь ставить.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-rigger', 'auto-doc-2'],
    modifier: [modifierFromEffect(increaseAutodocBonus, { amount: 2 }), modifierFromEffect(increaseImplantsBonus, { amount: 2 })],
  },
  // формальная абилка, которая показывает, что риггер подключен к дрону. Вроде бы не нужна, но на нее наверное можно навесить всякие нужные параметры, циферки и что-то еще что надо будет показывать.
  // Кроме того, это обязательный пререквизит для всех дроновских абилок
  {
    id: 'in-drone',
    humanReadableName: 'Статус: Подключен к дрону',
    description:
      'Статус: Подключен к дрону. Следите за временем, если вы слишком долго пробудете в дроне - произойдет аварийное отключение. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // feel-matrix
  // chem-weak
  {
    id: 'meta-norm',
    humanReadableName: 'Норм',
    description: 'Ты норм. Самый обычный Sapiens, как и миллионы других.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-norm', level: 1 },
    modifier: [],
  },
  // elven-prices
  {
    id: 'meta-elf',
    humanReadableName: 'Эльф',
    description: 'Ты эльф. У тебя прекрасные ушки, чувство стиля и ты точно знаешь, что ты лучше всех остальных видов металюдей.',
    availability: 'master',
    karmaCost: 20,
    prerequisites: [],
    pack: { id: 'gen-meta-elf', level: 1 },
    modifier: [],
  },
  // chem-resist
  // magic-feedback-resist
  // matrix-feedback-resist
  // good-rigga
  // dont-touch-my-hole
  {
    id: 'meta-dwarf',
    humanReadableName: 'Гном',
    description:
      'Ты гном. У тебя есть борода, чувство гордости и ты считаешь большинство остальных металюдей - длинномерками. Кстати, я уже говорил про бороду? ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-dwarf', level: 1 },
    modifier: [],
  },
  // extra-hp
  // spirit-feed
  {
    id: 'meta-ork',
    humanReadableName: 'Орк',
    description: 'Ты орк. У тебя восхитительные клыки и крепкие кулаки.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-ork', level: 1 },
    modifier: [],
  },
  // extra-hp
  // magic-feedback-resist
  // matrix-feedback-resist
  // good-rigga
  //
  // skin-armor
  // this-my-glory-hole
  // strong-arm
  // feed-tamagochi
  {
    id: 'meta-troll',
    humanReadableName: 'Тролль',
    description: 'Ты тролль. У тебя есть клыки, рога, толстая шкура и возможность смотреть на остальных металюдей сверху вниз. ',
    availability: 'master',
    karmaCost: 40,
    prerequisites: [],
    pack: { id: 'gen-meta-troll', level: 1 },
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
  {
    id: 'meta-ghoul',
    humanReadableName: 'HMHVV, тип 3. Гуль',
    description: 'Ты пережил заражение HMHVV вирусом типа 3 и стал Гулем. Ты ешь мясо металюдей. Вкусно, как курочка!',
    availability: 'master',
    karmaCost: 20,
    prerequisites: [],
    pack: { id: 'gen-meta-ghoul', level: 1 },
    modifier: [],
  },
  // strong-arm
  // starvation
  // chem-resist-heavy
  // chrome-blockade
  // tech-blockade
  //
  // blood-thirst
  // vampire-feast
  {
    id: 'meta-vampire',
    humanReadableName: 'HMHVV, тип 1. Вампир',
    description:
      'Ты пережил заражение HMHVV вирусом типа 1. Ты уверен, что ты теперь сверх-мета-человек. Иногда хочется кушать и тебе нужны другие металюди - в качестве обеда. ',
    availability: 'master',
    karmaCost: 20,
    prerequisites: [],
    pack: { id: 'gen-meta-vampire', level: 1 },
    modifier: [],
  },
  // magic-blockade
  {
    id: 'meta-ai',
    humanReadableName: 'Проекция ИИ',
    description: 'Ты часть проекции Искусственного Интеллекта, сгусток программ и кода, живущий в Матрице. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-AI', level: 1 },
    modifier: [],
  },
  // magic-blockade
  // digital-life
  // vr-protection
  {
    id: 'meta-eghost',
    humanReadableName: 'Электронный призрак',
    description: 'Ты цифровой разум, сгусток программ и кода, живущий в Матрице. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-eghost', level: 1 },
    modifier: [],
  },
  // tech-blockade
  // base-body-astral
  // current-body-astral
  // can-be-exorcized
  // fleshpoint
  {
    id: 'meta-spirit',
    humanReadableName: 'Дух',
    description: 'Ты магическое создание, живущее в астральном мире.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-spirit', level: 1 },
    modifier: [],
  },
  // Body +2
  // Intelligence +2
  // max.time.inside = 10
  {
    id: 'arch-rigger',
    humanReadableName: 'Архетип: Риггер',
    description: 'Риггер, повелитель дронов, хрома и химоты.',
    availability: 'open',
    karmaCost: 100,
    prerequisites: [],
    pack: { id: 'gen-arch-rigger', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // Body +1
  {
    id: 'arch-samurai',
    humanReadableName: 'Архетип: Самурай',
    description: 'Самурай. Практикуешь искусство Воина и враги трепещут при звуках твоего имени.',
    availability: 'open',
    karmaCost: 100,
    prerequisites: [],
    pack: { id: 'gen-arch-samurai', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // Body  +2
  // Strength +2
  {
    id: 'arch-samurai-boost',
    humanReadableName: 'Опытный Самурай',
    description: 'Очень опытный самурай.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-samurai'],
    pack: { id: 'gen-arch-samurai-boost', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseStrength, { amount: 2 })],
  },
  // Intelligence +1
  {
    id: 'arch-hackerman-decker',
    humanReadableName: 'Архетип Декер',
    description: 'Ты постиг премудрости работы с кибердекой и научился использовать gUmMMy протокол!',
    availability: 'open',
    karmaCost: 60,
    prerequisites: [],
    pack: { id: 'gen-arch-hackerman-decker', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // resonance +1
  {
    id: 'arch-hackerman-technomancer',
    humanReadableName: 'Архетип Техномант',
    description: 'Ты теперь чувствуешь Матрицу. Обычные люди на такое не способны.',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['!arch-mage', '!tech-blockade'],
    pack: { id: 'gen-arch-hackerman-technomancer', level: 1 },
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // Intelligence +2
  {
    id: 'arch-hackerman-decker-boost',
    humanReadableName: 'Опытный Декер',
    description: 'Очень опытный декер.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'gen-arch-hackerman-decker-boost', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 2 })],
  },
  // resonance +2
  {
    id: 'arch-hackerman-technomancer-boost',
    humanReadableName: 'Опытный Техномант',
    description: 'Очень опытный техномант.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer', 'master-of-the-universe'],
    pack: { id: 'gen-arch-technomancer-boost', level: 1 },
    modifier: [modifierFromEffect(increaseResonance, { amount: 2 })],
  },
  // magic  +1
  {
    id: 'arch-mage',
    humanReadableName: 'Архетип: Маг',
    description: 'Маг, повелитель заклинаний!',
    availability: 'open',
    karmaCost: 100,
    prerequisites: ['!arch-hackerman-technomancer', '!magic-blockade'],
    pack: { id: 'gen-arch-mage', level: 1 },
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Magic +2
  // body +2
  {
    id: 'arch-mage-boost',
    humanReadableName: 'Опытный Маг',
    description: 'Очень опытный маг.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    pack: { id: 'gen-arch-mage-boost', level: 1 },
    modifier: [modifierFromEffect(increaseMagic, { amount: 2 }), modifierFromEffect(increaseBody, { amount: 2 })],
  },
  // charisma +2
  {
    id: 'arch-face',
    humanReadableName: 'Архетип: Фейс',
    description: 'Фейс, эксперт по переговорам.',
    availability: 'open',
    karmaCost: 100,
    prerequisites: [],
    pack: { id: 'gen-arch-face', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
  },
  // charisma +2
  {
    id: 'arch-face-boost',
    humanReadableName: 'Опытный Фейс',
    description: 'Очень опытный фейс',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-face'],
    pack: { id: 'gen-arch-face-boost', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
  },
  // depth +1
  {
    id: 'arch-ai',
    humanReadableName: 'Архетип: Искусственный интеллект',
    description: 'Искусственный интеллект. ',
    availability: 'master',
    karmaCost: 100,
    prerequisites: ['meta-ai', 'master-of-the-universe'],
    pack: { id: 'gen-arch-ai', level: 1 },
    modifier: [modifierFromEffect(increaseDepth, { amount: 1 })],
  },
  // depth +1
  {
    id: 'arch-ai-matrix',
    humanReadableName: 'Аспект: ИИ Матрица',
    description: 'ИИ, специализирующийся на работе с Матрицей',
    availability: 'master',
    karmaCost: 60,
    prerequisites: ['arch-ai', 'master-of-the-universe'],
    pack: { id: 'gen-arch-ai-matrix', level: 1 },
    modifier: [modifierFromEffect(increaseDepth, { amount: 1 })],
  },
  //
  {
    id: 'can-be-exorcized',
    humanReadableName: 'Бойся экзорцистов!',
    description: 'Экзорцист может изгнать тебя с ближнего астрала на тёмные и глубокие астральные планы. И, возможно, надолго.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-spirit', level: 1 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'guns-1',
    humanReadableName: 'Винтовки',
    description: 'Ты умеешь использовать винтовку (до 16 патронов). Атака НЕ пробивает тяжелую броню.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai'],
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'guns-2',
    humanReadableName: 'Автоматы',
    description: 'Ты можешь использовать автомат (до 25 патронов, электромех).  Атака НЕ пробивает тяжелую броню.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai', 'guns-1'],
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'guns-3',
    humanReadableName: 'Пулеметы',
    description:
      'Ты можешь использовать пулемёт (без ограничения патронов, электромех). Оружие необходимо держать двумя руками. Атака НЕ пробивает тяжелую броню.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai', 'guns-2'],
    modifier: [],
  },
  // усложняет вырезание имплантов рипоменами при применении абилок  repoman-black и repoman-active. С вероятностью неудачи 50%
  {
    id: 'armor-1',
    humanReadableName: 'Приживление имплантов',
    description: 'Усиленное приживление имплантов сильно мешает рипоменам срезать имеющиеся импланты.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai', 'armor-2'],
    modifier: [modifierFromEffect(setImplantsRemovalResistance, { amount: 50 })],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'armor-2',
    humanReadableName: 'Легкая броня',
    description:
      'Ты можешь носить легкую броню. При наличии легкой брони получаешь +2 хита. Надеть легкую броню можно только при наличии импланта "крепкая спина".',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai'],
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'armor-3',
    humanReadableName: 'Тяжелая броня',
    description:
      'Ты можешь носить тяжелую броню. При наличии тяжелой брони ты получаешь иммунитет к Легкому холодному и легкому дистанционному оружию. Тяжелое оружие снимает с тебя только один хит одним попаданием. Надеть тяжелую броню можно только при наличии импланта "усиленные кости"',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-samurai', 'armor-1'],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Если самурай находится в состоянии "тяжелое ранение" и не добит в течение 3 минут, персонаж встает из тяжрана в здоров. Через 30 минут после восстановления переходит в состояние КС.
  {
    id: 'constitution-3',
    humanReadableName: 'Всплеск адреналина',
    description:
      'Вылечить твое тяжелое ранение невозможно. Если ты упал в тяжран и тебя не добили - через 3 минуты ты сам встанешь из тяжрана. Через 30 минут автоматически упадешь в КС. ',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-samurai', 'binding'],
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: "clubs'n'swords-1",
    humanReadableName: 'Дубинки',
    description:
      'Ты можешь использовать легкое холодное оружие - дубинки, биты, монтировки длиной до 60см. Атака НЕ пробивает тяжелую броню..',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai'],
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: "clubs'n'swords-2",
    humanReadableName: 'Мечи и топоры',
    description:
      'Ты можешь использовать легкое холодное оружие - мечи, сабли до 120 см, топоры длиной до 100 см. Атака НЕ пробивает тяжелую броню.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai', "clubs'n'swords-1"],
    modifier: [],
  },
  // добавляем в список вещества с содержанием ( 230 - Интеллект * 10)  мг и больше
  {
    id: 'whats-in-the-body-2',
    humanReadableName: 'Диагностика 2 усиление',
    description: 'Ты видишь более тонкие составы в теле пациента.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'whats-in-the-body-1'],
    modifier: [modifierFromEffect(decreaseChemoSensitivity, { amount: 50 })],
  },
  // показываем в списке вещества с содержанием ( 130 - Интеллект * 10)   мг и больше
  {
    id: 'whats-in-the-body-3',
    humanReadableName: 'Диагностика 3 усиление',
    description: 'Ты видишь самые тонкие составы в теле пациента.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'whats-in-the-body-2'],
    modifier: [modifierFromEffect(decreaseChemoSensitivity, { amount: 100 })],
  },
  // TODO(aeremin): Implement and add modifier here
  // ментальная защита снижена на 3
  {
    id: 'arch-face-negative-1',
    humanReadableName: 'проблемы фейса-1',
    description: 'У тебя проблемы, фейс.',
    availability: 'open',
    karmaCost: -20,
    prerequisites: ['arch-face'],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // эссенс снижен на 1
  {
    id: 'arch-face-negative-2',
    humanReadableName: 'проблемы фейса-2',
    description: 'У тебя серьезные проблемы, фейс.',
    availability: 'open',
    karmaCost: -20,
    prerequisites: ['arch-face-negative-1'],
    modifier: [],
  },
  // Харизма уменьшена на 1
  {
    id: 'arch-face-negative-3',
    humanReadableName: 'проблемы фейса-3',
    description: 'У тебя очень серьезные проблемы, фейс.',
    availability: 'open',
    karmaCost: -20,
    prerequisites: ['arch-face-negative-2'],
    modifier: [],
  },
  //
  {
    id: 'arch-mage-negative-1',
    humanReadableName: 'проблемы мага - 1 ',
    description: 'У тебя проблемы, маг.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-mage'],
    pack: { id: 'mage-badfate', level: 1 },
    modifier: [],
  },
  //
  {
    id: 'arch-mage-negative-2',
    humanReadableName: 'проблемы мага - 2',
    description: 'У тебя серьезные проблемы, маг.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-mage-negative-1'],
    pack: { id: 'mage-badfate', level: 2 },
    modifier: [],
  },
  //
  {
    id: 'arch-mage-negative-3',
    humanReadableName: 'проблемы мага - 3',
    description: 'У тебя очень серьезные проблемы, маг.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-mage-negative-2'],
    pack: { id: 'mage-badfate', level: 3 },
    modifier: [],
  },
  // Персонажам, имеющим абилку, Случай начисляет Х денег в конце каждого цикла
  {
    id: 'dividends-1',
    humanReadableName: 'Дивиденды *',
    description:
      'Дивиденды гарантируют вашему персонажу регулярный пассивный доход на игре, без регистрации и СМС. Shut up and take my nuyens! Да, этого точно хватит чтобы поесть и оплатить некоторые развлечения.',
    availability: 'master',
    karmaCost: 70,
    prerequisites: [],
    pack: { id: 'dividends', level: 1 },
    modifier: [],
  },
  // Персонажам, имеющим абилку, Случай начисляет ХХ денег в конце каждого цикла
  {
    id: 'dividends-2',
    humanReadableName: 'Дивиденды **',
    description: 'Больше пассивного дохода!',
    availability: 'master',
    karmaCost: 70,
    prerequisites: ['dividends-1'],
    pack: { id: 'dividends', level: 2 },
    modifier: [],
  },
  // Персонажам, имеющим абилку, Случай начисляет ХХХ денег в конце каждого цикла
  {
    id: 'dividends-3',
    humanReadableName: 'Дивиденды ***',
    description: 'Еще больше пассивного дохода, ты сумел вырваться из крысиных бегов, чаммер!',
    availability: 'master',
    karmaCost: 70,
    prerequisites: ['dividends-2'],
    pack: { id: 'dividends', level: 3 },
    modifier: [],
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-1-summ',
    humanReadableName: 'Магия 1-П!',
    description: 'Перманентно увеличивает характеристику Магия на 1',
    availability: 'master',
    karmaCost: 80,
    prerequisites: [],
    pack: { id: 'mage-summon-fate', level: 1 },
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-2-summ',
    humanReadableName: 'Магия 2-П!',
    description: 'Перманентно увеличивает характеристику Магия на 1',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['magic-1-summ'],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 2 меча, 1 щит"
  {
    id: 'astro-boy-cast',
    humanReadableName: 'Астробой-З',
    description: 'В астральной боёвке 2 меча и 1 щит',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 2 меча, 1 щит"
  {
    id: 'astro-boy-summ',
    humanReadableName: 'Астробой-П!',
    description: 'В астральной боёвке 2 меча и 1 щит',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // Все мясные/экто тела, касающиеся владельца абилки на протяжении минуты, в конце этой минуты восстанавливают текущие хиты до максимума
  {
    id: 'healtouch',
    humanReadableName: 'Healtouch',
    description:
      'Все мясные/экто тела, касающиеся владельца абилки на протяжении минуты, в конце этой минуты восстанавливают текущие хиты до максимума',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'hack-deck-deanon',
    humanReadableName: 'deanon',
    description: 'новая команда: deanon\nОтображает адрес PAN хоста поверженного (выброшенного в ходе боя из Матрицы) декера',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // поражает противника по живым хитам, а не по матричным
  {
    id: 'hack-deck-harm',
    humanReadableName: 'harm',
    description: 'новая команда: harm\nПоражает хакера биофидбеком. грязная штука.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // убивает пораженного чамера. Абсолютная смерть
  {
    id: 'hack-deck-kill',
    humanReadableName: 'kill',
    description: 'новая команда: kill\nУбивает поражаенного хакера. Да, наглухо',
    availability: 'closed',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'fencer-3', 'hack-deck-harm'],
    modifier: [],
  },
  //
  {
    id: 'useapi',
    humanReadableName: 'useapi',
    description: 'новая команда: useapi\nБазовая команда для работы со специальным нодам',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'hack-deck-miner', level: 1 },
    modifier: [],
  },
  // позволяет читать данные из геоноды
  {
    id: 'arch-hack-decker-geo-1',
    humanReadableName: 'геоспец 1',
    description: 'возможность использовать useapi read на геоноде',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'arch-hack-decker-geo', level: 1 },
    modifier: [],
  },
  // позволяет лучше читать данные из геоноды.
  {
    id: 'arch-hack-decker-geo-2',
    humanReadableName: 'геоспец 2',
    description: 'возможность использовать расширенную useapi read на геоноде',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'arch-hack-decker-geo-1'],
    pack: { id: 'arch-hack-decker-geo', level: 2 },
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из геоноды.
  {
    id: 'arch-hack-decker-geo-3',
    humanReadableName: 'геоспец 3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на геоноде',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'arch-hack-decker-geo-2'],
    pack: { id: 'arch-hack-decker-geo', level: 3 },
    modifier: [],
  },
  // позволяет читать данные из экономноды
  {
    id: 'arch-hack-decker-econ-1',
    humanReadableName: 'эконом 1',
    description: 'возможность использовать useapi read на экономноде',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'arch-hack-decker-econ', level: 1 },
    modifier: [],
  },
  // позволяет лучше читать данные из экономноды.
  {
    id: 'arch-hack-decker-econ-2',
    humanReadableName: 'эконом 2',
    description: 'возможность использовать расширенную useapi read на экономноде.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'arch-hack-decker-econ-1'],
    pack: { id: 'arch-hack-decker-econ', level: 2 },
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из экономноды.
  {
    id: 'arch-hack-decker-econ-3',
    humanReadableName: 'эконом 3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на экономноде',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'arch-hack-decker-econ-2'],
    pack: { id: 'arch-hack-decker-econ', level: 3 },
    modifier: [],
  },
  // позволяет читать данные из биомонитора и rcc
  {
    id: 'arch-hack-decker-med-1',
    humanReadableName: 'Медицина и Хром 1',
    description: 'возможность использовать useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'arch-hack-decker-med', level: 1 },
    modifier: [],
  },
  // позволяет лучше читать данные из биомонитора и rcc.
  {
    id: 'arch-hack-decker-med-2',
    humanReadableName: 'Медицина и Хром 2',
    description: 'возможность использовать расширенную useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'arch-hack-decker-med-1'],
    pack: { id: 'arch-hack-decker-med', level: 2 },
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из биомонитора и rcc.
  {
    id: 'arch-hack-decker-med-3',
    humanReadableName: 'Медицина и Хром 3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'arch-hack-decker-med-2'],
    pack: { id: 'arch-hack-decker-med', level: 3 },
    modifier: [],
  },
  // Эффект химоты
  {
    id: 'heavy-weapons-unlock',
    humanReadableName: 'Тяжелое оружие',
    description: 'Позволяет использовать тяжелое оружие.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'fireball-able',
    humanReadableName: 'Fireball',
    description: 'Можете кинуть {{ amount }} огненных шаров.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Эффект химоты
  {
    id: 'light-armor-effect',
    humanReadableName: 'Легкая броня',
    description: 'Тяжелое оружие бьет тебя по хитам (эффект лёгкой брони).',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Эффект химоты
  {
    id: 'berserk-effect',
    humanReadableName: 'Берсерк',
    description:
      'Если у тебя сняли все хиты - издай дикий боевой крик и можешь продолжать сражаться. У тебя два хита. После их снятия нажми кнопку "тяжран".',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'dump-shock-survivor',
    humanReadableName: 'Пережитый дамп-шок',
    description: 'Ты пережил дамп-шок. Тебя преследует постоянная головная боль. Эффект x {{ amount }}',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  //
  {
    id: 'fast-charge-able',
    humanReadableName: 'Fast Charge',
    description: 'Можете кинуть {{ amount }} молний.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Добавляет в КоэффициентСопротивленияОткату множитель K=1/(6+{{ amount }} ).  По умолчанию amount = 1
  {
    id: 'bloody-tide',
    humanReadableName: 'Кровавый прилив',
    description: 'Увеличивает сопротивление Откату',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // Увеличивает максимальную доступную Мощь на {{ amount }}. По умолчанию amount = 1
  {
    id: 'magic-in-the-blood',
    humanReadableName: 'Магия в крови',
    description: 'Увеличивает максимальную доступную Мощь на {{ amount }}',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  //
  {
    id: 'avalanche-able',
    humanReadableName: 'Avalanche',
    description:
      'У всех персонажей, присутствовавших на конец каста заклинания в реале в текущей локации (мясо/экто/дрон - кроме самого мага и тех, кого он вслух укажет) и взаимодействующих с магом (слышащих/видящих/нападающих на него), хиты снижаются на {{ amount }}',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'birds-able',
    humanReadableName: 'Birds',
    description:
      'Каждые 60 секунд в течение {{ amount }} минут у всех присутствующих в реале  (мясо/экто/дрон -  кроме самого мага и тех, кого он вслух укажет) в этой локации текущие хиты уменьшаются на 1 на срок 30 минут. Если хиты уменьшились таким образом до нуля, то персонаж оказывается в тяжране',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'cacophony-able',
    humanReadableName: 'Cacophony',
    description:
      'Каждые 60 секунд в течение {{ amount }} минут всем присутствующим в астрале (кроме самого мага и тех, кого он вслух укажет) в этой локации необходимо сделать 20 приседаний.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'tincasm-able',
    humanReadableName: 'Think as a master',
    description:
      'В течение 10 минут после активации заклинания все персонажи, присутствующие в реале в поле зрения мага (мясо/экто/дрон - кроме самого мага и тех, кого он вслух укажет), переходят в тяжран, если персонаж не занят _исключительно_ убеганием от мага. Начавшие убегать должны продолжать бежать, пока не досчитают до 60 (после этого эффект заклинания на них больше не действует). Во время убегания они доступны для атаки по обычным правилам',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // При применении абилки  use-pills-on-others ИЛИ употребления  таблетки  самостоятельно
  // с 30% вероятностью - эффект срабатывает, а препарат не расходуется после использования.
  // Работает только для препаратов, которые входят в список:
  // iodomarin  iodomarin-p apollo  apollo-p military-combo   military-supercombo  preper  preper-p yurgen yurgen-p
  {
    id: 'good-pills',
    humanReadableName: 'Используй аптечку правильно!',
    description:
      'При применении препаратов, восстанавливающих хиты и боевых коктейлей, с вероятностью 30% препарат даст нужный эффект, но не израсходуется.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'use-pills-on-others'],
    modifier: [],
  },
  // Отображает текст на экране персонажа
  {
    id: 'troubles-common-1',
    humanReadableName: 'Общие проблемы *',
    description:
      'У персонажа есть тяжелый груз мрачного прошлого. Открытый контракт на его голову; ворованное имущество; наркотическая зависимость, долг перед кем-то (не денежный), поддельный SIN;  ...',
    availability: 'master',
    karmaCost: -10,
    prerequisites: [],
    pack: { id: 'troubles-common', level: 1 },
    modifier: [],
  },
  // Отображает текст на экране персонажа
  {
    id: 'troubles-common-2',
    humanReadableName: 'Общие проблемы **',
    description: 'Еще более тяжелый и мрачный груз.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['troubles-common-1'],
    pack: { id: 'troubles-common', level: 2 },
    modifier: [],
  },
  // Отображает текст на экране персонажа
  {
    id: 'troubles-common-3',
    humanReadableName: 'Общие проблемы ***',
    description: 'Совсем тяжелый и мрачный груз.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['troubles-common-2'],
    pack: { id: 'troubles-common', level: 3 },
    modifier: [],
  },
  //
  {
    id: 'black-matter',
    humanReadableName: 'Black matter',
    description: 'У духа в эктоплазменном теле 6 хитов.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'grey-matter',
    humanReadableName: 'Grey matter',
    description: 'У духа в эктоплазменном теле 4 хита',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMaxEctoplasmHp, { amount: 1 })],
  },
  // Эту абилку НАДО ставить пререквезитом ко всему непонятному, что мы хотим спрятать от игроков
  {
    id: 'master-of-the-universe',
    humanReadableName: 'Я мастер!',
    description: 'Я мастер и вижу все закрытые, непонятные и непротестированные абилки',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // int+1
  {
    id: 'auto-doc-bonus-1',
    humanReadableName: 'бонус автодок 1',
    description: 'ты лучше работаешь с имплантами в автодоке',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // int+3
  {
    id: 'auto-doc-bonus-3',
    humanReadableName: 'бонус автодок 2',
    description: 'ты ещё лучше работаешь с имплантами в автодоке',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 3 })],
  },
  // int +5
  {
    id: 'auto-doc-bonus-5',
    humanReadableName: 'бонус автодок 3',
    description: 'ты отлично работаешь с имплантами в автодоке',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 5 })],
  },
  // доступен экран автодока
  {
    id: 'auto-doc-screen',
    humanReadableName: 'Экран автодока',
    description: 'можешь проводить операции через экран автодока',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [modifierFromEffect(unlockAutodockScreen, {})],
  },
  {
    id: 'gunslinger',
    humanReadableName: 'Самый быстрый пистолет на Западе',
    description: '',
    availability: 'open',
    karmaCost: 16,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'not-the-droids',
    humanReadableName: 'Мы не те дроиды которых вы ищете',
    description: '',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Здесь идет включение а Автодок, показывается экран Автодока и к сумме (rigging.repomanBonus + Int ) добавляется еще int bonus от автодока.
  // Вырезанный имплант записывается на QR чип
  {
    id: 'repoman-medic',
    humanReadableName: 'Рипомен хирург',
    description: 'Ты можешь использовать автодок для снятия имплантов.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger', 'auto-doc-2', 'repoman-2'],
    modifier: [modifierFromEffect(unlockAutodockImplantRemoval, {})],
  },
  // Это сводная абилка для свойств духа типа1
  {
    id: 'totoro',
    humanReadableName: 'Totoro',
    description: 'Ты неуязвим для снарядов. Можешь лечить мясным телам хиты до их максимума прикосновением в течение 5с',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Это сводная абилка для свойств духа типа2
  {
    id: 'firestarter',
    humanReadableName: 'Firestarter',
    description: 'Можешь кинуть в одном бою до 5 файерболов',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Это сводная абилка для свойств духа типа3
  {
    id: 'riotment',
    humanReadableName: 'Riotment',
    description: 'Неуязвим для снарядов. Можешь кинуть в бою 1 файербол. Оружие в руках считается тяжёлым',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // нужна сугобо в матрице для проверки доступености дебажных команд
  {
    id: 'god-mode',
    humanReadableName: 'god mode',
    description: 'GOD mode',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // делает доступной кнопку установки импланта на экране автодока
  {
    id: 'implant-install',
    humanReadableName: 'Установка импланта',
    description: 'Ты можешь использовать автодок для установки имплантов',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger'],
    modifier: [modifierFromEffect(unlockAutodockImplantInstall, {})],
  },
  {
    id: 'ghost',
    humanReadableName: 'ПРизрак',
    description: '',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'hammer-strike',
    humanReadableName: 'Хаммер страйк',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'hammer-fall',
    humanReadableName: 'Хаммер фолл',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'weak-healer',
    humanReadableName: 'Знахарь',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'healer',
    humanReadableName: 'Лекарь',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'great-healer',
    humanReadableName: 'Исцелитель',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'i-am-power',
    humanReadableName: 'Власть здесь я',
    description: '',
    availability: 'master',
    karmaCost: 16,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'arch-hackerman-technomancer-anarchy',
    humanReadableName: 'Анархия!',
    description: '',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'arch-hackerman-technomancer-compile',
    humanReadableName: 'Компиляция',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'nothing-1',
    humanReadableName: 'Менталист Матрицы',
    description: '',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'nothing-2',
    humanReadableName: 'Живой RCC',
    description: '',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'nothing-3',
    humanReadableName: 'Живая персона',
    description: '',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'interceptor',
    humanReadableName: 'Интерцептор',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'pole-1',
    humanReadableName: '',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'pole-2',
    humanReadableName: '',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'i-am-a-noobie',
    humanReadableName: 'Стартер: новичок',
    description: 'Ты уже в профессии, чаммер. Ты начал свой путь и уже не полный нуб.',
    availability: 'master',
    karmaCost: 2,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'i-am-a-profy',
    humanReadableName: 'Стартер: профессонал',
    description: 'Твое имя уже известно. Некоторым. Ты много чего повидал и никто не посмеет назвать тебя нубом',
    availability: 'master',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'i-am-a-legend',
    humanReadableName: 'Стартер: легенда',
    description:
      'Хорошо или плохо, но ты легенда Иркутского грида. Когда кто-то в мире спросит про Иркутск, вспомнят твое имя. В том числе.\n\nАльтернатива: Стартер: падаван.\nТвой учитель был легендой Иркутска и не только. Яркой звездой. Которая теперь догорает на безымянном урановом руднике, после того как спалился. Но его короша тебя запомнили и помогли как смогли.',
    availability: 'master',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'bless-from-behind',
    humanReadableName: 'Привет из прошлого',
    description: 'Прошлое не умирает. Никогда. Однажды, ты пересек дорогу тем, кому не стоило. И они помнят про это',
    availability: 'master',
    karmaCost: -4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'shit-from-behind',
    humanReadableName: 'П@#$ц из прошлого',
    description: 'Прошлое не умирает. Никогда. Ты лихо подставился. И тебе это ТОЧНО не простят',
    availability: 'master',
    karmaCost: -8,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'jumpstart',
    humanReadableName: 'Jumpstart',
    description:
      'Чаммер, ты везунчик. Ты как раз успел хорошо отдохнуть и набраться сил перед началом замеса в Иркутске! Ты можешь войти в основание в среду!',
    availability: 'master',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'merge-shaman',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    availability: 'open',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'merge-cyberadept',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    availability: 'open',
    karmaCost: 6,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'awareness',
    humanReadableName: 'Насторожиться',
    description:
      'Ты можешь внимательно присмотреться к спрайтам в комнате. И какие-то из них явно не местные! Подозрительно...\n\nОбнаруживает вмерженные (то есть установленные другими хакерами) спрайты в этой ноде',
    availability: 'open',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'exterminatus',
    humanReadableName: 'Экстерминатус',
    description:
      'Ты можешь сконцентрироваться и разрушительный импульс, который уничтожит часть (зависит от Резонанса) спрайтов, вмерженных в эту Ноду\n',
    availability: 'open',
    karmaCost: 2,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'looking-for-trouble',
    humanReadableName: 'ГдеСрач?!',
    description:
      'Ты теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в Основание (на стойке)\nВыдает список хостов, на которых есть техноманты и уровень группы. Чем сильнее твой Резонанс, тем меньше шансов у них остаться незамеченными',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'chieftain',
    humanReadableName: 'Вождь',
    description:
      'Это самый ценный из даров. Дар подарить Дар другому. Ты можешь разбудить в Госте Основания его суть, его природу, дав ему возможность по-настоящему почувстовать Матрицу. Цель пробудится и сможет стать техномантом',
    availability: 'closed',
    karmaCost: 16,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  {
    id: 'punch',
    humanReadableName: 'Punch',
    description:
      'Безопасная матрица, говорили они...\n\nЦель, пораженная "файрболом" в VR выбивается из матрицы, получая дамп-шок\n\nОБЯЗАТЕЛЬНО отсканируй QR код жертвы',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'once-i-have-survived',
    humanReadableName: 'Однажды я выжил...',
    description: 'В прошлом ты перенес дамп-шок.',
    availability: 'master',
    karmaCost: -4,
    prerequisites: ['dump-shock-survivor'],
    modifier: [],
  },
  {
    id: 'saveload',
    humanReadableName: 'Save/Load',
    description:
      'Этот пэттерн настолько силен, что он не мог не воплотиться в Матрице.\nНаходясь на обычной ноде (не в красной комнате), позволяет  поднять руку и сказать слово "Сохраняюсь". И позже, в этой же комнате, сказать "Загружаюсь". Да, 100% загрузки не получится, и потраченных ресурсов не вернуть.. но бывает очень полезно!',
    availability: 'open',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'stunning-resist',
    humanReadableName: 'Защита от оглушения',
    description: 'Иммунитет к оглушению. Скажи "иммунитет" и покажи эту способность, если тебя пытаются оглушить. Ты НЕ оглушен.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-samurai', 'faster-regen-1'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'loud-break-in',
    humanReadableName: 'Громкий взлом',
    description:
      'Громкий взлом замков.  (1 раз в 30 минут). Ты можешь открыть дверь, закрытую на замок. Для этого надо в течении 5 минут громко изображать попытки выбить замок / сломать дверь. Попытки должны быть громкими и заметными окружающим.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['lock-the-door'],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Надо взорвать пакет на 3-4 варианта
  {
    id: 'troubles-samurai-1',
    humanReadableName: 'Проблемы самурая *',
    description: 'легкие проблемы самурая  на начало игры',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-samurai'],
    pack: { id: 'sam-badfate', level: 1 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Надо взорвать пакет на 3-4 варианта
  {
    id: 'troubles-samurai-2',
    humanReadableName: 'Проблемы самурая **',
    description: 'средние проблемы самурая на начало игры',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['troubles-samurai-1'],
    pack: { id: 'sam-badfate', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Надо взорвать пакет на 3-4 варианта
  {
    id: 'troubles-samurai-3',
    humanReadableName: 'Проблемы самурая ***',
    description: 'Совсем много проблем самурая на начало игры',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['troubles-samurai-2'],
    pack: { id: 'sam-badfate', level: 3 },
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'self-unbinding-mage',
    humanReadableName: 'Развязывание (маг)',
    description:
      'Если тебя связали - ты можешь развязаться в любой момент по своему желанию.  Необходимо громко должны сказать “развязался” и скинуть веревочные петли. ',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['binding', 'arch-mage'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'self-unbinding-face',
    humanReadableName: 'Развязывание (фейс)',
    description:
      'Если тебя связали - ты можешь развязаться в любой момент по своему желанию.  Необходимо громко должны сказать “развязался” и скинуть веревочные петли. ',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['binding', 'arch-face'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'lock-the-door',
    humanReadableName: 'Запереть замок',
    description:
      'Закрыть замок.  Ты можешь поставить маркер "замок" на дверь. (лист А4, указать список имен и SIN лиц, у кого есть ключ от замка)',
    availability: 'open',
    karmaCost: 10,
    prerequisites: [],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'quiet-break-in-hacker',
    humanReadableName: 'Тихий взлом (техномант)',
    description:
      'Тихий взлом замков. (1 раз в 30 минут) Ты можешь открыть дверь, закрытую на замок. Для этого надо стоять 2 минуты у закрытой двери, все это время держась рукой за сертификат замка.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['lock-the-door', 'arch-hackerman-technomancer'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'quiet-break-in-rigger',
    humanReadableName: 'Тихий взлом (риггер)',
    description:
      'Тихий взлом замков. (1 раз в 30 минут) Ты можешь открыть дверь, закрытую на замок. Для этого надо стоять 2 минуты у закрытой двери, все это время держась рукой за сертификат замка.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['lock-the-door', 'arch-rigger'],
    modifier: [],
  },
  // базовый навык всех персонажей
  {
    id: 'base-dagger',
    humanReadableName: 'Холодное оружие: кинжал (all)',
    description: 'Ты умеешь использовать кинжалы (до 45 см). Кинжалы НЕ пробивают доспехи.',
    availability: 'open',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    modifier: [],
  },
  //
  {
    id: 'base-gun',
    humanReadableName: 'Огнестрельное оружие: пистолет (all)',
    description: 'Ты умеешь использовать пистолет (механика, до 8 патронов). Атака пробивает легкий доспех. ',
    availability: 'open',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'ambidextrous',
    humanReadableName: 'Амбидекстр',
    description: 'Ты можешь использовать два одноручных оружия в двух руках. ',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-samurai', 'faster-regen-1'],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Выдаётся при входе в астрал на конкретный срок. Чем более крутая абилка используется для входа в астрал - тем больше срок. Если маг пропустил время и не вернулся вовремя - то при выходе из астрала обратно в мясное тело через телохранилище должен сложиться в КС
  {
    id: 'silver-thread',
    humanReadableName: 'Серебряная нить',
    description:
      'Связывает твой разум с мясным телом, когда ты в астрале. Если ты окажешься в астрале без этой способности - то перейдёшь в клиническую смерть.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  //
  {
    id: 'in-the-astral',
    humanReadableName: 'Астрал',
    description:
      'Ты в астральном теле, неуязвим для физических воздействий и сам не можешь воздействовать на физические объекты. Можешь слышать и видеть всё происходящее в физическом мире и проходить куда угодно (можно открыть дверь для прохода тела игрока, но не для других персонажей). Не можешь брать ничего материального.\nЕсли не вернёшься в физическое тело за {{amount}} минут - окажешься в КС.\nПри предъявлении тебе менее, чем с 2м текста способности AstralopithecusRage - действуй согласно её описанию и тому, что предпринимает её владелец.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // В описании абилки в "Пассивных" текст: "Можешь видеть сущности, находящиеся в астрале (красный дождевик), и изгонять их из помещения, в котором вы находитесь, или на длину твоего выпада холодным оружием"
  {
    id: 'astralopithecus-rage',
    humanReadableName: 'AstralopithecusRage',
    description:
      'Ты можешь видеть сущности, находящиеся в астрале (красный дождевик), и изгонять их из помещения, в котором вы находитесь, или отгонять на длину твоего выпада холодным оружием Попадание по ним не снимает у них хитов, но вынуждает отойти за пределы твоей атаки. Они не могут действовать на тебя физически.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  {
    id: 'arch-decker-boost',
    humanReadableName: 'Опытный Декер',
    description: 'Очень опытный хакер декер.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-decker'],
    modifier: [],
  },
  {
    id: 'arch-technomancer-boost',
    humanReadableName: 'Опытный Техномант',
    description: 'Очень опытный хакер техномант.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer', 'master-of-the-universe'],
    modifier: [],
  },
  // инструкция про киберруки
  {
    id: 'hands-samurai',
    humanReadableName: 'Киберруки и БиоСила',
    description:
      'Чтобы пользоваться оружием - тебе нужен соответствующий Навык и Усиленные руки. Для одноручного оружия - нужна способность БиоСила или один имплант Киберрука. Чтобы держать оружие двумя руками (двуручное холодное, пулемет, или два одноручных) - БиоСила плюс Киберрука или два импланта Киберрука.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-samurai'],
    pack: { id: 'Samurai-pack', level: 1 },
    modifier: [],
  },
  // Игрок может использовать строительные перчатки и прокачивать навык использования спрайтов основания
  {
    id: 'sprites-basic',
    humanReadableName: 'Использование спрайтов в Основании',
    description: '"Ты можешь пользоваться спрайтом "строительные перчатки" в основании"',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Ключи" в Основании
  {
    id: 'keys',
    humanReadableName: 'Спрайт "ключи"',
    description: 'Ты умеешь использовать спрайт "Ключи" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Кувшинки" в Основании
  {
    id: 'water-walkers',
    humanReadableName: 'Спрайт "кувшинки" (мокроступы)',
    description: 'Ты умеешь использовать спрайт "Кувшинки" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Блокнот и карандаш" в Основании
  {
    id: 'pen-n-note',
    humanReadableName: 'Спрайт "блокнот и карандаш"',
    description: 'Ты умеешь использовать спрайт "Блокнот и карандаш" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Шарики" в Основании
  {
    id: 'balls',
    humanReadableName: 'Спрайт "шарики"',
    description: 'Ты умеешь использовать спрайт "Шарики" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Перчатки" в Основании
  {
    id: 'rubber-glowes',
    humanReadableName: 'Спрайт "перчатки"',
    description: 'Ты умеешь использовать спрайт "Перчатки" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Ракетка" в Основании
  {
    id: 'racket',
    humanReadableName: 'Спрайт "ракетка"',
    description: 'Ты умеешь использовать спрайт "Ракетка" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'rubber-glowes'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Конфетка" в Основании
  {
    id: 'candy',
    humanReadableName: 'Спрайт "конфетка"',
    description: 'Ты умеешь использовать спрайт "Конфетка" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать спрайт "Труба" в Основании
  {
    id: 'pipe',
    humanReadableName: 'Спрайт "труба"',
    description: 'Ты умеешь использовать спрайт "Труба" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать Легкий доспех в Красной комнате
  {
    id: 'armor-light',
    humanReadableName: 'легкий доспех',
    description: 'Ты можешь использовать Легкий доспех в Красной комнате',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать Тяжелый доспех в Красной комнате
  {
    id: 'armor-heavy',
    humanReadableName: 'тяжелый доспех',
    description: 'Ты можешь использовать Тяжелый доспех в Красной комнате',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'armor-light'],
    modifier: [],
  },
  // Игрок может использовать  Щит в Красной комнате
  {
    id: 'shield',
    humanReadableName: 'щит',
    description: 'Ты можешь использовать  Щит в Красной комнате',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic', 'control-basic'],
    modifier: [],
  },
  // Игрок может использовать Одноручный меч в Красной комнате
  {
    id: 'sword-short',
    humanReadableName: 'одноручный меч',
    description: 'Ты можешь использовать Одноручный меч в Красной комнате',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок может использовать  Двуручный меч в Красной комнате
  {
    id: 'sword-twohanded',
    humanReadableName: 'двуручный меч',
    description: 'Ты можешь использовать  Двуручный меч в Красной комнате',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'sword-short', 'control-basic'],
    modifier: [],
  },
  // Игрок может использовать два коротких меча  в Красной комнате
  {
    id: 'sword-short-doubled',
    humanReadableName: 'два коротких меча',
    description: 'Ты можешь использовать два коротких меча  в Красной комнате',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'sword-short', 'control-basic'],
    modifier: [],
  },
  // Игрок может использовать значок инициативы в Красной комнате
  {
    id: 'initiative-sign',
    humanReadableName: 'значок иициативы',
    description: 'Ты можешь использовать значок инициативы в Красной комнате',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic', 'initiative-basic'],
    modifier: [],
  },
  // Игрок может использовать доступные комплексные формы в основании
  {
    id: 'complex-form-basic',
    humanReadableName: 'Комплексные формы в Основании',
    description: '"Ты можешь использовать комплексные формы в основании"',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Игрок может держать (иметь дотуп к информации черз бэкдор) 2 бэкдора
  {
    id: 'backdoor-hold-2',
    humanReadableName: 'держать 2 бэкдора',
    description: 'Можешь использовать 2 бэкдора одновременно',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Игрок может держать (иметь дотуп к информации черз бэкдор) 3 бэкдора
  {
    id: 'backdoor-hold-3',
    humanReadableName: 'держать 3 бэкдора',
    description: 'Можешь использовать 3 бэкдора одновременно',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'backdoor-hold-2'],
    modifier: [],
  },
  // Игрок может держать (иметь дотуп к информации черз бэкдор) 4 бэкдора
  {
    id: 'backdoor-hold-4',
    humanReadableName: 'держать 4 бэкдора',
    description: 'Можешь использовать 4 бэкдора одновременно',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'backdoor-hold-3'],
    modifier: [],
  },
  // Игрок может держать (иметь дотуп к информации черз бэкдор) 5 бэкдоров
  {
    id: 'backdoor-hold-5',
    humanReadableName: 'держать 5 бэкдоров',
    description: 'Можешь использовать 5 бэкдоров одновременно',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'backdoor-hold-4'],
    modifier: [],
  },
  // Игрок не реагирует на команду "покажи син" в VR
  // techno.fading +150
  {
    id: 'identity-hide',
    humanReadableName: 'VR: сокрытие своей личности',
    description: '\nРаботает только в VR,\n"Можешь не показывать син"',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    modifier: [],
  },
  {
    id: 'initiative-basic',
    humanReadableName: 'инициатива',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Только как пререквизит к другим скилам
  {
    id: 'control-basic',
    humanReadableName: 'контроль',
    description: '\n"Теперь ты можешь выбрать больше интересных навыков"',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'complex-form-basic'],
    modifier: [],
  },
  {
    id: 'fading-restore',
    humanReadableName: 'восстановление фэйдинга +',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'resonance-basic',
    humanReadableName: 'резонанс',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Body  +2
  // Intelligence +2
  {
    id: 'arch-rigger-boost',
    humanReadableName: 'Опытный Риггер',
    description: 'Очень опытный риггер.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-rigger'],
    pack: { id: 'gen-arch-rigger-boost', level: 1 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: "clubs'n'swords-3",
    humanReadableName: 'Двуручное оружие',
    description:
      'Ты умеешь использовать двуручное оружие. Двуручные топоры, молоты, мечи, дубины. От 120 до 170 см. Оружие необходимо держать двумя руками. Атака снимает 3 хита с цели либо 1 хит с цели в тяжелом доспехе. ',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai', "clubs'n'swords-2"],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // текстовая абилка.
  {
    id: 'police-scanner',
    humanReadableName: 'полицейский сканер',
    description: 'Ты имеешь право требовать показать в приложении страницу Экономика  - вкладка Паспорт',
    availability: 'master',
    karmaCost: 10,
    prerequisites: [],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  //
  {
    id: 'hack-deck-general',
    humanReadableName: 'Комбат',
    description: 'Твоя команда стала лучше. например, теперь вход на хост происходит по лучшему времени в группе.',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['hack-deck-commander', 'fencer-3'],
    pack: { id: 'hack-deck-fencer', level: 3 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // IT: команда в кривда-матрице
  {
    id: 'quell',
    humanReadableName: 'quell',
    description: 'УДАЛИТЬ',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['breacher-2'],
    pack: { id: 'hack-deck-breacher', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // IT: команда в кривда-матрице
  {
    id: 'hophop',
    humanReadableName: 'hophop',
    description:
      'новая команда: hop\nМгновенное перемещение по временному трейлу в ноду, в которой установлен якорный агент (backdoor, anchor...) с известным тебе именем (то есть значением ключа --name команды deploy)\n\nвместе с партией!',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['sly-3'],
    pack: { id: 'hack-deck-sly', level: 3 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // отрочка публикации CVE увеличена на час
  {
    id: 'deck-cve-delay-publish',
    humanReadableName: 'Криптоанархист',
    description: 'отрочка публикации CVE увеличена на час',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // количество нужных дампов для получения CVE на один меньше
  {
    id: 'deck-cve-mechmath',
    humanReadableName: 'вывих мозга "МехМат"',
    description: 'количество нужных дампов для получения CVE на один меньше',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-hackerman-decker'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  //
  {
    id: 'hack-deck-commander',
    humanReadableName: 'Командир',
    description:
      'Ты можешь создавать объединять декеров в команду.\nДекеры, входящие в команду перемещаются за лидером и не атакуют друг-друга френдли файером',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Игрок может использовать одноручный меч и прокачивать навыки использования других спрайтов красной комнаты
  {
    id: 'sprites-combat',
    humanReadableName: 'Использование спрайтов в Красной комнате',
    description: '"Ты можешь пользоваться спрайтами в красной комнате"',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Игрок может использовать доступные комплексные формы в красной комнате
  {
    id: 'complex-form-combat',
    humanReadableName: 'Комплексные формы в Красной комнате',
    description: '"Ты можешь использовать комплексные формы в красной комнате"',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // techno.fading - 2 в минуту
  {
    id: 'fading-decrease-basic',
    humanReadableName: 'Скапывание фейдинга базовое',
    description: 'Фейдинг персонажа уменьшается на 2 единицы в минуту',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // techno.fading - 7 в минуту
  // resonans/2
  {
    id: 'fading-decrease-2',
    humanReadableName: 'Скапывание фейдинга -2',
    description: 'Фейдинг персонажа уменьшается на 7 единиц в минуту',
    availability: 'open',
    karmaCost: 100,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // drone.recovery.skill+4
  {
    id: 'drone-recovery-bonus-1',
    humanReadableName: 'Ремонт бонус 1',
    description: 'Улучшает способность по ремонту дронов.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'drone-recovery'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // drone.recovery.skill+4
  {
    id: 'drone-recovery-bonus-2',
    humanReadableName: 'Ремонт бонус 2',
    description: 'Сильнее улучшает способность по ремонту дронов.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'drone-recovery-bonus-1'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // drone.recovery.skill+4
  {
    id: 'drone-recovery-bonus-3',
    humanReadableName: 'Ремонт бонус 3',
    description: 'Максимально улучшает способность по ремонту дронов.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'drone-recovery-bonus-2'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // int+1
  {
    id: 'factory-bonus-1',
    humanReadableName: 'бонус мастерская 1',
    description: 'ты лучше работаешь с модами в мастерской',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // int+3
  {
    id: 'factory-bonus-3',
    humanReadableName: 'бонус мастерская 2',
    description: 'ты ещё лучше работаешь в мастерской',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // int +5
  {
    id: 'factory-bonus-5',
    humanReadableName: 'бонус мастерская 3',
    description: 'ты отлично работаешь в мастерской',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // доступен экран мастерской
  {
    id: 'factory-screen',
    humanReadableName: 'Экран мастерской',
    description: 'можешь проводить операции через экран мастерской',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    pack: undefined,
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // magic-blockade
  // digital-life
  // vr-protection
  {
    id: 'meta-digital',
    humanReadableName: 'Цифровой персонаж',
    description: 'Ты цифровой разум, сгусток программ и кода, живущий в Матрице. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [],
  },
];
setAllPassiveAbilities(
  (() => {
    const result = new Map<string, PassiveAbility>();
    kAllPassiveAbilitiesList.forEach((f) => {
      if (result.has(f.id)) throw new Error('Non-unique passive ability id: ' + f.id);
      result.set(f.id, f);
    });
    return result;
  })(),
);
