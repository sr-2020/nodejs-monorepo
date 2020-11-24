import { Modifier } from '@sr2020/interface/models/alice-model-engine';
import { modifierFromEffect } from './util';
import {
  allowBiowareInstallation,
  decreaseChemoSensitivity,
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
  setImplantsRemovalResistance,
  setTransactionAnonymous,
  unlockAutodockImplantRemoval,
  unlockAutodockScreen,
} from './basic_effects';
import { Feature } from '@sr2020/sr2020-common/models/sr2020-character.model';

export interface PassiveAbility extends Feature {
  modifier: Modifier | Modifier[];
}
// Not exported by design, use kAllPassiveAbilities instead.
const kAllPassiveAbilitiesList: PassiveAbility[] = [
  // TODO(https://trello.com/c/i5oFZkFF/216-метатипы): Implement and add modifier here
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
    humanReadableName: 'Сильная рука',
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
    description: 'Ты можешь видеть существ, находящихся в Астрале и говорить с ними.',
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
    description: 'Ты не можешь изучать навыки Мага',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
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
    karmaCost: 2,
    prerequisites: ['fencer-1'],
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
    karmaCost: 4,
    prerequisites: ['link-lock'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // Позволяет реактивировать вырубленный IC
  {
    id: 'reactivate',
    humanReadableName: 'reactivate',
    description: 'новая команда: reactivate <target>\nвключает назад вырубленный Лед',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['breacher-2'],
    pack: { id: 'hack-deck-breacher', level: 2 },
    modifier: [],
  },
  // Позволяет пережить одну атаку черного льда
  {
    id: 'huge-lucker',
    humanReadableName: 'Конский лак ',
    description: '',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: [],
    modifier: [],
  },
  // Еще 3 хоста, на защиту которых ты можешь подписаться
  {
    id: 'admin',
    humanReadableName: 'Админ',
    description: 'Еще 3 хоста, на защиту которых ты можешь подписаться',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['stubbornness-1'],
    pack: { id: 'hack-deck-guru', level: 2 },
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 3 }),
  },
  // Разобрался со всеми примудростями квантовой компрессии. Позволяет экономить 10% памяти кибердеки при записи софта в деку
  {
    id: 'compressor',
    humanReadableName: 'Компрессор',
    description: 'Значительно экономит память деки, позволяя размесить в ней больше софта',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['stubbornness-1'],
    pack: { id: 'hack-deck-guru', level: 1 },
    modifier: [],
  },
  // Позволяет реактивировать вырубленый IC
  {
    id: 'diagnostician',
    humanReadableName: 'Диагност (техномант)',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Вэрианс на 10% быстрее падает
  {
    id: 'just-a-normal-guy',
    humanReadableName: 'Обыкновенный',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseVarianceResistance, { amount: 10 }),
  },
  // Фейдинг на 10% меньше
  {
    id: 'quite-enduring-guy',
    humanReadableName: 'Стойкий',
    description: '',
    availability: 'master',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseFadingResistance, { amount: 10 }),
  },
  // Увеличивает возможное количество бэкдоров. Зависит от уровня резонанса
  {
    id: 'squid',
    humanReadableName: 'Сквид',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseBackdoors, { amount: 3 }),
  },
  // Бэкдоры дохнут медленнее
  //
  // [Время_жизни_бэкдоров] +20
  {
    id: 'last-droplet',
    humanReadableName: 'Ну еще капельку',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 20 }),
  },
  // "Бэкдоры дохнут еще медленнее
  //
  // [Время_жизни_бэкдоров] +40" (комулятивно те в сумме 60)
  {
    id: 'very-last-droplet',
    humanReadableName: 'Выжать до капли',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 40 }),
  },
  {
    id: 'longer-vr-stays-1',
    humanReadableName: 'Мужчина, продлевать будете? ',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 60 }),
  },
  {
    id: 'longer-vr-stays-2',
    humanReadableName: 'Мужчина, продлевать будете?  v2',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 120 }),
  },
  {
    id: 'unlimited-vr-stays',
    humanReadableName: 'Виар. А я вообще тут живу.',
    description: '',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 9000 }),
  },
  // Резонанс +1
  {
    id: 'resonance-1',
    humanReadableName: 'Резонанс -1',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-2',
    humanReadableName: 'Резонанс -2',
    description: '',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['resonance-1'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-3',
    humanReadableName: 'Резонанс -3',
    description: '',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['resonance-2'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-4',
    humanReadableName: 'Резонанс -4',
    description: '',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['resonance-3'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Резонанс +1
  {
    id: 'resonance-5',
    humanReadableName: 'Резонанс -5',
    description: '',
    availability: 'open',
    karmaCost: 16,
    prerequisites: ['resonance-4'],
    modifier: modifierFromEffect(increaseResonance, { amount: 1 }),
  },
  // Еще один связанный спрайт
  {
    id: 'additional-sprite',
    humanReadableName: 'Намертво!',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseSpriteCount, { amount: 1 }),
  },
  // Еще один запрос к контролю
  {
    id: 'additional-query',
    humanReadableName: 'Чтец',
    description: '',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseControlRequests, { amount: 1 }),
  },
  // Меньше лаг данных контроля (по умолчанию данные контроля  старее чем 30 минут от момента запроса)
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
  // Добавляет время пребывания в Основании партии ( + Х секунд)
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
  // Добавляет время пребывания в Основании партии ( + Х секунд)
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
  // Добавляет время пребывания в Основании партии ( + Х секунд)
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
    description: 'новая команда: scan\nСканирует ноду и выводит список обнаруженных в ней агентов\n\nУспешность определяется по Sleaze',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['sly-1'],
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
    description: 'новая команда: deploy\nУстанавливает агента (софт) в Ноду Хоста\n--name:<имя>\n\n\nУспешность определяется по Sleaze',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['sly-1'],
    pack: { id: 'hack-deck-sly', level: 1 },
    modifier: [],
  },
  // очистка хоста от чужой дряни / пользы
  //
  // IT: команда в Кривда-матрице
  {
    id: 'uninstall',
    humanReadableName: 'uninstall',
    description: 'новая команда: uninstall\nУдаляет агента с Ноды\n\nУспешность определяется по Sleaze',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['sly-2'],
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
      'новая команда:feelmatrix\nТы теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в на Хост\nВыдает список хостов, на которых есть другие декеры и примерный уровень группы. Чем сильнее твой Sleaze, тем больше таких хостов ты найдешь',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-decker'],
    modifier: [],
  },
  // ЭТИКА
  // мини-корова декеров, закрытая этикой
  //
  // IT: команда в кривда-матрице
  {
    id: 'bypass',
    humanReadableName: 'bypass',
    description:
      'новая команда: unistall\nГениально! Этот IC просто не заметил тебя!\nПозволяет проходить мимо IC.\n\nУспешность определяется по Sleaze',
    availability: 'closed',
    karmaCost: 8,
    prerequisites: ['sly-2'],
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'hop',
    humanReadableName: 'hop',
    description:
      'новая команда: hop\nМгновенное перемещение по временному трейлу в ноду, в которой установлен якорный агент (backdoor, anchor...) с известным тебе именем (то есть значением ключа --name команды deploy)',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['sly-2'],
    pack: { id: 'hack-deck-sly', level: 2 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'quell',
    humanReadableName: 'quell',
    description:
      'новая команда: quell <target>\nкоманда применяется в бою с льдом. Атакованный IC пропустит несколько своих следующих атак (зависит от Firewall)',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['breacher-2'],
    pack: { id: 'hack-deck-breacher', level: 2 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'getdump',
    humanReadableName: 'getdump',
    description: 'новая команда: getdump\nкоманда применяется в бою с IC. Позволяет получить фрагмент дампа IC для CVE анализа',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['breacher-1'],
    pack: { id: 'hack-deck-breacher', level: 1 },
    modifier: [],
  },
  // IT: буду запрашивать сам факт наличия фичи
  {
    id: 'vulnerabilities-sniffer',
    humanReadableName: 'Нюх на уязвимости',
    description: 'Позволяет получить дополнительные фрагменты дампов, в зависимости от значения Attack',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['breacher-2'],
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
    karmaCost: 4,
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
    karmaCost: 4,
    prerequisites: ['stubbornness-1'],
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
    karmaCost: 4,
    prerequisites: ['stubbornness-2'],
    pack: { id: 'hack-deck-guru', level: 3 },
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 10 }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'persistent-deploy',
    humanReadableName: 'Persistent deploy',
    description:
      'новый ключ:install --persistent\nПозволяет применять ключ --persistant команды deploy\n\nключ позволяет агенту переживать обновлие хоста',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['sly-1'],
    pack: { id: 'hack-deck-sly', level: 1 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'shadow-deploy',
    humanReadableName: 'Shadow deploy',
    description:
      'новый ключ:install --shadow\nПозволяет применять ключ --shadow команды deploy\n\nключ затрудняет обнаружение агента (зависит от значения Sleaze ищущего)',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['sly-2'],
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
    karmaCost: 4,
    prerequisites: ['fencer-1'],
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
    karmaCost: 4,
    prerequisites: ['quick-to-enter-1', 'fencer-2'],
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
    karmaCost: 4,
    prerequisites: ['quick-to-enter-2', 'fencer-3'],
    pack: { id: 'hack-deck-fencer', level: 3 },
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: 10 }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'flee',
    humanReadableName: 'flee',
    description:
      'новая команда:flee\nПозволяет попытаться сбежать из линклока. \n\nЗависит от соотношения значений  вашего Sleaze и Attack цели',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['sly-2'],
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
    karmaCost: 4,
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
    karmaCost: 4,
    prerequisites: ['breacher-1'],
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
    karmaCost: 8,
    prerequisites: ['breacher-2'],
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
    karmaCost: 2,
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
    karmaCost: 4,
    prerequisites: ['fencer-1'],
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
    karmaCost: 4,
    prerequisites: ['fencer-2'],
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
    karmaCost: 4,
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
    karmaCost: 4,
    prerequisites: ['sly-1'],
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
    karmaCost: 8,
    prerequisites: ['sly-2'],
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
    karmaCost: 4,
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
    karmaCost: 4,
    prerequisites: ['miner-1'],
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
    karmaCost: 8,
    prerequisites: ['miner-2'],
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
      'новая команда: burn\nПозволяет наносить урон кибердеке противника, повреждать ее моды\n\nУрон зависит от соотношения значений вашей Attack и Firewall цели',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'arpscan',
    humanReadableName: 'arpscan',
    description:
      'новая команда:feelmatrix\nВыводит список всех Персон, находящихся на хосте\n\nВысокие значения Sleaze или специальные спосбности могут обмануть эту команду',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['stubbornness-2'],
    pack: { id: 'hack-deck-guru', level: 2 },
    modifier: [],
  },
  // IT: команда в кривда-матрице
  {
    id: 'steal',
    humanReadableName: 'steal',
    description:
      'новая команда: steal\n\nНаходясь на ноде PAN хоста с определенным API, позволяет осуществить перевод автоматически определяемой суммы денег\n\nСумма зависит от значенияй ваших характеристик Sleaze и Dataprocessing',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['miner-1'],
    pack: { id: 'hack-deck-miner', level: 2 },
    modifier: [],
  },
  // IT: ключ команды в кривда-матрице
  {
    id: 'steal-pro',
    humanReadableName: 'Фрод профи',
    description:
      'Новый ключ: steal --enterprize:\nработа с кошельками юр лиц\nНовый ключ: steal --comment\nпозволяет ввести текст "основания перевода", вместо билиберды по умолчанию\n\nувеличивает сумму кражи',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['steal'],
    pack: { id: 'hack-deck-miner', level: 2 },
    modifier: [],
  },
  // IT: ключ команды в кривда-матрице
  {
    id: 'steal-expert',
    humanReadableName: 'Фрод эксперт',
    description: 'Новый ключ: steal --SIN:\n\n--SIN: переводит сумму на другой SIN\n\nдополнительно увеличивает сумму кражи',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['steal-pro'],
    pack: { id: 'hack-deck-miner', level: 3 },
    modifier: [],
  },
  // IT:
  // [+5] Хакер_число_админ_хостов
  {
    id: 'quarter-god',
    humanReadableName: 'Четвертак',
    description:
      'Русское название для слэнга "qouterGOD", шутливое название для серьезных людей: профессиональных контракторов по частной защиты Хостов.\n\nЕще 5 хостов, на защиту которых ты можешь подписаться',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['stubbornness-2'],
    pack: { id: 'hack-deck-guru', level: 3 },
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 5 }),
  },
  // Комулятивно добавляет устойчивость к фейдингу при компиляции спрайтов
  //
  // IT:
  // [+20] Техномант_Устойчивость_Фейдингу_Компиляция
  {
    id: 'deep-compile',
    humanReadableName: 'Глубокая компиляция',
    description: 'Тебе проще компилировать спрайты',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technoshaman'],
    pack: { id: 'hack-shaman-breacher', level: 2 },
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
    humanReadableName: 'Нативная компиляция',
    description: 'Тебе намного проще компилировать спрайты',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technoshaman'],
    pack: { id: 'hack-shaman-breacher', level: 3 },
    modifier: modifierFromEffect(increaseCompilationFadingResistance, {
      amount: 30,
    }),
  },
  //
  // IT:
  // [+1] Техномант_Уровень_Спрайтов
  {
    id: 'sprites-1',
    humanReadableName: 'Спрайты-1',
    description: 'Ты можешь компилировать спрайты 1 уровня',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['arch-hackerman-technoshaman'],
    pack: { id: 'hack-shaman-breacher', level: 1 },
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  //
  // IT:
  // [+1] Техномант_Уровень_Спрайтов
  {
    id: 'sprites-2',
    humanReadableName: 'Спрайты-2',
    description: 'Ты можешь компилировать спрайты 2 уровня',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['sprites-1'],
    pack: { id: 'hack-shaman-breacher', level: 2 },
    modifier: modifierFromEffect(increaseSpriteLevel, { amount: 1 }),
  },
  //
  // IT:
  // [+1] Техномант_Уровень_Спрайтов
  {
    id: 'sprites-3',
    humanReadableName: 'Спрайты-3',
    description: 'Ты можешь компилировать спрайты 3 уровня',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['sprites-2'],
    pack: { id: 'hack-shaman-breacher', level: 3 },
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
    prerequisites: ['arch-face-geshaftmacher'],
    pack: { id: 'face-geshaftmacher-trader', level: 1 },
    modifier: [],
  },
  // У гм на экране экономики отображаются  его текущие множители скоринга.
  {
    id: 'my-scoring',
    humanReadableName: 'Мой скоринг',
    description: 'отображается  текущий коэф. скоринга данного персонажа',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-face-geshaftmacher'],
    pack: { id: 'face-geshaftmacher-banker', level: 1 },
    modifier: [],
  },
  // После списания рентных платежей гм получает кэшбек в размере 2% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-1',
    humanReadableName: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 2% от всех своих рентных платежей.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-face-geshaftmacher'],
    pack: { id: 'face-geshaftmacher-trader', level: 1 },
    modifier: modifierFromEffect(increaseStockGainPercentage, { amount: 2 }),
  },
  // После списания рентных платежей гм получает кэшбек в размере 5% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-2',
    humanReadableName: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 5% от всех своих рентных платежей.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-face-geshaftmacher', 'igra-na-birge-1'],
    pack: { id: 'face-geshaftmacher-trader', level: 2 },
    modifier: modifierFromEffect(increaseStockGainPercentage, {
      amount: 5 - 2,
    }),
  },
  // После списания рентных платежей гм получает кэшбек в размере 13% от списанной суммы. Начисляется после каждого списания рентных платежей.
  {
    id: 'igra-na-birge-3',
    humanReadableName: 'Игра на бирже',
    description: 'ты получаешь кэшбэк 13% от всех своих рентных платежей.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-face-geshaftmacher', 'igra-na-birge-2'],
    pack: { id: 'face-geshaftmacher-trader', level: 3 },
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
    prerequisites: ['arch-face-discursmonger', 'master-of-the-universe'],
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
    prerequisites: ['arch-face-discursmonger', 'master-of-the-universe'],
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
    prerequisites: ['arch-face-discursmonger', 'master-of-the-universe'],
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
    prerequisites: ['arch-face-discursmonger', 'master-of-the-universe'],
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
    prerequisites: ['arch-face-geshaftmacher'],
    pack: { id: 'face-geshaftmacher-trader', level: 1 },
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.9 }),
  },
  // Множитель 0,8 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-2',
    humanReadableName: 'Скидосы - 20%',
    description: 'Скидка. Стоимость товара умножается на 0,8 при покупке любого товара',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-face-geshaftmacher', 'discount-all-1'],
    pack: { id: 'face-geshaftmacher-trader', level: 2 },
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.8 }),
  },
  // Множитель 0,7 при покупке любого товара  данным персонажем
  {
    id: 'discount-all-3',
    humanReadableName: 'Скидосы - 30%',
    description: 'Скидки Стоимость товара умножается на 0,7 при покупке любого товара ',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-face-geshaftmacher', 'discount-all-2'],
    pack: { id: 'face-geshaftmacher-trader', level: 3 },
    modifier: modifierFromEffect(multiplyAllDiscounts, { amount: 0.7 }),
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
    description: 'Подвластная тебе Мощь увеличивается',
    availability: 'master',
    karmaCost: 40,
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-combat', level: 2 },
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-2',
    humanReadableName: 'Магия 2',
    description: 'Подвластная тебе Мощь увеличивается',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['magic-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-3',
    humanReadableName: 'Магия 3',
    description: 'Подвластная тебе Мощь увеличивается',
    availability: 'master',
    karmaCost: 50,
    prerequisites: ['magic-2', 'spirit-enemy-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-4',
    humanReadableName: 'Магия 4',
    description: 'Подвластная тебе Мощь увеличивается',
    availability: 'master',
    karmaCost: 70,
    prerequisites: ['magic-3', 'spirit-enemy-2'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-5',
    humanReadableName: 'Магия 5',
    description: 'Подвластная тебе Мощь увеличивается',
    availability: 'master',
    karmaCost: 90,
    prerequisites: ['magic-4', 'spirit-enemy-3'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. То есть от базового получается 1*0.9=0.9)
  {
    id: 'magic-feedback-resistance-1',
    humanReadableName: 'Сопротивление Откату 1',
    description: 'Ты легче выносишь Откат',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-combat', level: 2 },
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимого СопрОткату1 коэффициентСопротивленияОткату = 1*0.9*0.9=0.81)
  {
    id: 'magic-feedback-resistance-2',
    humanReadableName: 'Сопротивление Откату 2',
    description: 'Ты легче выносишь Откат',
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
    description: 'Ты легче выносишь Откат',
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
    description: 'Ты тяжелее выносишь Откат',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-mage-spellcaster'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимого Откатошный1 коэффициентСопротивленияОткату = 1*1.2*1.2=1.44)
  {
    id: 'magic-feedback-unresistance-2',
    humanReadableName: 'Откатошный 2',
    description: 'Ты тяжелее выносишь Откат',
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
    description: 'Ты тяжелее выносишь Откат',
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
    description: 'Магия возвращается к тебе быстрее',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-simpatic', level: 2 },
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже был взят Воспрянь и пой 1, то КоэффициентВосстановленияМагии станет 1*1.2*1.2=1.44
  {
    id: 'magic-recovery-2',
    humanReadableName: 'Воспрянь и пой 2',
    description: 'Магия возвращается к тебе быстрее',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-recovery-1'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже были Воспрянь и пой 1-2, КоэффициентВосстановленияМагии станет 1*1.2*1.2*1.2=1.728
  {
    id: 'magic-recovery-3',
    humanReadableName: 'Воспрянь и пой 3',
    description: 'Магия возвращается к тебе быстрее',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-recovery-2'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-1',
    humanReadableName: 'Дружелюбие духов 1',
    description: 'Ты понимаешь настроения духов',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 0.8,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 0.8
  {
    id: 'spirit-friend-2',
    humanReadableName: 'Дружелюбие духов 2',
    description: 'Ты понимаешь настроения духов',
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
    description: 'Ты понимаешь настроения духов',
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
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
    modifier: modifierFromEffect(multiplySpiritResistanceMultiplier, {
      amount: 1.3,
    }),
  },
  // В Коэффициент Сопротивления Духов у мага перманентно добавляется множитель 1.3
  {
    id: 'spirit-enemy-2',
    humanReadableName: 'Духопротивный 2',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
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
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
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
    description: 'След твоих заклинаний содержит меньше ауры',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-simpatic', level: 1 },
    modifier: modifierFromEffect(increaseAuraMarkMultiplier, { amount: -0.4 }),
  },
  // Позволяет просканировать во время каста qr-коды мясных тел в состоянии тяжран (не годятся здоров/КС/АС) и с Эссенсом>=1ед для эффекта "кровавый ритуал":  Использование (сканирование) N этих кодов приводит к:
  //  1) временному (на T минут) появлению пассивной абилки "Магия в крови" (amount = √N)
  // 2) временному (на T минут) появлению пассивной способности "Кровавый Прилив", добавляющей в КоэффициентСопротивленияОткату множитель K=1/(6+N).
  // T = N*5 минут.
  // Жертва теряет 1ед Эссенса и переходит в КС и в этом состоянии для повторного использования в другом таком же ритуале непригодна.
  {
    id: 'bathory-charger',
    humanReadableName: 'Bathory Charger',
    description:
      'Использование металюдей для увеличения Мощи и снижения Отката заклинаний на некоторое время. Чем больше жертв использовано, тем больше эффект',
    availability: 'closed',
    karmaCost: 70,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  // Обладатель абилки при анализе следов заклинаний (заклинания Trackpoint, Trackball, Know each other, Panopticon, Tweet-tweet little bird), извлекает значение ауры на 20% больше. Например, если заклинание было скастовано с такой Мощью, что должно было извлечь 10 символов, то с этой абилкой будет извлечено 12. То есть Коэффициент чтения астральных следов у этого мага равен 1.2.
  {
    id: 'dictator-control',
    humanReadableName: 'Dictator Control',
    description: 'При чтении астральных следов извлекается больше ауры',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-astralog', level: 1 },
    modifier: modifierFromEffect(increaseAuraReadingMultiplier, {
      amount: 0.2,
    }),
  },
  // - Когда qr-код обладателя такой способности сканируют во время ритуала, он считается за 3х человек.
  {
    id: 'agnus-dei',
    humanReadableName: 'Agnus dei ',
    description: 'В ритуальном хоре твой голос неоценим.',
    availability: 'open',
    karmaCost: 90,
    prerequisites: ['arch-mage-adeptus'],
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
    prerequisites: ['arch-mage-spellcaster'],
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
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
    modifier: [],
  },
  // Intelligence -1
  {
    id: 'arch-rigger-negative-1',
    humanReadableName: 'Проблемы риггера - 1',
    description: 'У тебя проблемы, ригга.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-rigger'],
    pack: { id: 'rigger-badfate', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 })],
  },
  // Intelligence -1
  // Body -1
  //
  {
    id: 'arch-rigger-negative-2',
    humanReadableName: 'Проблемы риггера - 2',
    description: 'У тебя серьезные проблемы, ригга.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-rigger-negative-1'],
    pack: { id: 'rigger-badfate', level: 2 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: -1 }), modifierFromEffect(increaseBody, { amount: -1 })],
  },
  // Intelligence -2
  // Body-2
  // DroneFeedback3 = 1
  {
    id: 'arch-rigger-negative-3',
    humanReadableName: 'Проблемы риггера - 3',
    description: 'У тебя очень серьезные проблемы, ригга.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-rigger-negative-2'],
    pack: { id: 'rigger-badfate', level: 3 },
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
    humanReadableName: 'Медицинские дроны 1',
    description: 'Улучшает управление медикартом.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-rigger-medic', 'medicart-active'],
    pack: { id: 'rigger-medic-combat', level: 1 },
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
    humanReadableName: 'Медицинские дроны 2',
    description: 'Позволяет управление сложными медикартами.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger-medic', 'medicraft-1'],
    pack: { id: 'rigger-medic-combat', level: 2 },
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 4 }),
    ],
  },
  // drones.medicraftBonus +8
  // drones.maxTimeInside +10
  // drones.recoveryTime -10
  // drones.aircraftBonus = +4
  // drones.groundcraftBonus = +4
  {
    id: 'medicraft-3',
    humanReadableName: 'Медицинские дроны 3',
    description: 'Позволяет управление самыми сложными медикартами и немного улучшает навык для всех остальных типов дронов.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger-medic', 'medicraft-2'],
    pack: { id: 'rigger-medic-combat', level: 3 },
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
      modifierFromEffect(increaseMedicraftBonus, { amount: 4 }),
    ],
  },
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами грейда
  // биовэр.
  // rigging.implantsBonus+4
  {
    id: 'auto-doc-neuro',
    humanReadableName: 'нейрохирургия',
    description: 'Ты можешь использовать автодок для работы с биовэром',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger-medic', 'auto-doc-3'],
    modifier: [modifierFromEffect(increaseImplantDifficultyBonus, { amount: 2 }), modifierFromEffect(allowBiowareInstallation, {})],
  },
  // rigging.tuningBonus +2
  {
    id: 'tuning-1',
    humanReadableName: 'Тюнинг 1',
    description: 'Ты можешь ставить простые моды.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['tuning-active', 'arch-rigger-engineer', 'master-of-the-universe'],
    pack: { id: 'rigger-eng-mech', level: 1 },
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 2 })],
  },
  // rigging.tuningBonus +2
  {
    id: 'tuning-2',
    humanReadableName: 'Тюнинг 2',
    description: 'Ты можешь ставить сложные моды.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['tuning-1', 'arch-rigger-engineer', 'master-of-the-universe'],
    pack: { id: 'rigger-eng-mech', level: 2 },
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 2 })],
  },
  // rigging.tuningBonus +4
  {
    id: 'tuning-3',
    humanReadableName: 'Тюнинг 3',
    description: 'Ты можешь ставить самые сложные моды.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['tuning-2', 'arch-rigger-engineer', 'master-of-the-universe'],
    pack: { id: 'rigger-eng-mech', level: 3 },
    modifier: [modifierFromEffect(increaseTuningBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +2
  {
    id: 'repoman-1',
    humanReadableName: 'Было ваше - стало наше 1',
    description: 'Ты можешь снимать простые импланты.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-rigger-medic', 'repoman-active'],
    pack: { id: 'rigger-medic-repo', level: 1 },
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +2
  {
    id: 'repoman-2',
    humanReadableName: 'Было ваше - стало наше 2',
    description: 'Ты можешь снимать сложные импланты.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger-medic', 'repoman-1'],
    pack: { id: 'rigger-medic-repo', level: 2 },
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // rigging.repomanBonus +4
  {
    id: 'repoman-3',
    humanReadableName: 'Было ваше - стало наше 3',
    description: 'Ты можешь снимать самые сложные импланты.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger-medic', 'repoman-2'],
    pack: { id: 'rigger-medic-repo', level: 3 },
    modifier: [modifierFromEffect(increaseRepomanBonus, { amount: 4 })],
  },
  // drones.aircraftBonus =  +2
  {
    id: 'aircraft-1',
    humanReadableName: 'Воздушные дроны 1',
    description: 'Улучшает управление воздушными дронами.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['aircraft-active', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-air', level: 1 },
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 2 })],
  },
  // drones.aircraftBonus = +4
  {
    id: 'aircraft-2',
    humanReadableName: 'Воздушные дроны 2',
    description: 'Улучшает управление сложными воздушными дронами.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['aircraft-1', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-air', level: 2 },
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  // drones.aircraftBonus = +4
  {
    id: 'aircraft-3',
    humanReadableName: 'Воздушные дроны 3',
    description: 'Улучшает управление самыми сложными воздушными дронами.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['aircraft-2', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-air', level: 3 },
    modifier: [modifierFromEffect(increaseAircraftBonus, { amount: 4 })],
  },
  // drones.groundcraftBonus = +2
  {
    id: 'groundcraft-1',
    humanReadableName: 'Наземные дроны-1',
    description: 'Улучшает управление наземными дронами.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['groundcraft-active', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-ground', level: 1 },
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 2 })],
  },
  // drones.groundcraftBonus = +4
  {
    id: 'groundcraft-2',
    humanReadableName: 'Наземные дроны-2',
    description: 'Улучшает управление сложными наземными дронами.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['groundcraft-1', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-ground', level: 2 },
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  // drones.groundcraftBonus = +4
  {
    id: 'groundcraft-3',
    humanReadableName: 'Наземные дроны-3',
    description: 'Улучшает управление самыми сложными наземными дронами.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['groundcraft-2', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-ground', level: 3 },
    modifier: [modifierFromEffect(increaseGroundcraftBonus, { amount: 4 })],
  },
  // drones.maxTimeInside  +10
  // drones.recoveryTime= -10
  {
    id: 'drone-sync-1',
    humanReadableName: 'Синхронизация 1',
    description: 'Увеличивает время в дроне и сокращает перерыв между включениями.',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-sync', level: 1 },
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
    ],
  },
  // drones.maxTimeInside +20
  // drones.recoveryTime -20
  {
    id: 'drone-sync-2',
    humanReadableName: 'Синхронизация 2',
    description: 'Сильнее увеличивает время в дроне и сокращает перерыв между включениями.',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['drone-sync-1', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-sync', level: 2 },
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  // drones.maxTimeInside  +20
  // drones.recoveryTime-20
  {
    id: 'drone-sync-3',
    humanReadableName: 'Синхронизация 3',
    description: 'Намного сильнее увеличивает время пребывания в дроне и сокращает перерыв между включениями.',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['drone-sync-2', 'arch-rigger-pilot'],
    pack: { id: 'rigger-pilot-sync', level: 3 },
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  // Повышает защиту от ментальных заклинаний
  // Модификатор: МентальнаяЗащита +3
  {
    id: 'mental-resistance',
    humanReadableName: 'Контроль разума',
    description: 'Немного повышает защиту от ментальных воздействий.',
    availability: 'closed',
    karmaCost: 60,
    prerequisites: ['arch-samurai-fighter', 'chemo-resistance'],
    pack: { id: 'sam-fight-harden', level: 3 },
    modifier: modifierFromEffect(increaseMentalProtection, { amount: 3 }),
  },
  // повышает порог кризисной ситуации при употреблении химоты
  // Модификатор: ХимотаКризис порог +10
  {
    id: 'chemo-resistance',
    humanReadableName: 'сопротивляемость химоте',
    description: 'Дает устойчивость к негативным эффектам при употреблении препаратов.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-fighter', 'hardened-1'],
    pack: { id: 'sam-fight-harden', level: 2 },
    modifier: modifierFromEffect(increaseСhemoCrysisThreshold, { amount: 10 }),
  },
  // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Implement corresponding mechanic
  // Отбивает с шансом 50% попытку вырезать у тебя имплант.
  {
    id: 'thats-my-chrome',
    humanReadableName: 'это мой хром!',
    description: 'Импланты, установленные у тебя сложнее вырезать рипоменам.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Ускоряет респавн хитов после легкого ранения (45 минут все хиты)
  {
    id: 'faster-regen-1',
    humanReadableName: 'Здоровеньки булы 1',
    description: 'Ты восстанавливаешь все хиты за 45 минут',
    availability: 'closed',
    karmaCost: 40,
    prerequisites: ['arch-samurai'],
    modifier: [],
  },
  // Ускоряет респавн хитов после легкого ранения (30 минут все хиты)
  {
    id: 'faster-regen-2',
    humanReadableName: 'Здоровеньки булы 2',
    description: 'Ты восстанавливаешь все хиты за 30 минут',
    availability: 'closed',
    karmaCost: 40,
    prerequisites: ['faster-regen-1', 'arch-samurai'],
    modifier: [],
  },
  // разрешает игроку использовать гранаты
  {
    id: 'grenades-usage',
    humanReadableName: 'гранаты',
    description: 'разрешает использовать гранаты',
    availability: 'closed',
    karmaCost: 60,
    prerequisites: ['arch-samurai', 'arch-samurai-gunner'],
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
    description: 'Пушка. Легкая броня.',
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
    description: 'Видеокамера. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Коптер-Проектор
  {
    id: 'drone-project',
    humanReadableName: 'Дрон Коптер-Проектор',
    description: 'Проектор голограмм. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Коптер-Камикадзе
  {
    id: 'drone-kabuum',
    humanReadableName: 'Дрон Коптер-Камикадзе',
    description: 'Бадабум! Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Вертолет
  {
    id: 'drone-heli',
    humanReadableName: 'Дрон Вертолет',
    description: 'Может перевозить 3 персонажей. Легкая броня. Иммунитет к холодному оружию.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Медкарт
  {
    id: 'drone-medcart',
    humanReadableName: 'Дрон Медкарт',
    description: 'Медикарт. Легкая броня.',
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
    description: 'У вас тяжелая броня.',
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
    availability: 'master',
    karmaCost: 0,
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
    description: 'Ты очень хорошо сопротивляешься Откату',
    availability: 'closed',
    karmaCost: 20,
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
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
  // Абилка ничего не делает, просто показывает текст "какое-то одно оружие в руках считается тяжелым" (необходима его маркировка красной лентой)
  {
    id: 'pencil',
    humanReadableName: 'PENCIL',
    description: 'Одно оружие в руках считается тяжёлым',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "броня считается тяжелым" (необходима её маркировка красной лентой)
  {
    id: 'stone-skin-result',
    humanReadableName: 'Stone skin',
    description: 'Имеющаяся броня считается тяжёлой',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
  //  грейда альфа и бета и лечить тяжран.
  // rigging.implantsBonus+2
  {
    id: 'auto-doc-1',
    humanReadableName: 'хирургия 1',
    description: 'Ты можешь ставить простые импланты',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-rigger-medic'],
    pack: { id: 'rigger-medic-bio', level: 1 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
  //  грейда гамма и лечить тяжран.
  // rigging.implantsBonus+2
  {
    id: 'auto-doc-2',
    humanReadableName: 'хирургия 2',
    description: 'Ты можешь ставить сложные импланты',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger-medic', 'auto-doc-1'],
    pack: { id: 'rigger-medic-bio', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Находясь в альтернативном теле "автодок" риггер может делать манипуляции с имплантами
  //  грейда дельта и лечить тяжран
  // rigging.implantsBonus+2
  {
    id: 'auto-doc-3',
    humanReadableName: 'хирургия 3',
    description: 'Ты можешь ставить высокотехнологичные импланты',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger-medic', 'auto-doc-2'],
    pack: { id: 'rigger-medic-bio', level: 3 },
    modifier: [],
  },
  // формальная абилка, которая показывает, что риггер подключен к дрону. Вроде бы не нужна, но на нее наверное можно навесить всякие нужные параметры, циферки и что-то еще что надо будет показывать.
  // Кроме того, это обязательный пререквизит для всех дроновских абилок
  {
    id: 'in-drone',
    humanReadableName: 'Статус: Подключен к дрону',
    description: 'Статус: Подключен к дрону',
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
    description: 'Ты часть проекции Искусственного Интеллекта. Твое тело сгусток программ и кода, живущий в Матрице. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-AI', level: 1 },
    modifier: [],
  },
  // magic-blockade
  // base-body-digital
  // current-body-digital
  {
    id: 'meta-eghost',
    humanReadableName: 'Электронный призрак',
    description: 'Ты цифровой разум. Твое тело сгусток программ и кода, живущий в Матрице. ',
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
  // Body +1
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
  // Intelligence +1
  {
    id: 'arch-rigger-medic',
    humanReadableName: 'Аспект: Риггер Медик',
    description: 'Медик. Ты знаешь всё про полевую медицину и импланты.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger'],
    pack: { id: 'gen-arch-rigger-medic', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // Intelligence +1
  {
    id: 'arch-rigger-engineer',
    humanReadableName: 'Аспект: Риггер Инженер',
    description: 'Инженер. Химия, дроны, кибердеки и их модификация.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger'],
    pack: { id: 'gen-arch-rigger-engineer', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // Body +1
  {
    id: 'arch-rigger-pilot',
    humanReadableName: 'Аспект: Риггер Пилот',
    description: 'Пилот. Умеешь управлять дронами.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger', '!tech-blockade'],
    pack: { id: 'gen-arch-rigger-pilot', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
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
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseIntelligence, { amount: 2 })],
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
  // Strength +1
  {
    id: 'arch-samurai-gunner',
    humanReadableName: 'Аспект: Самурай Стрелок',
    description: 'Стрелок. Огнестрельное оружие - твой путь.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai'],
    pack: { id: 'gen-arch-samurai-gunner', level: 1 },
    modifier: [modifierFromEffect(increaseStrength, { amount: 1 })],
  },
  // Body +1
  {
    id: 'arch-samurai-fighter',
    humanReadableName: 'Аспект: Самурай Громила',
    description: 'Громила. Холодное оружие и несокрушимая броня - твой путь.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai'],
    pack: { id: 'gen-arch-samurai-fighter', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // Intelligence +1
  {
    id: 'arch-samurai-assasin',
    humanReadableName: 'Аспект: Самурай Ассасин',
    description: 'Ассасин. Уловки и хитрости - твой путь.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai'],
    pack: { id: 'gen-arch-samurai-assasin', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
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
    id: 'arch-hackerman',
    humanReadableName: 'Архетип: Хакер',
    description: 'Хакер, владыка Матрицы!',
    availability: 'open',
    karmaCost: 100,
    prerequisites: [],
    pack: { id: 'gen-arch-hackerman', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // Intelligence +1
  {
    id: 'arch-hackerman-decker',
    humanReadableName: 'Аспект: Хакер Декер',
    description: 'Ты постиг премудрости работы с кибердекой и научился использовать gUmMMy протокол!',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-hackerman'],
    pack: { id: 'gen-arch-hackerman-decker', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  //
  {
    id: 'arch-hackerman-technomancer',
    humanReadableName: 'Аспект: Хакер Техномант',
    description: 'Ты теперь чувствуешь Матрицу. Обычные люди на такое не способны.',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman', '!arch-mage', '!tech-blockade', 'master-of-the-universe'],
    pack: { id: 'gen-arch-hackerman-technomancer', level: 1 },
    modifier: [],
  },
  // resonance +1
  {
    id: 'arch-hackerman-cyberadept',
    humanReadableName: 'Аспект: Техномант Киберадепт',
    description: 'Техномант боец. ',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-hackerman-technomancer', 'master-of-the-universe'],
    pack: { id: 'gen-arch-hackerman-cyberadept', level: 1 },
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // resonance +1
  {
    id: 'arch-hackerman-technoshaman',
    humanReadableName: 'Аспект: Техномант Техношаман',
    description: 'Техномант, специалист по Комплексным формам.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-hackerman-technomancer', 'master-of-the-universe'],
    pack: { id: 'gen-arch-hackerman-technoshaman', level: 1 },
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // Intelligence +2
  {
    id: 'arch-hackerman-decker-boost',
    humanReadableName: 'Опытный Декер',
    description: 'Очень опытный хакер декер.',
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
    description: 'Очень опытный хакер техномант.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer', 'master-of-the-universe'],
    pack: { id: 'gen-arch-hackerman-technomancer-boost', level: 1 },
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
  // Body +1
  {
    id: 'arch-mage-adeptus',
    humanReadableName: 'Аспект: Маг Адепт',
    description: 'Маг адепт. Твои способности выходят за грань доступного метачеловеку, но заклинания ограничены.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-mage'],
    pack: { id: 'gen-arch-mage-adeptus', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 1 })],
  },
  // magic  +1
  {
    id: 'arch-mage-spellcaster',
    humanReadableName: 'Аспект: Маг Заклинатель',
    description: 'Маг заклинатель. Снимаю, порчу, колдую.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-mage'],
    pack: { id: 'gen-arch-mage-spellcaster', level: 1 },
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // magic  +1
  {
    id: 'arch-mage-summoner',
    humanReadableName: 'Аспект: Маг Призыватель',
    description: 'Маг призыватель. Духи и зачарования.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-mage'],
    pack: { id: 'gen-arch-mage-summoner', level: 1 },
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
  // charisma +1
  {
    id: 'arch-face',
    humanReadableName: 'Архетип: Фейс',
    description: 'Фейс, эксперт по переговорам.',
    availability: 'open',
    karmaCost: 100,
    prerequisites: [],
    pack: { id: 'gen-arch-face', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  // charisma +1
  {
    id: 'arch-face-mentalist',
    humanReadableName: 'Аспект: Фейс Менталист',
    description: 'Менталист. Очень, очень убедителен. И это не просто так.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-face'],
    pack: { id: 'gen-arch-face-mentalist', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  // charisma +1
  {
    id: 'arch-face-discursmonger',
    humanReadableName: 'Аспект: Фейс Дискурсмонгер',
    description: 'Дискурсмонгер. Идеи, концепции и убеждения, твоя работа.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-face', 'master-of-the-universe'],
    pack: { id: 'gen-arch-face-discursmonger', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
  },
  // charisma +1
  {
    id: 'arch-face-geshaftmacher',
    humanReadableName: 'Аспект: Фейс Гешефтмахер',
    description: 'Гешефтмахер. Контракты и нюйены интересуют тебя.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-face'],
    pack: { id: 'gen-arch-face-geshaftmacher', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 1 })],
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
    description: 'Экзорцист может изгнать тебя с ближнего астрала на темные и глубокие астральные планы. И, возможно, надолго.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-spirit', level: 1 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'guns-1',
    humanReadableName: 'дальнобойное оружие: винтовки',
    description: 'ты можешь использовать винтовки',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-gunner'],
    pack: { id: 'sam-gun-guns', level: 1 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'guns-2',
    humanReadableName: 'дальнобойное оружие: автоматы',
    description: 'ты можешь использовать автоматы',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-gunner', 'guns-1'],
    pack: { id: 'sam-gun-guns', level: 2 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'guns-3',
    humanReadableName: 'дальнобойное оружие: пулеметы',
    description: 'ты можешь использовать пулемёты',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-gunner', 'guns-2'],
    pack: { id: 'sam-gun-guns', level: 3 },
    modifier: [],
  },
  // усложняет вырезание имплантов рипоменами при применении абилок  repoman-black и repoman-active. С вероятностью неудачи 50%
  {
    id: 'armor-1',
    humanReadableName: 'броня: подкожная броня',
    description: 'Слой подкожной брони самурая сильно мешает рипоменам удалять имеющиеся импланты',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['arch-samurai-gunner'],
    pack: { id: 'sam-gun-armor', level: 1 },
    modifier: [modifierFromEffect(setImplantsRemovalResistance, { amount: 50 })],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'armor-2',
    humanReadableName: 'броня: легкая броня',
    description: 'Постоянные тренировки ловкости и силы привели к тому, что тебя не стесняет легкая броня',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['arch-samurai-gunner', 'armor-1'],
    pack: { id: 'sam-gun-armor', level: 2 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'armor-3',
    humanReadableName: 'броня: тяжелая броня',
    description: 'Продолжая тренировки ты пришел к тому, что теперь и в тяжелой броне чувствуешь себя отлично',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['arch-samurai-gunner', 'armor-2'],
    pack: { id: 'sam-gun-armor', level: 3 },
    modifier: [],
  },
  // усложняет вырезание имплантов рипоменами при применении абилок  repoman-black и repoman-active, с вероятностью неудачи 40%
  {
    id: 'constitution-1',
    humanReadableName: ' родство с имплантами',
    description: 'Генетика самурая позволяет телу принимать импланты, как часть себя, усложняя их удаление рипоменами',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-gunner'],
    pack: { id: 'sam-gun-constitution', level: 1 },
    modifier: [modifierFromEffect(setImplantsRemovalResistance, { amount: 40 })],
  },
  // показывает игроку текст абилки, больше ничего
  // хиты в легком ранении восстанавливаются за 20 минут
  {
    id: 'constitution-2',
    humanReadableName: 'регенерация',
    description:
      'Благодаря врожденным мутациям или магической анамалии самруай может восстанавливаться от ран без использования дополнительного оборудования. \r\nХиты в легком ранении восстанавливаются за 20 минут\r\n',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-gunner', 'constitution-1'],
    pack: { id: 'sam-gun-constitution', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Если самурай находится в состоянии "тяжелое ранение" и не добит в течение 3 минут, персонаж встает из тяжрана в здоров. Через 30 минут после восстановления переходит в состояние КС.
  {
    id: 'constitution-3',
    humanReadableName: 'всплеск адреналина',
    description:
      'В критическом состоянии организм самурая выдает резкий выброс адреналина в кровь, что позволяет бойцу продолжить бой даже со смертельным ранением. Чаще всего все равно заканчивается смертью. Если в тяжране не провели добивание за 3 минуты - сам встает из тяжрана. Через 30 минут падает в КС',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-gunner', 'constitution-2'],
    pack: { id: 'sam-gun-constitution', level: 3 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: "clubs'n'swords-1",
    humanReadableName: 'холодное оружие: дубинки',
    description:
      'Самурай обучен пользоваться дубинками, возможно сказывается опыт работы в силовых структурах, возможно, уличная жизнь и привычка махать бейсбольной битой',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-fighter'],
    pack: { id: 'sam-fight-swords', level: 1 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: "clubs'n'swords-2",
    humanReadableName: 'холодное оружие: мечи и топоры',
    description:
      'Самурай владеет техниками использования мечей и топоров. Изучение восточных боевых искуств или увлечение северной мифологией и викингами',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-fighter', "clubs'n'swords-1"],
    pack: { id: 'sam-fight-swords', level: 2 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: "clubs'n'swords-3",
    humanReadableName: 'холодное оружие: двуручное оружие',
    description:
      'Самурай достаточно силен, что бы управиться с двуручным оружием. Фламбер давно не появлялся на улицах городов, но, что мешает попробовать',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-fighter', "clubs'n'swords-2"],
    pack: { id: 'sam-fight-swords', level: 3 },
    modifier: [],
  },
  // усложняет вырезание имплантов рипоменами при применении абилок  repoman-black и repoman-active,  с вероятностью неудачи 50%
  {
    id: 'combat-armor-1',
    humanReadableName: 'броня: подкожная броня',
    description: 'Слой подкожной брони самурая сильно мешает рипоменам удалять имеющиеся импланты',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['arch-samurai-fighter'],
    pack: { id: 'sam-fight-armor', level: 1 },
    modifier: [modifierFromEffect(setImplantsRemovalResistance, { amount: 50 })],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'combat-armor-2',
    humanReadableName: 'броня: легкая броня',
    description: 'Постоянные тренировки ловкости и силы привели к тому, что тебя не стесняет легкая броня',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['arch-samurai-fighter', 'combat-armor-1'],
    pack: { id: 'sam-fight-armor', level: 2 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'combat-armor-3',
    humanReadableName: 'броня: тяжелая броня',
    description: 'Продолжая тренировки ты пришел к тому, что теперь и в тяжелой броне чувствуешь себя отлично',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['arch-samurai-fighter', 'combat-armor-2'],
    pack: { id: 'sam-fight-armor', level: 3 },
    modifier: [],
  },
  // усложняет вырезание имплантов рипоменами при применении абилок  repoman-black и repoman-active,  с вероятностью неудачи 40%
  {
    id: 'hardened-1',
    humanReadableName: 'Крепкий и надежный: родство с имплантами',
    description: 'Генетика самурая позволяет телу принимать импланты, как часть себя, усложняя их удаление рипоменами',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-fighter'],
    pack: { id: 'sam-fight-harden', level: 1 },
    modifier: [modifierFromEffect(setImplantsRemovalResistance, { amount: 40 })],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'tools-of-trade-1',
    humanReadableName: 'Оружие ассасина: дубинки, автоматы',
    description:
      'Скорее громила, чем скрытный убийца, самурай привык пользоваться простейшим оружием ближнего боя и скорострельным оружием дальнего боя',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-assasin'],
    pack: { id: 'sam-assa-tools', level: 1 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'tools-of-trade-2',
    humanReadableName: 'Оружие ассасина: мечи, топоры, винтовки',
    description:
      'Точность и смертоносность. Самурай использует смертоносные мечи и топоры, а также прекрасно управляется со снайперскими винтовками',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-assasin', 'tools-of-trade-1'],
    pack: { id: 'sam-assa-tools', level: 2 },
    modifier: [],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'tools-of-trade-3',
    humanReadableName: 'Оружие ассасина: оружие в каждой руке',
    description:
      'Тренируя ловкость и координацию самурай изучает технику владения оружием обеими руками, что позволяет одновременно использовать и огнестрельное и холодное оружие, или оружие одного типа в двух руках',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai-assasin', 'tools-of-trade-2'],
    pack: { id: 'sam-assa-tools', level: 3 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Применяется к мясному телу в состоянии "тяжело ранен" - переводит его в состояние КС.
  //
  {
    id: 'executioner-1',
    humanReadableName: 'Палач: быстрое добивание',
    description:
      'Способность быстро уничтожить выбранную цель не поднимая лишнего шума высоко ценится среди самураев-ассасинов. Настоящий профи может убить нескольких человек в считанные минуты',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-samurai-assasin'],
    pack: { id: 'sam-assa-execut', level: 1 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // показывает игроку текст абилки, больше ничего
  {
    id: 'executioner-2',
    humanReadableName: 'Палач: оглушение',
    description:
      'Понимание анатомии метачеловека, знание куда стоит ударить, что бы отправить противника в нокаут, отличительная черта любого самурая-ассасина, но требует большой практики. Ты можешь оглушить другого персонажа в небоевой обстанаовке.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-samurai-assasin', 'executioner-1'],
    pack: { id: 'sam-assa-execut', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // показывает игроку текст абилки, больше ничего
  {
    id: 'executioner-3',
    humanReadableName: 'Палач: допрос',
    description: 'Порой, что бы добраться до истинной цели, приходится спросить дорогу. Ассасины мастера допросов',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-samurai-assasin', 'executioner-2'],
    pack: { id: 'sam-assa-execut', level: 3 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Позволяет снять чип (разрушить по игре) с оружия противника. показывает игроку текст абилки.
  {
    id: 'marauder-1',
    humanReadableName: 'Мародер: разоружение',
    description:
      'Не всегда стоит убивать каждого, кто встает на твоем пути, порой достаточно убедиться, что он не сможет выстрелить тебе в спину, уничтожив его оружие. Работает раз в час. Кулдаун 60 минут.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-samurai-assasin'],
    pack: { id: 'sam-assa-maraud', level: 1 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Сканирует тело, находящееся  в КС.
  // Со счета жертвы на счет самурая переводится 10% средств.
  {
    id: 'marauder-2',
    humanReadableName: 'Мародер: грабеж',
    description:
      'Говорят, что нет чести среди воров. И ведь правильно говорят. Если противник уже мертв, значит ему деньги уже не понадобятся. Работает раз в час. Кулдаун 60 минут.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-samurai-assasin', 'marauder-1'],
    pack: { id: 'sam-assa-maraud', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Позволяет снять и порвать чип (разрушить по игре) с брони противника. показывает игроку текст абилки.
  {
    id: 'marauder-3',
    humanReadableName: 'Мародер: разоблачение',
    description:
      'Броня защищает тело, и если иначе до него не добраться, значит надо разрушить броню. Ты можешь снять с противника и порвать (разрушить по игре) чип брони. Работает раз в час. Кулдаун 60 минут.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-samurai-assasin', 'marauder-2'],
    pack: { id: 'sam-assa-maraud', level: 3 },
    modifier: [],
  },
  // добавляем в список вещества с содержанием ( 230 - Интеллект * 10)  мг и больше
  {
    id: 'whats-in-the-body-2',
    humanReadableName: 'Что в чаммере - усиление',
    description: 'Ты видишь более тонкие составы в теле пациента.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-rigger-engineer', 'whats-in-the-body-1'],
    pack: { id: 'rigger-eng-chem', level: 2 },
    modifier: [modifierFromEffect(decreaseChemoSensitivity, { amount: 50 })],
  },
  // показываем в списке вещества с содержанием ( 130 - Интеллект * 10)   мг и больше
  {
    id: 'whats-in-the-body-3',
    humanReadableName: 'Что в чаммере - еще усиление',
    description: 'Ты видишь самые тонкие составы в теле пациента.',
    availability: 'open',
    karmaCost: 80,
    prerequisites: ['arch-rigger-engineer', 'whats-in-the-body-2'],
    pack: { id: 'rigger-eng-chem', level: 3 },
    modifier: [modifierFromEffect(decreaseChemoSensitivity, { amount: 100 })],
  },
  // TODO(aeremin): Implement and add modifier here
  // ментальная защита снижена на 3
  {
    id: 'arch-face-negative-1',
    humanReadableName: 'проблемы фейса-1',
    description: 'У тебя проблемы, фейс.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-face'],
    pack: { id: 'face-badfate', level: 1 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // эссенс снижен на 1
  {
    id: 'arch-face-negative-2',
    humanReadableName: 'проблемы фейса-2',
    description: 'У тебя серьезные проблемы, фейс.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-face-negative-1'],
    pack: { id: 'face-badfate', level: 2 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Харизма уменьшена на 1
  {
    id: 'arch-face-negative-3',
    humanReadableName: 'проблемы фейса-3',
    description: 'У тебя очень серьезные проблемы, фейс.',
    availability: 'master',
    karmaCost: -20,
    prerequisites: ['arch-face-negative-2'],
    pack: { id: 'face-badfate', level: 3 },
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
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
  // TODO(aeremin): Implement and add modifier here
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
  // TODO(aeremin): Implement and add modifier here
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
  // Отображает текст на экране персонажа
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
  // Отображает текст на экране персонажа
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
  // Отображает текст на экране персонажа
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
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-1-summ',
    humanReadableName: 'Магия 1-П!',
    description: 'Подвластная тебе Мощь увеличивается',
    availability: 'master',
    karmaCost: 80,
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 1 },
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-2-summ',
    humanReadableName: 'Магия 2-П!',
    description: 'Подвластная тебе Мощь увеличивается',
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
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Астрал: 2 меча, 1 щит"
  {
    id: 'astro-boy-summ',
    humanReadableName: 'Астробой-П!',
    description: 'В астральной боёвке 2 меча и 1 щит',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
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
  //
  {
    id: 'hack-deck-commander',
    humanReadableName: 'Командир',
    description:
      'Ты можешь создавать объединять декеров в команду.\nДекеры, входящие в команду перемещаются за лидером и не атакуют друг-друга френдли файером',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
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
  // IT: команда в кривда-матрице
  {
    id: 'hack-deck-deanon',
    humanReadableName: 'deanon',
    description: 'новая команда: deanon\nОтображает якорь PAN хоста поверженного (выброшенного в ходе боя из Матрицы) декера',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // поражает противника по живым хитам, а не по матричным
  {
    id: 'hack-deck-harm',
    humanReadableName: 'harm',
    description: 'новая команда: harm\nПоражает хакера биофидбеком. грязная штука.',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['fencer-2'],
    pack: { id: 'hack-deck-fencer', level: 2 },
    modifier: [],
  },
  // убивает пораженного чамера. Абсолютная смерть
  {
    id: 'hack-deck-kill',
    humanReadableName: 'kill',
    description: 'новая команда: kill\nУбивает поражаенного хакера. Да, наглухо',
    availability: 'closed',
    karmaCost: 12,
    prerequisites: ['fencer-3', 'hack-deck-harm'],
    modifier: [],
  },
  //
  {
    id: 'useapi',
    humanReadableName: 'useapi',
    description: 'новая команда: useapi\n\nБазовая команда для работы со специальным нодам',
    availability: 'open',
    karmaCost: 2,
    prerequisites: ['miner-1'],
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
    karmaCost: 10,
    prerequisites: ['arch-hack-decker-geo-1'],
    pack: { id: 'arch-hack-decker-geo', level: 2 },
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из геоноды.
  {
    id: 'arch-hack-decker-geo-3',
    humanReadableName: 'геоспец 3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на геоноде',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hack-decker-geo-2'],
    pack: { id: 'arch-hack-decker-geo', level: 3 },
    modifier: [],
  },
  // позволяет читать данные из экономноды
  {
    id: 'arch-hack-decker-econ-1',
    humanReadableName: 'эконом 1',
    description: 'возможность использовать useapi read на экономноде',
    availability: 'open',
    karmaCost: 2,
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
    karmaCost: 4,
    prerequisites: ['arch-hack-decker-econ-1'],
    pack: { id: 'arch-hack-decker-econ', level: 2 },
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из экономноды.
  {
    id: 'arch-hack-decker-econ-3',
    humanReadableName: 'эконом 3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на экономноде',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['arch-hack-decker-econ-2'],
    pack: { id: 'arch-hack-decker-econ', level: 3 },
    modifier: [],
  },
  // позволяет читать данные из биомонитора и rcc
  {
    id: 'arch-hack-decker-med-1',
    humanReadableName: 'Медицина и Хром 1',
    description: 'возможность использовать useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 2,
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
    karmaCost: 4,
    prerequisites: ['arch-hack-decker-med-1'],
    pack: { id: 'arch-hack-decker-med', level: 2 },
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из биомонитора и rcc.
  {
    id: 'arch-hack-decker-med-3',
    humanReadableName: 'Медицина и Хром 3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 8,
    prerequisites: ['arch-hack-decker-med-2'],
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
  // Негативка за пережитый дамп-шок, эффект перманентный пока не излечат,
  // кумулятивен. Присваивается с помощью API
  //
  // IT:
  // [Клиническая смерть]
  // [-1] Резонанс
  // [-1] Тело
  // [-1] Харизма
  // [-1] Интеллект
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
  //
  {
    id: 'bloody-tide',
    humanReadableName: 'Кровавый прилив',
    description: 'Увеличивает сопротивление откату',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['master-of-the-universe'],
    modifier: [],
  },
  //
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
      'Каждые 60 секунд в течение {{ amount }} минут у всех присутствующих в астрале (кроме самого мага и тех, кого он вслух укажет) в этой локации текущие хиты астрального тела (ат) уменьшаются на 1, этот штраф действует 30 минут. Если хиты (ат) уменьшились таким образом до нуля, то персонажа с базовым мясным телом выбрасывает из астрала, а у базового астрального случается астральный нокаут (в соответствии с правилами по астральной боевке)',
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
    karmaCost: 30,
    prerequisites: ['arch-rigger-medic'],
    pack: { id: 'rigger-medic-combat', level: 3 },
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
    humanReadableName: 'экран автодока',
    description: 'можешь проводить операции через экран автодока',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [modifierFromEffect(unlockAutodockScreen, {})],
  },
  // Вне зависимости от уровня резонанса всегда имеет наивысшую инициативу в красной комнате. Если техномантов с такой абилкой несколько - то по уровню резонанса.
  {
    id: 'gunslinger',
    humanReadableName: 'Самый быстрый пистолет на Западе',
    description: '',
    availability: 'open',
    karmaCost: 16,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Позволяет игнорировать атаку активного агента хоста. (PvE игротеха)
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
    description: 'Ты научился использовать автодок для снятия имплантов.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger-medic', 'auto-doc-2', 'repoman-2'],
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
  // TODO(aeremin): Implement and add modifier here
  // делает доступной кнопку установки импланта на экране автодока
  {
    id: 'implant-install',
    humanReadableName: 'Установка импланта',
    description: 'Ты можешь использовать автодок для лечения и ставить импланты!',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger-medic'],
    pack: { id: 'rigger-medic-bio', level: 1 },
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
