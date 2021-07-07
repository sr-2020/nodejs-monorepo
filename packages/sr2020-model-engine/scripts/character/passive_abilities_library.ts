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
  increaseConversionAttack,
  increaseConversionDataprocessing,
  increaseConversionFirewall,
  increaseConversionSleaze,
  increaseDepth,
  increaseDroneFeedback,
  increaseFadingDecrease,
  increaseFadingResistance,
  increaseGroundcraftBonus,
  increaseHostEntrySpeed,
  increaseImplantsBonus,
  increaseImplantsSlots,
  increaseIntelligence,
  increaseMagic,
  increaseMaxEctoplasmHp,
  increaseMaxEssenceEffect,
  increaseMaxMeatHp,
  increaseMaxTimeAtHost,
  increaseMaxTimeInDrone,
  increaseMaxTimeInVr,
  increaseMedicraftBonus,
  increaseMentalProtection,
  increasePostDroneRecoveryTime,
  increaseRecoverySkill,
  increaseRepomanBonus,
  increaseResonance,
  increaseStockGainPercentage,
  increaseStrength,
  increaseСhemoBaseEffectThreshold,
  increaseСhemoCrysisThreshold,
  increaseСhemoSuperEffectThreshold,
  increaseСhemoUberEffectThreshold,
  muliplyMagicRecoverySpeed,
  multiplyAllDiscounts,
  multiplyDiscountWeaponsArmor,
  multiplyMagicFeedbackMultiplier,
  multiplySpiritResistanceMultiplier,
  setImplantsRemovalResistance,
  setTransactionAnonymous,
  unlockAutodockImplantInstall,
  unlockAutodockImplantRemoval,
  unlockAutodockScreen,
  unlockScoringDetailsScreen,
} from './basic_effects';
import { PassiveAbility } from '@alice/sr2020-common/models/common_definitions';
import { setAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
import { Modifier } from '@alice/alice-common/models/alice-model-engine';
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
    modifier: [modifierFromEffect(increaseFadingResistance, { amount: 1 }), modifierFromEffect(increaseHostEntrySpeed, { amount: -1 })],
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
  // добавляет +3 к ментальной защите персонажа метатипа Тролль
  {
    id: 'skin-armor',
    humanReadableName: 'Толстокожий',
    description: 'Ты толстокожий и совершенно не понимаешь шутки.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-troll', level: 1 },
    modifier: [modifierFromEffect(increaseMentalProtection, { amount: 3 })],
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
  // Обычный персонаж "ест" раз в цикл (в 12 часов), тролли едят каждые 6 часа.
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
  // может получиться косяк, эту абилку мы уже выдаем другим метатипам
  {
    id: 'magic-blockade',
    humanReadableName: 'Отторжение Магии',
    description: 'Ты не можешь изучать навыки Мага',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [],
  },
  // САБЖ, как в описании. Выдаем какую-то прикольную сюжетную инфу
  {
    id: 'incriminating-evidence',
    humanReadableName: 'Собрать компромат',
    description:
      'Напиши большую статью об интересующем тебя человеке или организации. Добейся, чтобы эта статья вошла в топ-20 понравившихся материалов. Получи от МГ компромат на этого человека или организацию. Степень подробности информации зависит от положения статьи в рейтинге топ-20. Вы не можете собирать компромат в течении 12 часов после получения прошлых итогов компромата.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['media-person'],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'always-online',
    humanReadableName: 'Всегда на связи',
    description:
      'Чтобы с вами ни происходило, в каком бы вы ни были состоянии, как бы вас ни заколдовали, если вы живы - вы можете пользоваться телеграммом для передачи игровых сообщений. В мире игре этого не видно, по вам нельзя понять, что вы что-то пишете, отнять телефон и так далее.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['media-person'],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'last-report',
    humanReadableName: 'Это мой последний репортаж',
    description:
      'Если вас каким-либо образом все-таки убили, вы можете написать сообщение с описанием подробностей вашей смерти, как все это происходило, что вы об этом думаете, оставить последние пожелания для подписчиков и опубликовать это в вашем телеграмм-канале. Вы можете описывать что происходило с вашим телом и вокруг него. ',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['media-person'],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'ask-anon',
    humanReadableName: 'Спроси анонимуса',
    description:
      'Раз в 12 часов вы можете получить ответ от мастеров на любой вопрос, подразумевающий ответ "да или нет" или подробный ответ на вопрос, касающийся бэка игры и событий, произошедших в мире игры до ее начала. Кто-то из ваших читателей скинул вам эту инфу в личку. Данную информацию нельзя использовать как доказательства в суде - ведь остальные могут сомневаться в том, что анонимус знает все. Но вы не сомневаетесь в этом. ',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['media-person'],
    modifier: [],
  },
  // САБЖ, как в описании.
  {
    id: 'bloggers-support',
    humanReadableName: 'Поддержка блоггеров',
    description:
      'Раз в 12 часов вы можете назвать мастерам некую личность или организацию и защитить ее от использования способности "собрать компромат" на 12 часов.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['media-person'],
    modifier: [],
  },
  // для проект-менеджера  с 1 слотом
  // У игрока просто отображается текст пассивной абилки
  {
    id: 'project-manager-1',
    humanReadableName: 'ты - проект-менеджер1',
    description: 'сертификат проект-менеджера. может вести не более 1 проекта одновременно',
    availability: 'closed',
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
    availability: 'closed',
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
    modifier: [],
  },
  // Автоматический захват цели в линклок при появлении
  {
    id: 'auto-link-lock',
    humanReadableName: 'autolock',
    description: 'новая команда: autolock [target]\nАвтоматически атакует указанного декера при встрече(то есть без ручного ввода команды)',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'fencer-2'],
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
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 3 }),
  },
  // Значительно экономит память деки, позволяя размесить в ней больше софта
  {
    id: 'compressor',
    humanReadableName: 'Компрессор',
    description: 'Ты разобрался со всеми премудростями квантовой компрессии. Что позволяет сократить размер софта в памяти деки на 20%\n',
    availability: 'closed',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-1'],
    modifier: [],
  },
  // бекдоры живут на 40 минут дольше
  // Абилка-маркер для сайта Кривды
  {
    id: 'very-last-droplet',
    humanReadableName: 'Выжать до капли',
    description: 'Можешь использовать бекдоры на 40 минут дольше',
    availability: 'open',
    karmaCost: 4,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseBackdoorTtl, { amount: 40 }),
  },
  // maxTimeInVr+20
  {
    id: 'longer-vr-stays-1',
    humanReadableName: 'VR: Здесь можно быть дольше',
    description: 'Ты можешь находиться в VR на 20 минут дольше',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 20 }),
  },
  // maxTimeInVr+300
  {
    id: 'longer-vr-stays-2',
    humanReadableName: 'VR: Можно быть еще дольше!',
    description: 'Ты можешь находиться в VR на 300 минут дольше',
    availability: 'closed',
    karmaCost: 30,
    prerequisites: [],
    modifier: modifierFromEffect(increaseMaxTimeInVr, { amount: 300 }),
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
    modifier: [],
  },
  // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
  //
  // IT: Команда в Кривда-Матрице, основного IT нет
  {
    id: 'feelmatrix',
    humanReadableName: 'feelmatrix',
    description:
      'новая команда:feelmatrix\nТы теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\nВыдает список хостов, на которых есть другие декеры. Чем выше твой Sleaze, тем больше инфы ты получишь',
    availability: 'closed',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    modifier: [],
  },
  //
  {
    id: 'bypass',
    humanReadableName: 'bypass',
    description:
      'новая команда: bypass\nты переходишь в ghost режим, который сохранится до следующего входа в хотсим\nВ нем, в зависимости от значения Sleaze, ты сможешь обойти некоторое число ICE, запустить несколько команд deploy и useapi\nПри этом ты не сможешь атаковать и применять практически все остальные команды\nОСТОРОЖНО! Помни про путь назад. Ведь считается каждый проход ICE, и ты можешь крепко застрять!',
    availability: 'open',
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
    modifier: modifierFromEffect(increaseMaxTimeAtHost, { amount: 5 }),
  },
  // IT:
  // [+10] Декер_макс_время_на_хосте
  {
    id: 'stubbornness-2',
    humanReadableName: 'Удивительная упертость',
    description: 'Продлевает максимальное время нахождения на хосте на еще на 10 минут',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'stubbornness-1'],
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
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: -2 }),
  },
  // IT:
  // [+10] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-2',
    humanReadableName: 'Очень шустрый',
    description: 'Снижает время входа на хост на еще минуту',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'quick-to-enter-1', 'fencer-2'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: -1 }),
  },
  // IT:
  // [+10] Декер_скорость_входа_на_хост
  {
    id: 'quick-to-enter-3',
    humanReadableName: 'Супер шустрый',
    description: '.. и еще снижает время входа на хост еще на 2 минуты',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'quick-to-enter-2', 'fencer-3'],
    modifier: modifierFromEffect(increaseHostEntrySpeed, { amount: -2 }),
  },
  // IT: команда в кривда-матрице
  {
    id: 'flee',
    humanReadableName: 'flee',
    description: 'новая команда:flee\nПозволяет попытаться сбежать из софт-лока (мягкого линклока). \nШанс успеха зависит от Sleaze',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker', 'sly-2'],
    modifier: [],
  },
  // Абилка конверсии Intellect в Firewall
  // IT:
  // [+2] Декер_конверсия_Firewall
  {
    id: 'breacher-1',
    humanReadableName: 'Хороший Бричер',
    description: 'Улучшает конверсию Intellect в Firewall на 20%',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 20 }),
  },
  // IT:
  // [+1] Декер_конверсия_Firewall
  {
    id: 'breacher-2',
    humanReadableName: 'Отличный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall еще на 10%',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'breacher-1'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 10 }),
  },
  // IT:
  // [+1] Декер_конверсия_Firewall
  {
    id: 'breacher-3',
    humanReadableName: 'Легендарный Бричер',
    description: 'Улучшает конверсию Intellect в Firewall еще на 10%',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'breacher-2'],
    modifier: modifierFromEffect(increaseConversionFirewall, { amount: 10 }),
  },
  // Абилка конверсии Intellect в Attack
  // IT:
  // [+2] Декер_конверсия_Attack
  {
    id: 'fencer-1',
    humanReadableName: 'Хороший Фенсер',
    description: 'Улучшает конверсию Intellect в Attack на 20%\n\n',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 20 }),
  },
  // IT:
  // [+1] Декер_конверсия_Attack
  {
    id: 'fencer-2',
    humanReadableName: 'Отличный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack еще на 10%',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'fencer-1'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 10 }),
  },
  // IT:
  // [+1] Декер_конверсия_Attack
  {
    id: 'fencer-3',
    humanReadableName: 'Легендарный Фенсер',
    description: 'Улучшает конверсию Intellect в Attack еще на 10%',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'fencer-2'],
    modifier: modifierFromEffect(increaseConversionAttack, { amount: 10 }),
  },
  // Абилка конверсии Intellect в Sleaze
  // IT:
  // [+2] Декер_конверсия_Sleaze
  {
    id: 'sly-1',
    humanReadableName: 'Хороший Слай',
    description: 'Улучшает конверсию Intellect в Sleaze  на 20%',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 20 }),
  },
  // IT:
  // [+1] Декер_конверсия_Sleaze
  {
    id: 'sly-2',
    humanReadableName: 'Отличный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze  еще на 10%',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'sly-1'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 10 }),
  },
  // IT:
  // [+1] Декер_конверсия_Sleaze
  {
    id: 'sly-3',
    humanReadableName: 'Легендарный Слай',
    description: 'Улучшает конверсию Intellect в Sleaze  еще на 10%',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'sly-2'],
    modifier: modifierFromEffect(increaseConversionSleaze, { amount: 10 }),
  },
  // Абилка конверсии Intellect в Dataprocessing
  // IT:
  // [+2] Декер_конверсия_Dataprocessing
  {
    id: 'miner-1',
    humanReadableName: 'Хороший Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing  на 20%',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-decker'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 20 }),
  },
  // IT:
  // [+1] Декер_конверсия_Dataprocessing
  {
    id: 'miner-2',
    humanReadableName: 'Отличный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing  еще на 10%',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'miner-1'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 10 }),
  },
  // IT:
  // [+1] Декер_конверсия_Dataprocessing
  {
    id: 'miner-3',
    humanReadableName: 'Легендарный Майнер',
    description: 'Улучшает конверсию Intellect в Dataprocessing  еще на 10%',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-decker', 'miner-2'],
    modifier: modifierFromEffect(increaseConversionDataprocessing, { amount: 10 }),
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
    modifier: modifierFromEffect(increaseAdminHostNumber, { amount: 5 }),
  },
  // Увеличивает Харизму персонажа менталиста на +1
  {
    id: 'increase-the-charisma-1',
    humanReadableName: 'Увеличение харизмы 1',
    description: 'Перманентное увеличение Харизмы персонажа - 1',
    availability: 'closed',
    karmaCost: 80,
    prerequisites: ['arch-face', 'paralysis-3'],
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
    modifier: [modifierFromEffect(unlockScoringDetailsScreen, {})],
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
    description: 'Все твои переводы анонимны',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: modifierFromEffect(setTransactionAnonymous, {}),
  },
  // Абилка-сертификат, позволяющий просмотреть чужой этикпрофиль
  {
    id: 'dm-soul-expert',
    humanReadableName: 'Душевед',
    description: 'Предъявите экран с описанием способности игроку, чтобы тот показал вам свой этикпрофиль',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Абилка-сертификат
  {
    id: 'churched',
    humanReadableName: 'Воцерковленный',
    description:
      'После исповеди или участия в богослужении вы можете нажать "Готово" на любом Поступке личной этики, не выполняя его требований',
    availability: 'closed',
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
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-samurai'],
    pack: { id: 'gen-arch-samurai', level: 1 },
    modifier: modifierFromEffect(multiplyDiscountWeaponsArmor, { amount: 0.9 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-1',
    humanReadableName: 'Магия 1',
    description: 'Перманентно увеличивает твою характеристику Магия на 1',
    availability: 'closed',
    karmaCost: 30,
    prerequisites: ['arch-mage'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-2',
    humanReadableName: 'Магия 2',
    description: 'Перманентно увеличивает твою характеристику Магия на 1',
    availability: 'closed',
    karmaCost: 40,
    prerequisites: ['magic-1', 'arch-mage'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-3',
    humanReadableName: 'Магия 3',
    description: 'Перманентно увеличивает твою характеристику Магия на 1',
    availability: 'closed',
    karmaCost: 50,
    prerequisites: ['magic-2', 'arch-mage'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-4',
    humanReadableName: 'Магия 4',
    description: 'Перманентно увеличивает твою характеристику Магия на 1',
    availability: 'closed',
    karmaCost: 60,
    prerequisites: ['magic-3', 'arch-mage'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-5',
    humanReadableName: 'Магия 5',
    description: 'Перманентно увеличивает твою характеристику Магия на 1',
    availability: 'closed',
    karmaCost: 70,
    prerequisites: ['magic-4', 'arch-mage'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. То есть от базового получается 1*0.9=0.9)
  {
    id: 'magic-feedback-resistance-1',
    humanReadableName: 'Сопротивление Откату 1',
    description: 'Перманентно снижает твой Откат на 10%',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-mage'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимого СопрОткату1 коэффициентСопротивленияОткату = 1*0.9*0.9=0.81)
  {
    id: 'magic-feedback-resistance-2',
    humanReadableName: 'Сопротивление Откату 2',
    description: 'Перманентно снижает твой Откат на 10%',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-feedback-resistance-1', 'arch-mage'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно снижает Откат на 10% (добавляет в коэффициентСопротивленияОткату множитель 0.9. С учетом необходимых СопрОткату1-2 коэффициентСопротивленияОткату = 1*0.9*0.9*0.9=0.729)
  {
    id: 'magic-feedback-resistance-3',
    humanReadableName: 'Сопротивление Откату 3',
    description: 'Перманентно снижает твой Откат на 10%',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['magic-feedback-resistance-2', 'arch-mage'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 0.9,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. То есть от базового получается 1*1.2=1.2)
  {
    id: 'magic-feedback-unresistance-1',
    humanReadableName: 'Откатошный 1',
    description: 'Перманентно увеличивает твой Откат на 20%',
    availability: 'open',
    karmaCost: -20,
    prerequisites: ['arch-mage'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимого Откатошный1 коэффициентСопротивленияОткату = 1*1.2*1.2=1.44)
  {
    id: 'magic-feedback-unresistance-2',
    humanReadableName: 'Откатошный 2',
    description: 'Перманентно увеличивает твой Откат на 20%',
    availability: 'open',
    karmaCost: -30,
    prerequisites: ['magic-feedback-unresistance-1', 'arch-mage'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно увеличивает Откат на 20% (добавляет в коэффициентСопротивленияОткату множитель 1.2. С учетом необходимых Откатошный1-2 коэффициентСопротивленияОткату = 1*1.2*1.2*1.2=1.728)
  {
    id: 'magic-feedback-unresistance-3',
    humanReadableName: 'Откатошный 3',
    description: 'Перманентно увеличивает твой Откат на 20%',
    availability: 'open',
    karmaCost: -40,
    prerequisites: ['magic-feedback-unresistance-2', 'arch-mage'],
    modifier: modifierFromEffect(multiplyMagicFeedbackMultiplier, {
      amount: 1.2,
    }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. То есть от базового 1 КоэффициентВосстановленияМагии станет 1*1.2=1.2
  {
    id: 'magic-recovery-1',
    humanReadableName: 'Воспрянь и пой 1',
    description: 'Перманентно ускоряет восстановление твоей Магии на 20%.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-mage'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже был взят Воспрянь и пой 1, то КоэффициентВосстановленияМагии станет 1*1.2*1.2=1.44
  {
    id: 'magic-recovery-2',
    humanReadableName: 'Воспрянь и пой 2',
    description: 'Перманентно ускоряет восстановление твоей Магии на 20%.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['magic-recovery-1', 'arch-mage'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // Перманентно ускоряет восстановление Магии на 20%. Поскольку уже были Воспрянь и пой 1-2, КоэффициентВосстановленияМагии станет 1*1.2*1.2*1.2=1.728
  {
    id: 'magic-recovery-3',
    humanReadableName: 'Воспрянь и пой 3',
    description: 'Перманентно ускоряет восстановление твоей Магии на 20%.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['magic-recovery-2', 'arch-mage'],
    modifier: modifierFromEffect(muliplyMagicRecoverySpeed, { amount: 1.2 }),
  },
  // В астральном следе заклинаний обладателя абилки остается только 60% ауры. То есть Коэффициент Отчетливости Астральных Следов у него равен 0.6
  {
    id: 'light-step',
    humanReadableName: 'Light Step ',
    description: 'В астральном следе твоих заклинаний остается только 60% ауры. ',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-mage', 'trackpoint'],
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
    karmaCost: 60,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Обладатель абилки при анализе следов заклинаний (заклинания Trackpoint, Trackball, Know each other, Tweet-tweet little bird), извлекает значение ауры на 20% больше. Например, если заклинание было скастовано с такой Мощью, что должно было извлечь 10 символов, то с этой абилкой будет извлечено 12. То есть Коэффициент чтения астральных следов у этого мага равен 1.2.
  {
    id: 'dictator-control',
    humanReadableName: 'Dictator Control',
    description: 'При чтении астральных следов ты извлекаешь на 20% больше ауры',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-mage', 'trackpoint'],
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
    karmaCost: 30,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Разблокирует возможность сканить во время каста заклинания qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "ритуал": N разных сосканированных за время действия заклинания qr-кодов увеличивают магу выбранную для этого заклинания Мощь на √N, округленное вверх.
  {
    id: 'ritual-magic',
    humanReadableName: 'Ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи',
    availability: 'closed',
    karmaCost: 50,
    prerequisites: ['arch-mage'],
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
    karmaCost: 60,
    prerequisites: ['arch-mage'],
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
  // drones.maxTimeInside  +15
  // drones.recoveryTime= -15
  {
    id: 'drone-sync-1',
    humanReadableName: 'Синхронизация 1',
    description: 'Увеличивает время в дроне на 15 минут и сокращает перерыв между включениями на 15 минут.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 20 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -20 }),
    ],
  },
  // drones.maxTimeInside +15
  // drones.recoveryTime -15
  {
    id: 'drone-sync-2',
    humanReadableName: 'Синхронизация 2',
    description: 'Еще увеличивает время в дроне на 15 минут и сокращает перерыв между включениями на 15 минут.',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['drone-sync-1', 'arch-rigger'],
    modifier: [
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
      modifierFromEffect(increasePostDroneRecoveryTime, { amount: -10 }),
    ],
  },
  // drones.maxTimeInside  +15
  // drones.recoveryTime-15
  {
    id: 'drone-sync-3',
    humanReadableName: 'Синхронизация 3',
    description: 'И еще увеличивает время в дроне на 15 минут и сокращает перерыв между включениями на 15 минут.',
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
    karmaCost: 30,
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
    description: 'Щит.',
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
    description: 'Пулемет.',
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
      'Бадабум!  Иммунитет ко всему холодному оружию и легкому огнестрельному.\nПри активации необходимо громко озвучить словесный маркер "ВЗРЫВ".  Эффект = атака тяжелым оружием по всем персонажам в радиусе 2 метров от точки взрыва . (4 хита по персонажам без брони \\ 1 хит по персонажам в тяжелой броне). После взрыва активируй "аварийный выход", после возврата в тело - порви куар дрона.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // Описание способностей дрона Вертолет
  {
    id: 'drone-heli',
    humanReadableName: 'Дрон Вертолет',
    description: 'Может перевозить 3 персонажей. Иммунитет ко всему холодному оружию и легкому огнестрельному. ',
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
    id: 'arrowgant-effect',
    humanReadableName: 'Arrowgant - эффект',
    description: 'Ты защищён от дистанционных атак (только от нерфов).',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'trollton-effect',
    humanReadableName: 'Trollton',
    description: 'На тебя действует эффект тяжёлой брони.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Эффект *-shooter абилок и химоты
  {
    id: 'automatic-weapons-unlock',
    humanReadableName: 'Автоматическое оружие',
    description: 'Позволяет использовать автоматическое оружие. \n(При наличии импланта Кибер-рука или абилки Биосила)',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'hammer-of-justice-effect',
    humanReadableName: 'Hammer of Justice - эффект',
    description: 'Одноручное холодное оружие считается тяжёлым.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
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
  // Абилка ничего не делает, просто показывает текст "магический щит, защищает от атак оружием - холодным и дистанционным. Двигаться с раскрытым щитом нельзя. Любая контактная атака на щит приводит нападающего в тяжран"
  {
    id: 'magic-shield',
    humanReadableName: 'Magic Shield',
    description:
      'Активирован магический щит (раскрытым прозрачным зонтиком можно защищаться от попаданий любого оружия).\nC раскрытым маг.щитом нельзя перемещаться. Если такое случилось, эффект заклинания заканчивается, маг.щит нужно сложить и в этом бою раскрывать больше нельзя.\nПока активен эффект - складывать/раскладывать маг.щит можно сколько угодно раз\nКасание раскрытого маг.щита, в том числе оружием (кроме снарядов) приводит в тяжран нападающего',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "какое-то одно холодное оружие в руках 5 минут считается тяжелым (необходима его маркировка красной лентой)"
  {
    id: 'pencil',
    humanReadableName: 'PENCIL',
    description: 'Одно холодное оружие в руках считается тяжёлым',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Абилка ничего не делает, просто показывает текст "Надетая согласно остальным правилам лёгкая броня 5 минут считается тяжелым (необходима её маркировка красной лентой)"
  {
    id: 'stone-skin-result',
    humanReadableName: 'Stone skin',
    description: 'Надетая согласно остальным правилам лёгкая броня считается тяжёлой',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
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
    prerequisites: ['arch-rigger'],
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
  // Body +2
  // Intelligence +2
  // max.time.inside = 10
  {
    id: 'arch-rigger',
    humanReadableName: 'Архетип: Риггер',
    description: 'Риггер, повелитель дронов, хрома и химоты.',
    availability: 'open',
    karmaCost: 100,
    prerequisites: ['!meta-ghoul', '!meta-vampire'],
    pack: { id: 'gen-arch-rigger', level: 1 },
    modifier: [
      modifierFromEffect(increaseBody, { amount: 2 }),
      modifierFromEffect(increaseIntelligence, { amount: 2 }),
      modifierFromEffect(increaseMaxTimeInDrone, { amount: 10 }),
    ],
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
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-samurai'],
    pack: { id: 'gen-arch-samurai-boost', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseStrength, { amount: 2 })],
  },
  // Intelligence +1
  {
    id: 'arch-hackerman-decker',
    humanReadableName: 'Архетип: Декер',
    description: 'Ты постиг премудрости работы с кибердекой и научился использовать gUmMMy протокол!',
    availability: 'closed',
    karmaCost: 100,
    prerequisites: [],
    pack: { id: 'gen-arch-hackerman-decker', level: 1 },
    modifier: [modifierFromEffect(increaseIntelligence, { amount: 1 })],
  },
  // resonance +1
  {
    id: 'arch-hackerman-technomancer',
    humanReadableName: 'Архетип: Техномант',
    description: 'Ты теперь чувствуешь Матрицу. Обычные люди на такое не способны.',
    availability: 'closed',
    karmaCost: 100,
    prerequisites: ['!arch-mage', '!tech-blockade', '!meta-ghoul', '!meta-vampire', '!magic-blockade'],
    pack: { id: 'gen-arch-hackerman-technomancer', level: 1 },
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // Intelligence +2
  {
    id: 'arch-hackerman-decker-boost',
    humanReadableName: 'Опытный Декер',
    description: 'Очень опытный декер.',
    availability: 'closed',
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
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer', '!magic-blockade'],
    pack: { id: 'gen-arch-technomancer-boost', level: 1 },
    modifier: [modifierFromEffect(increaseResonance, { amount: 2 })],
  },
  // magic  +1
  {
    id: 'arch-mage',
    humanReadableName: 'Архетип: Маг',
    description: 'Маг, повелитель заклинаний!',
    availability: 'closed',
    karmaCost: 100,
    prerequisites: ['!arch-hackerman-technomancer', '!magic-blockade'],
    pack: { id: 'gen-arch-mage', level: 1 },
    modifier: [modifierFromEffect(increaseMagic, { amount: 2 })],
  },
  // Magic +2
  // body +2
  {
    id: 'arch-mage-boost',
    humanReadableName: 'Опытный Маг',
    description: 'Очень опытный маг.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-mage', '!magic-blockade'],
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
    prerequisites: ['!magic-blockade'],
    pack: { id: 'gen-arch-face', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
  },
  // charisma +2
  {
    id: 'arch-face-boost',
    humanReadableName: 'Опытный Фейс',
    description: 'Очень опытный фейс',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-face', '!magic-blockade'],
    pack: { id: 'gen-arch-face-boost', level: 1 },
    modifier: [modifierFromEffect(increaseCharisma, { amount: 2 })],
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
  // ментальная защита снижена на 3
  {
    id: 'arch-face-negative-1',
    humanReadableName: 'проблемы фейса-1',
    description: 'У тебя проблемы, фейс.',
    availability: 'open',
    karmaCost: -15,
    prerequisites: ['arch-face'],
    modifier: [modifierFromEffect(increaseMentalProtection, { amount: -3 })],
  },
  // эссенс снижен на 1
  {
    id: 'arch-face-negative-2',
    humanReadableName: 'проблемы фейса-2',
    description: 'У тебя серьезные проблемы, фейс.',
    availability: 'open',
    karmaCost: -35,
    prerequisites: ['arch-face-negative-1'],
    modifier: [{ ...modifierFromEffect(increaseMaxEssenceEffect, { amount: -100 }), priority: Modifier.kPriorityEarliest }],
  },
  // Харизма уменьшена на 1
  {
    id: 'arch-face-negative-3',
    humanReadableName: 'проблемы фейса-3',
    description: 'У тебя очень серьезные проблемы, фейс.',
    availability: 'open',
    karmaCost: -50,
    prerequisites: ['arch-face-negative-2'],
    modifier: [modifierFromEffect(increaseCharisma, { amount: -1 })],
  },
  // Персонажам, имеющим абилку, Случай начисляет Х денег в конце каждого цикла
  {
    id: 'dividends-1',
    humanReadableName: 'Дивиденды *',
    description:
      'Дивиденды гарантируют вашему персонажу регулярный пассивный доход на игре, без регистрации и СМС. Shut up and take my nuyens! Да, этого точно хватит чтобы поесть и оплатить некоторые развлечения.',
    availability: 'open',
    karmaCost: 70,
    prerequisites: [],
    modifier: [],
  },
  // Персонажам, имеющим абилку, Случай начисляет ХХ денег в конце каждого цикла
  {
    id: 'dividends-2',
    humanReadableName: 'Дивиденды **',
    description: 'Больше пассивного дохода!',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['dividends-1'],
    modifier: [],
  },
  // Персонажам, имеющим абилку, Случай начисляет ХХХ денег в конце каждого цикла
  {
    id: 'dividends-3',
    humanReadableName: 'Дивиденды ***',
    description: 'Еще больше пассивного дохода, ты сумел вырваться из крысиных бегов, чаммер!',
    availability: 'open',
    karmaCost: 70,
    prerequisites: ['dividends-2'],
    modifier: [],
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-1-summ',
    humanReadableName: 'Магия 1-П!',
    description: 'Перманентно увеличивает твою характеристику Магия на 1',
    availability: 'closed',
    karmaCost: 60,
    prerequisites: ['arch-mage'],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Перманентно увеличивает характеристику Магия на 1
  {
    id: 'magic-2-summ',
    humanReadableName: 'Магия 2-П!',
    description: 'Перманентно увеличивает твою характеристику Магия на 1',
    availability: 'closed',
    karmaCost: 60,
    prerequisites: ['magic-1-summ', 'arch-mage'],
    modifier: [modifierFromEffect(increaseMagic, { amount: 1 })],
  },
  // Все мясные/экто тела, касающиеся владельца абилки на протяжении минуты, в конце этой минуты восстанавливают текущие хиты до максимума. Из тяжрана не поднимает.
  {
    id: 'healtouch',
    humanReadableName: 'Healtouch',
    description:
      'Все мясные/экто тела, касающиеся владельца абилки на протяжении минуты, в конце этой минуты восстанавливают текущие хиты до максимума. Из тяжрана не поднимает.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
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
    modifier: [],
  },
  // поражает противника по живым хитам, а не по матричным
  {
    id: 'hack-deck-harm',
    humanReadableName: 'harm',
    description: 'новая команда: harm\nПозволяет добить(КС) поверженного хакера биофидбеком.  грязная штука.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker', 'fencer-2'],
    modifier: [],
  },
  // убивает пораженного чамера. Абсолютная смерть
  {
    id: 'hack-deck-kill',
    humanReadableName: 'kill',
    description: 'новая команда: kill\nУБИВАЕТ(АС) поверженного хакера. Да, наглухо \nДля применения понадобится специальный эксплойт',
    availability: 'closed',
    karmaCost: 50,
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
    modifier: [],
  },
  // Эффект химоты
  {
    id: 'heavy-weapons-unlock',
    humanReadableName: 'Тяжелое оружие',
    description: 'Позволяет использовать тяжелое оружие.\n(При наличии 2-х имплантов Кибер-рука или 1-й руки и абилки Биосила)',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'fireball-able',
    humanReadableName: 'Fireball - Эффект',
    description: 'Можете кинуть {{ amount }} огненных шаров.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Эффект химоты
  {
    id: 'heavy-armor-effect',
    humanReadableName: 'Эффект Тяжёлая броня',
    description: 'На тебя действуют правила по хитосъему, соответствующие тяжелой броне.',
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
  //
  {
    id: 'fast-charge-able',
    humanReadableName: 'Fast Charge - Эффект',
    description: 'Можете кинуть {{ amount }} молний.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Добавляет в КоэффициентСопротивленияОткату множитель K=1/(6+{{ amount }} ).  По умолчанию amount = 1
  {
    id: 'bloody-tide',
    humanReadableName: 'Кровавый прилив',
    description: 'Увеличивает твоё сопротивление Откату',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Увеличивает максимальную доступную Мощь на {{ amount }}. По умолчанию amount = 1
  {
    id: 'magic-in-the-blood',
    humanReadableName: 'Магия в крови',
    description: 'Увеличивает максимальную доступную тебе Мощь на {{ amount }}',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'avalanche-able',
    humanReadableName: 'Avalanche - Эффект',
    description:
      'У всех персонажей, присутствовавших на конец каста заклинания в реале в радиусе 5 метров от заклинателя (либо в рамках помещения)  кроме самого мага и тех, кого он вслух укажет и взаимодействующих с магом (слышащих/видящих/нападающих на него), хиты снижаются на {{ amount }}',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'birds-able',
    humanReadableName: 'Birds effect',
    description:
      'Каждые 60 секунд в течение {{ amount }} минут у всех присутствующих в реале  (мясо/экто/дрон -  кроме самого мага и тех, кого он вслух укажет) в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) текущие хиты уменьшаются на 1 на срок 30 минут. Если хиты уменьшились таким образом до нуля, то персонаж оказывается в тяжране',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'cacophony-able',
    humanReadableName: 'Cacophony effect',
    description:
      'Каждые 60 секунд в течение {{ amount }} минут всем присутствующим в астрале (кроме самого мага и тех, кого он вслух укажет) в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) необходимо сделать 20 приседаний.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'tincasm-able',
    humanReadableName: 'Think as a master effect',
    description:
      'После крика мага "Замри" все в этой локации, кто видит или слышит мага, столбенеют на месте.\nВ этом состоянии нельзя двигаться, атаковать, защищаться, пользоваться способностями - но можно быть целью для чужих способностей.\nМаг может вывести одну цель из остолбенения, погладив её по голове.\nОстолбеневшие снова могут двигаться через 60с или после потери хитов по любой причине.',
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
  //
  {
    id: 'black-matter',
    humanReadableName: 'Black matter',
    description: 'У духа в эктоплазменном теле 6 хитов.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'grey-matter',
    humanReadableName: 'Grey matter',
    description: 'У духа в эктоплазменном теле 4 хита',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [modifierFromEffect(increaseMaxEctoplasmHp, { amount: 1 })],
  },
  // Эту абилку можно ставить пререквезитом ко всему непонятному, что мы хотим спрятать от игроков
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
  // Здесь идет включение а Автодок, показывается экран Автодока и к сумме (rigging.repomanBonus + Int ) добавляется еще int bonus от автодока.
  // Вырезанный имплант записывается на QR чип
  {
    id: 'repoman-medic',
    humanReadableName: 'Рипомен хирург',
    description: 'Ты можешь использовать автодок для снятия имплантов.',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-rigger', 'auto-doc-2', 'repoman-1'],
    modifier: [modifierFromEffect(unlockAutodockImplantRemoval, {})],
  },
  // Это сводная абилка для свойств духа типа1
  {
    id: 'totoro',
    humanReadableName: 'Totoro',
    description: 'Ты неуязвим для снарядов. Можешь лечить мясным телам хиты до их максимума прикосновением в течение 5с',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Это сводная абилка для свойств духа типа2
  {
    id: 'firestarter',
    humanReadableName: 'Firestarter',
    description: 'Можешь кинуть в одном бою до 5 файерболов',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Это сводная абилка для свойств духа типа3
  {
    id: 'riotment',
    humanReadableName: 'Riotment',
    description: 'Неуязвим для снарядов. Можешь кинуть в бою 1 файербол. Оружие в руках считается тяжёлым',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // нужна сугубо в матрице для проверки доступности дебажных команд
  {
    id: 'god-mode',
    humanReadableName: 'god mode',
    description: 'GOD mode. Для откладки.\nДает персонажу декеру ВСЕ команды и доплнительные способности',
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
  // текстовая абилка
  {
    id: 'stunning-resist',
    humanReadableName: 'Защита от оглушения',
    description: 'Иммунитет к оглушению. Скажи "иммунитет" и покажи эту способность, если тебя пытаются оглушить. Ты НЕ оглушен.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-samurai', 'faster-regen-1'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'self-unbinding-mage',
    humanReadableName: 'Развязывание (маг)',
    description:
      'Если тебя связали - ты можешь развязаться в любой момент по своему желанию.  Необходимо громко должны сказать “развязался” и скинуть веревочные петли. ',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'self-unbinding-face',
    humanReadableName: 'Развязывание (фейс)',
    description:
      'Если тебя связали - ты можешь развязаться в любой момент по своему желанию.  Необходимо громко должны сказать “развязался” и скинуть веревочные петли. ',
    availability: 'open',
    karmaCost: 30,
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
  // В описании абилки в "Пассивных" текст: "Можешь видеть сущности, находящиеся в астрале (красный дождевик), и изгонять их из помещения, в котором вы находитесь, или на длину твоего выпада холодным оружием"
  {
    id: 'astralopithecus-rage',
    humanReadableName: 'AstralopithecusRage - эффект',
    description:
      'Ты можешь видеть сущности, находящиеся в астрале (красный дождевик), и изгонять их из помещения, в котором вы находитесь, или отгонять на длину твоего выпада холодным оружием Попадание по ним не снимает у них хитов, но вынуждает отойти за пределы твоей атаки. Они не могут действовать на тебя физически.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // инструкция про киберруки
  {
    id: 'hands-samurai',
    humanReadableName: 'Киберруки и БиоСила',
    description:
      'Чтобы пользоваться оружием - тебе нужен соответствующий Навык и Усиленные руки. Для одноручного оружия - нужна способность БиоСила или один имплант Кибер-рука. Чтобы держать оружие двумя руками (двуручное холодное, пулемет, или два одноручных) - БиоСила + Кибер-рука или 2 импланта Кибер-рука.',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-samurai'],
    pack: { id: 'gen-arch-samurai', level: 1 },
    modifier: [],
  },
  // Игрок может использовать строительные перчатки и прокачивать навык использования спрайтов основания
  {
    id: 'sprites-basic',
    humanReadableName: 'Использование спрайтов в Основании',
    description: '"Ты можешь пользоваться спрайтом "строительные перчатки" в основании"',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Игрок может использовать доступные комплексные формы в основании
  {
    id: 'complex-form-basic',
    humanReadableName: 'Комплексные формы в Основании',
    description: 'Ты можешь использовать комплексные формы в основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Игрок может держать (иметь доступ к информации черз бэкдор) 2 бэкдора
  {
    id: 'backdoor-hold-2',
    humanReadableName: 'держать 2 бэкдора',
    description: 'Можешь использовать 2 бэкдора одновременно',
    availability: 'open',
    karmaCost: 25,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [modifierFromEffect(increaseBackdoors, { amount: 1 })],
  },
  // Игрок может держать (иметь доступ к информации черз бэкдор) 3 бэкдора
  {
    id: 'backdoor-hold-3',
    humanReadableName: 'держать 3 бэкдора',
    description: 'Можешь использовать 3 бэкдора одновременно',
    availability: 'open',
    karmaCost: 25,
    prerequisites: ['arch-hackerman-technomancer', 'backdoor-hold-2'],
    modifier: [modifierFromEffect(increaseBackdoors, { amount: 1 })],
  },
  // Игрок может держать (иметь доступ к информации черз бэкдор) 4 бэкдора
  {
    id: 'backdoor-hold-4',
    humanReadableName: 'держать 4 бэкдора',
    description: 'Можешь использовать 4 бэкдора одновременно',
    availability: 'open',
    karmaCost: 15,
    prerequisites: ['arch-hackerman-technomancer', 'backdoor-hold-3'],
    modifier: [modifierFromEffect(increaseBackdoors, { amount: 1 })],
  },
  // Игрок может держать (иметь доступ к информации черз бэкдор) 5 бэкдоров
  {
    id: 'backdoor-hold-5',
    humanReadableName: 'держать 5 бэкдоров',
    description: 'Можешь использовать 5 бэкдоров одновременно',
    availability: 'open',
    karmaCost: 15,
    prerequisites: ['arch-hackerman-technomancer', 'backdoor-hold-4'],
    modifier: [modifierFromEffect(increaseBackdoors, { amount: 1 })],
  },
  // Игрок не реагирует на команду "покажи син" в VR
  //
  {
    id: 'identity-hide',
    humanReadableName: 'VR: сокрытие личности аватарки',
    description: 'Работает только в VR, Способность "узнать личность" на тебя не работает.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    modifier: [],
  },
  // Только как пререквизит к другим скилам, связанным с инициативой
  {
    id: 'initiative-basic',
    humanReadableName: 'Инициатива-базовая',
    description: 'Теперь ты можешь повышать свю инициативу во время рана',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-technomancer', 'complex-form-basic'],
    modifier: [],
  },
  // Только как пререквизит к другим скилам
  {
    id: 'control-basic',
    humanReadableName: 'Контроль',
    description: 'Теперь ты можешь выбрать больше интересных навыков',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-hackerman-technomancer', 'complex-form-basic'],
    modifier: [],
  },
  // TODO(aeremin): Implement and add modifier here
  // Body  +2
  // Intelligence +2
  {
    id: 'arch-rigger-boost',
    humanReadableName: 'Опытный Риггер',
    description: 'Очень опытный риггер.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-rigger'],
    pack: { id: 'gen-arch-rigger-boost', level: 1 },
    modifier: [modifierFromEffect(increaseBody, { amount: 2 }), modifierFromEffect(increaseIntelligence, { amount: 2 })],
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: "clubs'n'swords-3",
    humanReadableName: 'Двуручное оружие',
    description:
      'Ты умеешь использовать двуручное оружие. Двуручные топоры, молоты, мечи, дубины. От 120 до 170 см. Оружие необходимо держать двумя руками. Атака снимает 4 хита с цели либо 1 хит с цели в тяжелом доспехе. ',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-samurai', "clubs'n'swords-2"],
    modifier: [],
  },
  // текстовая абилка.
  {
    id: 'police-scanner',
    humanReadableName: 'полицейский сканер',
    description: 'Ты имеешь право требовать показать в приложении страницу Экономика  - вкладка Паспорт',
    availability: 'closed',
    karmaCost: 10,
    prerequisites: [],
    modifier: [],
  },
  // отрочка публикации CVE увеличена на час
  {
    id: 'deck-cve-delay-publish',
    humanReadableName: 'Криптоанархист',
    description: 'отрочка публикации CVE увеличена на час',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker'],
    modifier: [],
  },
  // количество нужных дампов для получения CVE на один меньше
  {
    id: 'deck-cve-mechmath',
    humanReadableName: 'вывих мозга "МехМат"',
    description: 'количество нужных дампов для получения CVE на один меньше',
    availability: 'closed',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-decker'],
    modifier: [],
  },
  // Игрок может использовать одноручный меч и прокачивать навыки использования других спрайтов красной комнаты
  {
    id: 'sprites-combat',
    humanReadableName: 'Использование спрайтов в Красной комнате',
    description: 'Ты можешь пользоваться спрайтами в красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // Игрок может использовать доступные комплексные формы в красной комнате
  {
    id: 'complex-form-combat',
    humanReadableName: 'Комплексные формы в Красной комнате',
    description: 'Ты можешь использовать комплексные формы в красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer'],
    modifier: [],
  },
  // techno.fading - 2 в минуту
  {
    id: 'fading-decrease-basic',
    humanReadableName: 'Уменьшение фейдинга базовое',
    description: 'Фейдинг персонажа уменьшается на 2 единицы в минуту',
    availability: 'open',
    karmaCost: 0,
    prerequisites: ['arch-hackerman-technomancer'],
    pack: { id: 'gen-arch-hackerman-technomancer', level: 1 },
    modifier: [modifierFromEffect(increaseFadingDecrease, { amount: 2 })],
  },
  // techno.fading - 4 в минуту
  //
  {
    id: 'fading-decrease-2',
    humanReadableName: 'Уменьшение фейдинга ускоренное',
    description: 'Фейдинг персонажа уменьшается на ещё 2 единиц в минуту',
    availability: 'open',
    karmaCost: 50,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic', 'fading-decrease-basic'],
    modifier: [modifierFromEffect(increaseFadingDecrease, { amount: 2 })],
  },
  // drones.recoverySkill +4
  {
    id: 'drone-recovery-bonus-1',
    humanReadableName: 'Ремонт бонус 1',
    description: 'Улучшает способность по ремонту дронов в Мастерской.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger'],
    modifier: [modifierFromEffect(increaseRecoverySkill, { amount: 4 })],
  },
  // drones.recoverySkill +4
  {
    id: 'drone-recovery-bonus-2',
    humanReadableName: 'Ремонт бонус 2',
    description: 'Сильнее улучшает способность по ремонту дронов в Мастерской.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'drone-recovery-bonus-1'],
    modifier: [modifierFromEffect(increaseRecoverySkill, { amount: 4 })],
  },
  // drones.recoverySkill +4
  {
    id: 'drone-recovery-bonus-3',
    humanReadableName: 'Ремонт бонус 3',
    description: 'Максимально улучшает способность по ремонту дронов в Мастерской.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-rigger', 'drone-recovery-bonus-2'],
    modifier: [modifierFromEffect(increaseRecoverySkill, { amount: 4 })],
  },
  //
  {
    id: 'meta-digital',
    humanReadableName: 'Цифровой разум',
    description: 'Ты цифровой разум, сгусток программ и кода, живущий в Матрице. ',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [],
  },
  // resonance +1
  {
    id: 'resonanse-increase1',
    humanReadableName: 'Погружение в Резонанс 1',
    description: 'Увеличивает Резонанс на +1',
    availability: 'open',
    karmaCost: 100,
    prerequisites: ['arch-hackerman-technomancer', 'backdoor-hold-5'],
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // resonance +1
  {
    id: 'resonanse-increase2',
    humanReadableName: 'Погружение в Резонанс 2',
    description: 'Увеличивает Резонанс на +1',
    availability: 'open',
    karmaCost: 100,
    prerequisites: ['arch-hackerman-technomancer', 'resonanse-increase1', 'runaway'],
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // resonance +1
  {
    id: 'resonanse-increase3',
    humanReadableName: 'Погружение в Резонанс 3',
    description: 'Увеличивает Резонанс на +1',
    availability: 'open',
    karmaCost: 100,
    prerequisites: ['arch-hackerman-technomancer', 'resonanse-increase2'],
    modifier: [modifierFromEffect(increaseResonance, { amount: 1 })],
  },
  // позволяет читать данные из геоноды.
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-geo-1',
    humanReadableName: 'Спец по гео-1',
    description: 'возможность использовать useapi read на геоноде',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    modifier: [],
  },
  // позволяет лучше читать данные из геоноды.
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-geo-2',
    humanReadableName: 'Спец по гео-2',
    description: 'возможность использовать расширенную useapi read на геоноде',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'arch-hack-tech-geo-1'],
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из геоноды.
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-geo-3',
    humanReadableName: 'Спец по гео-3',
    description: 'возможность использовать расширенную и улучшенную useapi read на геоноде',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-hackerman-technomancer', 'arch-hack-tech-geo-2'],
    modifier: [],
  },
  // позволяет читать данные из биомонитора и rcc
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-bio-1',
    humanReadableName: 'Спец по био/инфо-1',
    description: 'возможность использовать useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    modifier: [],
  },
  // позволяет лучше читать данные из биомонитора и rcc.
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-bio-2',
    humanReadableName: 'Спец по био/инфо-2',
    description: 'возможность использовать расширенную useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'arch-hack-tech-bio-1'],
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из биомонитора и rcc.
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-bio-3',
    humanReadableName: 'Спец по био/инфо-3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на биомониторе и rcc',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-hackerman-technomancer', 'arch-hack-tech-bio-2'],
    modifier: [],
  },
  // позволяет читать данные из экономноды
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-econ-1',
    humanReadableName: 'Спец по экономике-1',
    description: 'возможность использовать useapi read на экономноде',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    modifier: [],
  },
  // позволяет лучше читать данные из экономноды.
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-econ-2',
    humanReadableName: 'Спец по экономике-2',
    description: 'возможность использовать расширенную useapi read на экономноде.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'arch-hack-tech-econ-1'],
    modifier: [],
  },
  // позволяет больше и еще лучше читать данные из экономноды.
  // Абилка-маркер для сайта Кривды
  {
    id: 'arch-hack-tech-econ-3',
    humanReadableName: 'Спец по экономике-3',
    description: 'возможность использовать расширенную и улучшкеную useapi read на экономноде',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-hackerman-technomancer', 'arch-hack-tech-econ-2'],
    modifier: [],
  },
  // techno.fading - 7 в минуту
  //
  {
    id: 'fading-decrease-3',
    humanReadableName: 'Уменьшение фейдинга максимальное',
    description: 'Фейдинг персонажа уменьшается ещё на 3 единиц в минуту',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-hackerman-technomancer', 'fading-decrease-2'],
    modifier: [modifierFromEffect(increaseFadingDecrease, { amount: 3 })],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'keys',
    humanReadableName: 'Спрайт "ключи"',
    description: 'Ты умеешь использовать спрайт "Ключи" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'water-walkers',
    humanReadableName: 'Спрайт "кувшинки" (мокроступы)',
    description: 'Ты умеешь использовать спрайт "Кувшинки" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'pen-n-note',
    humanReadableName: 'Спрайт "блокнот и карандаш"',
    description: 'Ты умеешь использовать спрайт "Блокнот и карандаш" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'balls',
    humanReadableName: 'Спрайт "шарики"',
    description: 'Ты умеешь использовать спрайт "Шарики" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'rubber-glowes',
    humanReadableName: 'Спрайт "перчатки"',
    description: 'Ты умеешь использовать спрайт "Перчатки" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'racket',
    humanReadableName: 'Спрайт "ракетка"',
    description: 'Ты умеешь использовать спрайт "Ракетка" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'rubber-glowes'],
    modifier: [],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'candy',
    humanReadableName: 'Спрайт "конфетка"',
    description: 'Ты умеешь использовать спрайт "Конфетка" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // Игрок имеет право использовать этот пердмет в данже
  {
    id: 'pipe',
    humanReadableName: 'Спрайт "труба"',
    description: 'Ты умеешь использовать спрайт "Труба" в Основании',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-basic'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'armor-light',
    humanReadableName: 'легкий доспех',
    description: 'Ты можешь использовать Легкий доспех в Красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-combat'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'armor-heavy',
    humanReadableName: 'тяжелый доспех',
    description: 'Ты можешь использовать Тяжелый доспех в Красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'armor-light'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'sword-short',
    humanReadableName: 'одноручный меч',
    description: 'Ты можешь использовать Одноручный меч в Красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-combat'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'sword-twohanded',
    humanReadableName: 'двуручный меч',
    description: 'Ты можешь использовать  Двуручный меч в Красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sword-short', 'control-basic'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'sword-short-doubled',
    humanReadableName: 'два одноручных меча',
    description: 'Ты можешь использовать два одноручных меча  в Красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sword-short', 'control-basic'],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'initiative-sign',
    humanReadableName: 'значок иициативы',
    description: 'Ты можешь использовать значок инициативы в Красной комнате',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-hackerman-technomancer', 'sprites-combat', 'initiative-basic'],
    modifier: [],
  },
  // Абилка ничего модельного не делает
  {
    id: 'paralizard-effect',
    humanReadableName: 'Paralizard-effect',
    description:
      'Ты можешь касанием (рукой или кинжалом) И криком "Паралич!" парализовать одно любое мясное/эктоплазменное тело на 90 секунд.\nПарализованное тело не способно передвигаться, уклоняться, применять какие-либо способности. Может говорить, может являться целью чужих способностей (в том числе, требующих скана QR).',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'death-touch-effect',
    humanReadableName: 'Death Touch-effect',
    description:
      'Ты можешь касанием (рукой или кинжалом) И криком "Смертный час!" лишить всех хитов одно любое мясное/эктоплазменное тело - игнорируя любую броню',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Кукла живет +1 час (итого 3 часа)
  {
    id: 'voodoo-people-boost',
    humanReadableName: 'Кукла вуду - улучшенная',
    description: 'Куклы, создаваемые тобой, существуют дольше',
    availability: 'closed',
    karmaCost: 50,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Кукла живет +1 час (итого 4 часа)
  {
    id: 'voodoo-people-boost-super',
    humanReadableName: 'Кукла вуду - максимальная',
    description: 'Куклы, создаваемые тобой, существуют еще дольше',
    availability: 'closed',
    karmaCost: 50,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'let-it-go-effect',
    humanReadableName: 'Let it go Effect',
    description:
      'В течение 1 минуты ты можешь изгнать одного материализованного духа. Потребуется коснуться его рукой или кинжалом с возгласом "Изыди!"\r\nПосле этого дух теряет все хиты.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // Описание способностей дронов разных
  {
    id: 'drone-heavy',
    humanReadableName: 'Дрон броня',
    description: 'Тяжелая броня.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['in-drone'],
    modifier: [],
  },
  // maxTimeInVr +6000
  {
    id: 'digital-life',
    humanReadableName: 'Цифровая форма жизни',
    description: 'Ты можешь неограниченное время пребывать в VR',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [modifierFromEffect(increaseMaxTimeInVr, { amount: 6000 })],
  },
  //
  {
    id: 'vr-protection',
    humanReadableName: 'Защита в Виар',
    description: 'К тебе нельзя применить способности, заставляющие покинуть VR',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [],
  },
  // Отличный скоринг и хорошие цены (работает как у Эльфов) - сверить с Марьяной
  {
    id: 'digital-prices',
    humanReadableName: 'Прекрасные цены',
    description: 'У тебя отличный скоринг и выгодные цены',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [],
  },
  //
  {
    id: 'hotsim-ever',
    humanReadableName: 'А ты горяч!',
    description: 'В Виаре ты в находишься в состоянии Хотсим. Ты включен, бодр, горяч и можешь пользоваться способностями.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [],
  },
  //
  {
    id: 'arch-digital',
    humanReadableName: 'Цифровая сущность',
    description: 'Цифровая сущность, егост или агент',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'sub-agent',
    humanReadableName: 'Агент',
    description: 'Ты сервисная программа, которая обеспечивает работу хоста в Матрице',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    modifier: [],
  },
  //
  {
    id: 'sub-eghost',
    humanReadableName: 'Электронный призрак',
    description: 'Ты сервисная программа с нарушением кода',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    modifier: [],
  },
  //
  {
    id: 'sub-ai',
    humanReadableName: 'Проекция ИИ',
    description: 'Ты часть проекции Искусственного Интеллекта, сгусток программ и кода, живущий в Матрице. ',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    modifier: [],
  },
  //
  {
    id: 'ai-techno-copy',
    humanReadableName: 'Digital Techno Copyrast',
    description: 'Этот ИИ научился подражать способностям Техноманта. Все эти способности работают только в Основании.',
    availability: 'closed',
    karmaCost: 30,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'sub-surge',
    humanReadableName: 'SURGE',
    description: 'Ты болеешь SURGE.  (необъяснимая генетическая экспрессия). Некоторые части твоего тела превратились в звериные.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'geomancy',
    humanReadableName: 'Geomancy',
    description: 'Ты можешь изучить заклинания геомантии.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // spirit.maxTimeInside+30
  {
    id: 'nice-suit',
    humanReadableName: 'Nice suit',
    description: 'Увеличивает продолжительность призыва духа на 30 минут',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-mage', 'suit-up'],
    modifier: [],
  },
  //
  {
    id: 'dual-layer-suit',
    humanReadableName: 'Dual layer suit',
    description: 'У духов, которых ты призываешь на 1 хит больше',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-mage', 'suit-up'],
    modifier: [],
  },
  // spirit.maxTimeInside+30
  {
    id: 'leisure-suit',
    humanReadableName: 'Leisure suit',
    description: 'Увеличивает продолжительность призыва духа еще на 30 минут',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-mage', 'nice-suit'],
    modifier: [],
  },
  // spirit.recoveryTime-30
  {
    id: 'fast-dress-up',
    humanReadableName: 'Fast dress up',
    description: 'Сокращает время между призывами духа на 30 минут',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-mage', 'suit-up'],
    modifier: [],
  },
  // текстовая
  {
    id: 'ethic-violence',
    humanReadableName: 'Танатос',
    description: 'Добей 10 человек в КС. Сними пруфы этого. Покажи региональному мастеру',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Ментальная защита +2
  {
    id: 'ethic-freedom',
    humanReadableName: 'Вольный стрелок',
    description: 'Ты получаешь +2 к ментальной защите. Эффект постоянный.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMentalProtection, { amount: 2 })],
  },
  // maxTimeInVr +30
  {
    id: 'ethic-emotions',
    humanReadableName: 'Ловец эмоций',
    description: 'Твое время в VR увеличено на 30 минут. Развлекайся!',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMaxTimeInVr, { amount: 30 })],
  },
  // Разблокирует возможность сканить во время каста qr-коды мясных тел в состоянии здоров/тяжран (не годятся КС/АС) для эффекта "православный ритуал": N уникальных сосканированных за время действия заклинания qr-кодов для этого заклинания:
  // 1) добавляют √N (округленное вверх) к выбранной магом Мощи
  // 2) включают в КоэффициентСниженияОтката множитель 1/(2+N)
  {
    id: 'monastery-ritual-magic',
    humanReadableName: 'Монастырская ритуальная магия',
    description: 'Во время каста можно использовать людей (сканируя их QR) для увеличения доступной Мощи и снижения Отката',
    availability: 'closed',
    karmaCost: 60,
    prerequisites: ['arch-mage'],
    modifier: [],
  },
  // chemo.crysisThreshold +20
  //
  {
    id: 'ethic-wuxing',
    humanReadableName: 'Гармония Усин',
    description:
      'Защита от вредных веществ\nГармония и сохранение позволяют последователям Усин поддерживать баланс веществ и энергий в организме. Порог Кризиса по веществам у тебя увеличен.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Неудача 50% при использовании на персонажа абилки repoman-black
  {
    id: 'ethic-arepo',
    humanReadableName: '',
    description: 'Увеличвает вероятность неудачи, если с тебя рипомен срезает имплант.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая
  {
    id: 'ethic-unbind',
    humanReadableName: 'Абсолютная свобода',
    description:
      'Ты можешь снимать любые веревки с себя (даже в связанном состоянии), можешь открывать любые замки. На тебя не действует оглушение. Способность действует всегда.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая
  {
    id: 'ethic-roleplay',
    humanReadableName: 'Ролеплей',
    description:
      'Покажи это цели. Расскажи ему историю, кто ты, кто он и почему он должен быть наказан. Цель испытвает непреодолимое желание, чтобы его наказали прямо сейчас.  Помоги ему и накажи цель. Если ты причинишь цели ущерб (снимешь хит) - воздействие тут же спадет. Иначе - воздействие держится десять минут. Цель всё осознает. Ты можешь использовать эту способность один раз за цикл.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // hacking.fadingDecrease =3
  {
    id: 'ethic-kokkoro',
    humanReadableName: 'Бэкдор по знакомству',
    description: 'Более быстрое уменьшение фейдинга',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'ethic-kazak',
    humanReadableName: 'Казацкая сабля',
    description: 'Защита от нежити. Если ты сражаешься против Гулей или Вампиров - у тебя +2 хита (максимум 6)',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'ethic-sila',
    humanReadableName: 'Сила в Правде',
    description:
      'В чем сила, брат? Сила в Правде! Для того, чтобы использовать пулемет или двуручное оружие - тебе достаточно одной кибер руки \\ способности Биосила.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Больше экзорцизма. Лучше изгонять духов. Убийство гуля - позволяет вылечить кого-то рядом
  {
    id: 'ethic-carrion',
    humanReadableName: 'Лечебные ингредиенты',
    description: 'Ты можешь вылечить персонажа (восстановить все хиты, но НЕ поднять из тяжрана), если добьешь гуля. ',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая абилка
  {
    id: 'ethic-avidity',
    humanReadableName: 'Убийственная жадность.',
    description: 'Если на тебя применяют способность менталиста "прогулка миллионера" - ты  переводишь не 20%, а 10%',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Если в бою уаствуют 3 члена триад (дискурса) - каждый получает +1 хит
  {
    id: 'ethic-triada',
    humanReadableName: 'Сила Триады',
    description: 'Если в бою участвует 3 и более членов триады (дискурса) с этой способностью - каждый из них получает +1 хит (максимум 6)',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая
  {
    id: 'ethic-badass',
    humanReadableName: 'Сила ненависти',
    description:
      'В боестолкновении, где Бэдэс сражается против мясных чаммеров - он получает дополнительные хиты. (В Основании +2, максимум 10. В мясном мире +1, максимум 6, применимо к дронам)',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая
  {
    id: 'ethic-horizon',
    humanReadableName: 'Сила слова',
    description:
      'Твои тексты высоко ценятся в СМИ и повышают им рейтинг. Напиши за цикл не менее трех сообщений (строго в одно СМИ), используй личный хештег и тег #вестник - и твой вклад будет учтен..\nЕсли ты журналист - получи +2 очка влияния за цикл. Заяви это мастеру по СМИ',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  {
    id: 'ethic-buryaty',
    humanReadableName: 'Волшебство',
    description: 'Ты получаешь +1 к Магии и Харизме. -2 к Интеллекту, -1 к Боди.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая
  {
    id: 'ethic-aks',
    humanReadableName: 'Увлеченный рассказчик. ',
    description:
      'Покажи это цели. Расскажи ему историю, кто ты, кто он и что вы сейчас делаете. Цель верит тебе и испытывает непреодолимое желание делать то, что ты рассказываешь. Помоги ему и сделай то, о чем ты говоришь. Если в процессе взаимодействия цели будет причинен любой ущерб (потеря хитов, потеря имущества...) - воздействие тут же спадет. Иначе - воздействие держится пять минут. Цель всё осознает. Ты можешь использовать эту способность один раз за цикл.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // текстовая
  {
    id: 'ethic-lzg',
    humanReadableName: 'Заживление ран',
    description:
      'Ты можешь вылечить себе два хита, прикоснувшись к Гулю. Обними гуля на одну минуту. Ты можешь использовать эту способность один раз в час.\nНе работает, если ты находишься в тяжелом ранении.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'ethic-reason',
    humanReadableName: 'Холодный разум',
    description:
      'Твои тексты высоко ценятся в СМИ и повышают им рейтинг. Напиши за цикл не менее трех сообщений (строго в одно СМИ), используй личный хештег и тег #аналитик - и твой вклад будет учтен..',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Пассивная. Закрытая. Выдается мастерами.
  {
    id: 'vr-who-is',
    humanReadableName: 'Who Is',
    description:
      'Ты можешь спросить чаммера кто он - и он должен назвать тебе имя, метатип и регион.  Абилка Режим Инкогнито защищает от проверки.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['!arch-mage'],
    modifier: [],
  },
  //
  {
    id: 'vr-deanon',
    humanReadableName: 'Деанон',
    description:
      'Ты можешь спросить чаммера кто он (даже с режимом Инкогнито)  - и он должен назвать тебе имя, метатип, регион и SIN. От проверки защищает только абилка режим Firewall.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['vr-who-is'],
    modifier: [],
  },
  //
  {
    id: 'vr-incognito',
    humanReadableName: 'Режим "Инкогнито"',
    description:
      'Если ты находишься в VR в аватарке (плащ, очки, или зачипованная аватарка), то тебя нельзя узнать без применения специальных абилок или способностей. Абилка Who is на вас не действует.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: [],
    modifier: [],
  },
  // maxTimeInVr +30
  {
    id: 'vr-firewall',
    humanReadableName: 'Режим "Фаервол"',
    description:
      'Ты нарисовал себе классную аватарку. Молодец! Тебя нельзя деанонимировать никаким способом. Если кто-то пытается - покажи ему этот текст. И да, у тебя +30 минут в VR! Развлекайся, чаммер!',
    availability: 'closed',
    karmaCost: 20,
    prerequisites: [],
    modifier: [],
  },
  // Пассивная. Закрытая. Выдается мастерами при генережке
  {
    id: 'vr-employee',
    humanReadableName: 'Работник VR',
    description: 'Сотрудник заведения VR, подтвержденный мастером региона',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // maxTimeInVr +120
  {
    id: 'vr-employee-long-time',
    humanReadableName: 'Я работаю в VR',
    description: 'Твое время в VR увеличено на 2 часа.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['vr-employee'],
    modifier: [modifierFromEffect(increaseMaxTimeInVr, { amount: 120 })],
  },
  // maxTimeInVr +30
  {
    id: 'vr-better-vr',
    humanReadableName: 'Better VR',
    description: 'Возможность времени в VR увеличена на 30 минут.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [modifierFromEffect(increaseMaxTimeInVr, { amount: 30 })],
  },
  // maxTimeInVr +30
  {
    id: 'vr-more-better-vr',
    humanReadableName: 'More Better VR',
    description: 'Возможность времени в VR увеличена еще на 30 минут.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['vr-better-vr'],
    modifier: [modifierFromEffect(increaseMaxTimeInVr, { amount: 30 })],
  },
  //
  {
    id: 'compile-hotsim',
    humanReadableName: 'Скомпилировать аватарку (хотсим)',
    description: 'Если у тебя сняли все хиты - ты можешь собрать себя обратно. Проведи у Ассемблера 45 минут для компиляции.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: ['arch-digital'],
    pack: { id: 'gen-meta-digital', level: 1 },
    modifier: [],
  },
  // Требуется согласование с Марьяной
  {
    id: 'neo-legacy',
    humanReadableName: 'Наследство Нео',
    description: 'Небольшой пассивный доход',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-digital', 'sub-eghost'],
    modifier: [],
  },
  //
  {
    id: 'restioration-1',
    humanReadableName: 'Жажда действий',
    description: 'Тебе достаточно провести 30 минут у ассемблера для компиляции',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-digital', 'compile-hotsim', 'sub-ai'],
    modifier: [],
  },
  //
  {
    id: 'restioration-2',
    humanReadableName: 'Жажда действий 2.0',
    description: 'Тебе достаточно провести 15 минут у ассемблера для компиляции',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-digital', 'restioration-1'],
    modifier: [],
  },
  // Depth +1,  Intelligence +1, Body +1, Resonance +1, Charisma +1
  {
    id: 'depth-master',
    humanReadableName: 'Повелитель Глубины',
    description: 'Ты развиваешь свою Глубину и повышаешь эффективность использования навыков.. Глубина +1',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-digital', 'sub-ai'],
    modifier: [
      modifierFromEffect(increaseDepth, { amount: 1 }),
      modifierFromEffect(increaseIntelligence, { amount: 1 }),
      modifierFromEffect(increaseBody, { amount: 1 }),
      modifierFromEffect(increaseResonance, { amount: 1 }),
      modifierFromEffect(increaseCharisma, { amount: 1 }),
    ],
  },
  // Depth +1,  Intelligence +1, Body +1, Resonance +1, Charisma +1
  {
    id: 'deep-er',
    humanReadableName: 'Глубже',
    description: 'Ты очень хорошо чувствуешь происходящее в Матрице, Глубина +1',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-digital', 'depth-master'],
    modifier: [
      modifierFromEffect(increaseDepth, { amount: 1 }),
      modifierFromEffect(increaseIntelligence, { amount: 1 }),
      modifierFromEffect(increaseBody, { amount: 1 }),
      modifierFromEffect(increaseResonance, { amount: 1 }),
      modifierFromEffect(increaseCharisma, { amount: 1 }),
    ],
  },
  // Depth +1,  Intelligence +1, Body +1, Resonance +1, Charisma +1
  {
    id: 'more-deep-er',
    humanReadableName: 'Еще глубже',
    description: 'Тебе все проще дается взаимодействие с Матрицей, Глубина +1',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-digital', 'deep-er'],
    modifier: [
      modifierFromEffect(increaseDepth, { amount: 1 }),
      modifierFromEffect(increaseIntelligence, { amount: 1 }),
      modifierFromEffect(increaseBody, { amount: 1 }),
      modifierFromEffect(increaseResonance, { amount: 1 }),
      modifierFromEffect(increaseCharisma, { amount: 1 }),
    ],
  },
  // Depth +1,  Intelligence +1, Body +1, Resonance +1, Charisma +1
  {
    id: 'just-like-that',
    humanReadableName: 'Ну очень глубоко',
    description: 'Ты повелитель глубинных слоев Матрицы, Глубина+1',
    availability: 'open',
    karmaCost: 60,
    prerequisites: ['arch-digital', 'more-deep-er'],
    modifier: [
      modifierFromEffect(increaseDepth, { amount: 1 }),
      modifierFromEffect(increaseIntelligence, { amount: 1 }),
      modifierFromEffect(increaseBody, { amount: 1 }),
      modifierFromEffect(increaseResonance, { amount: 1 }),
      modifierFromEffect(increaseCharisma, { amount: 1 }),
    ],
  },
  // drones.medicraftBonus +1
  // drones.aircraftBonus  +1
  // drones.groundcraftBonus +2
  // drones.autodocBonus +1
  // drones.maxTimeInside +10
  // rigging.repomanBonus +2
  {
    id: 'ethic-sila-chrome',
    humanReadableName: 'Сила в Хроме',
    description: 'В чем сила, брат? Сила в Хроме!  + ко всем "боевым" навыкам риггера',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: ['arch-rigger'],
    modifier: [],
  },
  //
  {
    id: 'media-person',
    humanReadableName: 'Медиа-персона',
    description: 'Ты медиа персона и можешь развивать навыки работы со СМИ, новостями и информацией.',
    availability: 'closed',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'ai-explorer',
    humanReadableName: 'AI eXplore',
    description: 'Этот ИИ занимается не-цифровым миром.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'sub-ai'],
    modifier: [],
  },
  //
  {
    id: 'do-it-yourself-one',
    humanReadableName: 'Хочешь что-то сделать - сделай сам 1.0',
    description: 'Ты можешь подключаться к биологическому чаммеру, пораженному CFD, первого уровня. CFD-1',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'ai-explorer'],
    modifier: [],
  },
  //
  {
    id: 'do-it-yourself-two',
    humanReadableName: 'Хочешь что-то сделать - сделай сам 2.0',
    description: 'Увеличивает способноcть управления мясными телами. Теперь ты можешь подключаться к CFD-2',
    availability: 'closed',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'do-it-yourself-one'],
    modifier: [],
  },
  //
  {
    id: 'do-it-yourself-three',
    humanReadableName: 'Хочешь что-то сделать - сделай сам 3.0',
    description: 'Увеличивает способноcть управления мясными телами. Теперь ты можешь подключаться к CFD-3. Лучшие мясные тела для тебя!',
    availability: 'closed',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'do-it-yourself-two'],
    modifier: [],
  },
  // Характеристика - Depth +2
  {
    id: 'ai-researcher',
    humanReadableName: 'AI eXpand',
    description:
      'Этот ИИ занимается Расширением в Цифровом мире и Проектами. Все способности этой ветки требуют обращения к мастеру-региональщику.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'sub-ai'],
    modifier: [modifierFromEffect(increaseDepth, { amount: 2 })],
  },
  //
  {
    id: 'ai-project-creation',
    humanReadableName: 'Рассчитать Проект',
    description: 'Получить рецепт Проекта потратив Позитив.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'ai-researcher'],
    modifier: [],
  },
  //
  {
    id: 'ai-project-creation-essens',
    humanReadableName: 'Прочувствовать Проект',
    description: 'Получить рецепт Проекта потратив Эссенс.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'ai-researcher'],
    modifier: [],
  },
  //
  {
    id: 'ai-project-boost',
    humanReadableName: 'Не нашел, а наторговал!',
    description: 'Обменять Позитив на ресурс для Проекта.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'ai-researcher'],
    modifier: [],
  },
  //
  {
    id: 'ai-manager',
    humanReadableName: 'AI eXploit',
    description: 'Этот ИИ занимается Эксплуатацией. Все способности этой ветки требуют обращения к мастеру-региональщику.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'sub-ai'],
    modifier: [],
  },
  // Depth +1
  {
    id: 'ai-troubleshooter',
    humanReadableName: 'AI eXterminate',
    description: 'Этот ИИ занимается Уничтожением и Техномантами.',
    availability: 'master',
    karmaCost: 50,
    prerequisites: ['arch-digital', 'sub-ai'],
    modifier: [modifierFromEffect(increaseDepth, { amount: 1 })],
  },
  // 360-20*character.depth
  {
    id: 'back-up-ai',
    humanReadableName: 'BackUp',
    description:
      'После смерти в Красной комнате вы восстанавливаетесь в полных хитах как на начало боя и можете продолжить сражаться. Работает один раз в 6 часов.',
    availability: 'master',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'ai-troubleshooter'],
    modifier: [],
  },
  // 180-20*character.depth
  {
    id: 'fish-in-water',
    humanReadableName: 'Рыба в воде',
    description:
      'Ты можешь изменить менять формат боя в Красной Комнате по своему выбору из двух доступных: групповое сражение и дуэль. В случае, если несколько проекций ИИ используют эту способность одновременно, право выбора решает жребий.',
    availability: 'master',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'ai-troubleshooter'],
    modifier: [],
  },
  //
  {
    id: 'programm-code-ai',
    humanReadableName: 'Программный код',
    description: '+1 хит в Красной Комнате',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'ai-troubleshooter'],
    modifier: [],
  },
  //
  {
    id: 'super-programme-code',
    humanReadableName: 'Усиленный программный код',
    description: 'еще +1 хит в Красной Комнате',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'programm-code-ai'],
    modifier: [],
  },
  //
  {
    id: 'die-hard',
    humanReadableName: 'Крепкий орешек',
    description: 'еще +1 хит в Красной Комнате',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'super-programme-code'],
    modifier: [],
  },
  //
  {
    id: 'deep-legacy',
    humanReadableName: 'Наследник Стрелка',
    description: 'Ты можешь использовать любое холодное оружие в Красной комнате. ',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'programm-code-ai'],
    modifier: [],
  },
  //
  {
    id: 'situation-analazis',
    humanReadableName: 'Анализ ситуации',
    description: 'Инициатива +2 в Красной комнате',
    availability: 'master',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'ai-troubleshooter'],
    modifier: [],
  },
  // 120-10*character.depth
  {
    id: 'ai-buff-double-damage',
    humanReadableName: 'Двойной удар',
    description:
      'Усиление для Техномантов в Красной Комнате. Атаки цели снимают два хита вместо одного на протяжении одного конфликта в КК. Работает раз в час.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'ai-troubleshooter'],
    modifier: [],
  },
  // 120-10*character.depth
  {
    id: 'ai-dismorale',
    humanReadableName: 'Провал морали',
    description:
      'Ослабление для Техномантов в Красной Комнате. Цель не может атаковать в течении одной минуты, только защищаться.  Работает раз в час.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'ai-troubleshooter'],
    modifier: [],
  },
  // 120-10*character.depth
  {
    id: 'ai-matrix-gift',
    humanReadableName: 'Матричный дар',
    description:
      'Усиление для Техномантов в Красной Комнате.  Атаки цели снимают два хита вместо одного на протяжении одного конфликта в КК. Применяется на 3 цели одновременно.   Работает раз в час.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'ai-buff-double-damage'],
    modifier: [],
  },
  // 120-10*character.depth
  {
    id: 'ai-matrix-curse',
    humanReadableName: 'Матричное проклятье',
    description:
      'Ослабление для Техномантов в Красной Комнате. Цель не может атаковать в течении одной минуты, только защищаться. Применяется на 3 цели одновременно.  Работает раз в час.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'ai-dismorale'],
    modifier: [],
  },
  //
  {
    id: 'ai-runaway',
    humanReadableName: 'AI Бегство из Основания',
    description:
      'Ты можешь покинуть основание когда захочешь. В процессе выхода тебя никто не может остановить или как-то с тобой взаимодейстовать. Ты не можешь взаимодействовать с другими персонажами или объектами. Работает раз в 2 часа.',
    availability: 'open',
    karmaCost: 40,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  //
  {
    id: 'ai-magnetism',
    humanReadableName: 'AI магнетизм',
    description:
      'У тебя в руках магнит, он притягивает любой предмет, который надо собрать в этой комнате, но только один. Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  //
  {
    id: 'ai-levitation',
    humanReadableName: 'AI левитация',
    description: 'Ты можешь спокойно обойти препятствие или топь по земле, считается, что ты летишь. Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-digital', 'ai-techno-copy', 'ai-magnetism', 'ai-add-basement'],
    modifier: [],
  },
  //
  {
    id: 'ai-bond-breaker',
    humanReadableName: 'AI освобождение от пут',
    description: 'Ты можешь освободить одну руку себе или товарищу. Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-digital', 'ai-techno-copy', 'ai-remove-excees'],
    modifier: [],
  },
  //
  {
    id: 'ai-one-for-all',
    humanReadableName: 'AI один за всех',
    description: 'Ты можешь пройти эту комнату один за всю свою команду. Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 20,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  //
  {
    id: 'ai-add-time-1',
    humanReadableName: 'AI больше времени +1',
    description: 'У вашей группы на 3 минуты больше времени в данже. Покажи это при входе в данж.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  //
  {
    id: 'ai-add-time-2',
    humanReadableName: 'AI больше времени +2',
    description: 'У вашей группы еще на 3 минуты больше времени в данже. (итого +6) Покажи это при входе в данж.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['ai-techno-copy', 'ai-add-time-1'],
    modifier: [],
  },
  //
  {
    id: 'ai-add-time-3',
    humanReadableName: 'AI больше времени +3',
    description: 'У вашей группы еще на 4 минуты больше времени в данже. (итого +10) Покажи это при входе в данж.',
    availability: 'open',
    karmaCost: 30,
    prerequisites: ['ai-techno-copy', 'ai-add-time-2'],
    modifier: [],
  },
  //
  {
    id: 'ai-add-basement',
    humanReadableName: 'AI добавить опору',
    description: 'Ты можешь создать дополнительную "опору" (круг 20 см). Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  //
  {
    id: 'ai-bell-silence',
    humanReadableName: 'AI молчание колокольчиков',
    description: 'Ты можешь задевать колокольчики, матрица их не услышит. Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  //
  {
    id: 'ai-photo-memory',
    humanReadableName: 'AI фотографическая память',
    description: 'Ты можешь сфотографировать объект и переслать фото другому участнику команды.  Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  //
  {
    id: 'ai-second-sight',
    humanReadableName: 'AI ясновидение',
    description: 'Теперь матрица (в лице игротеха) может подсказать тебе расположение двух деталей конструкции.  Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-digital', 'ai-techno-copy', 'ai-photo-memory'],
    modifier: [],
  },
  //
  {
    id: 'ai-remove-excees',
    humanReadableName: 'AI убрать все лишнее',
    description: 'Теперь матрица подскажет тебе, какие детали лишние.  Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-digital', 'ai-techno-copy', 'ai-remove-half'],
    modifier: [],
  },
  //
  {
    id: 'ai-remove-half',
    humanReadableName: 'AI убрать половину ',
    description: 'Теперь матрица убирает половину деталей, чтобы уменьшить сложность конструкции.  Работает раз в 10 минут.',
    availability: 'open',
    karmaCost: 10,
    prerequisites: ['arch-digital', 'ai-techno-copy'],
    modifier: [],
  },
  // модельного эффекта нет
  {
    id: 'mr-cellophane',
    humanReadableName: 'Mr.Cellophane',
    description:
      'Ты находишься в астральном плане. Необходимый маркер: красный дождевик.\nТы видишь и слышишь реальный мир, но не можешь воздействовать на него.\nИз реального мира тебя не воспринимают и никак не могут атаковать (если только у них нет абилки, которая явным образом утверждает иное).',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // модельного эффекта нет
  {
    id: 'hammer-time',
    humanReadableName: 'HammerTime',
    description: 'Можешь взять одноручное холодное оружие до 100см, оно считается тяжёлым.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // модельного эффекта нет
  {
    id: 'adamantaeu',
    humanReadableName: 'Adamantaeu',
    description: 'На тебя действует эффект тяжёлой брони.',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'fireball-back',
    humanReadableName: 'Fireball - back',
    description: 'Можешь кинуть 3 огненных шара. Затем эффект исчерпан до выхода из духа',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'fireball-halfback',
    humanReadableName: 'Fireball - halfback',
    description: 'Можешь кинуть 5 огненных шаров. Затем эффект исчерпан до выхода из духа',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'fireball-forward',
    humanReadableName: 'Fireball - forward',
    description: 'Можешь кинуть 9 огненных шаров. Затем эффект исчерпан до выхода из духа',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Все мясные/экто тела, касающиеся этого духа на протяжении 1 минуты, в конце этого интервала восстанавливают текущие хиты до максимума
  {
    id: 'over-the-pills',
    humanReadableName: 'Over the pills',
    description:
      'Все мясные/экто тела, касающиеся этого духа на протяжении 1 минуты, в конце этого интервала восстанавливают текущие хиты до максимума',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  //
  {
    id: 'fireball-keeper',
    humanReadableName: 'Fireball - keeper',
    description: 'Можешь кинуть 2 огненных шара. Затем эффект исчерпан до выхода из духа',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
    modifier: [],
  },
  // Все мясные/экто тела, щекочущие владельца абилки на протяжении 2 минут, в конце этой минуты восстанавливают текущие хиты до максимума
  {
    id: 'tick-a-lick-a-boo',
    humanReadableName: 'Tick-a-lick-a-boo',
    description:
      'Все мясные/экто тела, щекочущие этого духа на протяжении 2 минут, в конце этого интервала восстанавливают текущие хиты до максимума',
    availability: 'master',
    karmaCost: 0,
    prerequisites: [],
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
