import {
  absoluteDeathAbility,
  activateSoft,
  alloHomorusAbility,
  arrowgant,
  biomonitorScanAbility,
  changeAuraAbility,
  cloudMemoryAbility,
  dummyAbility,
  externalAbility,
  faerbolAbility,
  finishHimAbility,
  hammerOfJustice,
  howMuchItCosts,
  howMuchTheRent,
  investigateScoring,
  iWillSurvive,
  letHimPay,
  letMePay,
  marauderAbility,
  noItActionAbility,
  oneTimeRevive,
  pencilLargeAbility,
  repomanAbility,
  repomanBlackAbility,
  reRent,
  skinStoneAbility,
  sleepCheckAbility,
  takeNoHarmAbility,
  tincasmAbility,
  trollton,
  useSpriteAbility,
  whoNeedsIt,
} from './active_abilities';
import {
  billionerWalkAbility,
  danilaINeedHelpAbility,
  flyYouFoolAbility,
  fullOblivionAbility,
  iDontTrustAnybody,
  increaseTheMentalProtectionAbility,
  killHimAbility,
  lieToMeAbility,
  lukeIAmYourFatherAbility,
  oblivionAbility,
  paralysis1Ability,
  paralysis2Ability,
  paralysis3Ability,
  reallyNeedItAbility,
  reduceTheMentalProtectionAbility,
  scornHimAbility,
  tellMeTheTruthAbility,
  youDontTrustAnybody,
} from './mental';
import { capsuleReanimate, medcartHealAbility, medcartReviveAbility, reviveAbsoluteOnTarget, reviveOnTarget } from './death_and_rebirth';
import { TargetSignature } from '@alice/sr2020-common/models/sr2020-character.model';
import {
  chargeLocusAbility,
  discourseGroupAddAbility,
  discourseGroupAddGuru,
  discourseGroupExcludeAbility,
  discourseGroupInquisitor1,
  discourseGroupInquisitor2,
  prophetAbility,
} from './ethics';
import { setAllActiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
import { droneDangerAbility, droneRepairAbility, enterDrone, exitDrone } from '@alice/sr2020-model-engine/scripts/character/rigger';
import { getPillNameAbility, usePillsOnOthersAbility, whatsInTheBodyAbility } from '@alice/sr2020-model-engine/scripts/character/chemo';
import { nanohiveBackupAbility, nanohiveHealhAbility, nanohiveShooterAbility, nanohiveVrAbility } from './nanohives';
import { spiritsRelatedSpell } from '@alice/sr2020-model-engine/scripts/character/spells';
import { ghoulBite, gmRespawnHmhvv, vampireBite } from '@alice/sr2020-model-engine/scripts/character/hmhvv';
import { jackInAbility, jackOutAbility, settleBackdoorAbility } from '@alice/sr2020-model-engine/scripts/character/hackers';
import { exitSpirit, spiritEmergencyExit } from '@alice/sr2020-model-engine/scripts/character/spirits';
import { ActiveAbility } from '@alice/sr2020-common/models/common_definitions';
import { gmDecreaseMaxEssence, gmEssenceReset, gmIncreaseMaxEssence } from '@alice/sr2020-model-engine/scripts/character/essence';
import { kMerchandiseQrTypes } from '@alice/sr2020-common/models/qr-code.model';
import { enterVr, exitVr } from '@alice/sr2020-model-engine/scripts/character/vr';

const kHealthyBodyTargeted: TargetSignature[] = [
  {
    name: 'Персонаж',
    allowedTypes: ['HEALTHY_BODY'],
    field: 'targetCharacterId',
  },
];
const kMedcartHealthyBodyTargeted: TargetSignature[] = [
  {
    name: 'Пациент',
    allowedTypes: ['HEALTHY_BODY'],
    field: 'targetCharacterId',
  },
];
const kMedcartWoundedBodyTargeted: TargetSignature[] = [
  {
    name: 'Пациент',
    allowedTypes: ['WOUNDED_BODY'],
    field: 'targetCharacterId',
  },
];
const kMedcartDeadBodyTargeted: TargetSignature[] = [
  {
    name: 'Пациент',
    allowedTypes: ['CLINICALLY_DEAD_BODY'],
    field: 'targetCharacterId',
  },
];
const kNonDeadBodyTargeted: TargetSignature[] = [
  {
    name: 'Персонаж',
    allowedTypes: ['HEALTHY_BODY', 'WOUNDED_BODY'],
    field: 'targetCharacterId',
  },
];
const kAstralBodyTargeted: TargetSignature[] = [
  {
    name: 'Дух',
    allowedTypes: ['ASTRAL_BODY'],
    field: 'targetCharacterId',
  },
];
const kPhysicalBodyTargeted: TargetSignature[] = [
  {
    name: 'Персонаж',
    allowedTypes: ['HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY', 'ABSOLUTELY_DEAD_BODY'],
    field: 'targetCharacterId',
  },
];
const kLocusAndPhysicalBody: TargetSignature[] = [
  {
    name: 'Локус',
    allowedTypes: ['locus'],
    field: 'locusId',
  },
  ...kPhysicalBodyTargeted,
];
const kNoTarget: TargetSignature[] = [];
const kMerchandiseTargeted: TargetSignature = {
  name: 'Товар',
  allowedTypes: kMerchandiseQrTypes,
  field: 'qrCodeId',
};
const kBodyStorageTarget: TargetSignature = {
  name: 'Телохранилище',
  allowedTypes: ['body_storage'],
  field: 'bodyStorageId',
};
const kPillTarget: TargetSignature = {
  name: 'Препарат',
  allowedTypes: ['pill'],
  field: 'pillId',
};
const kBodyStorageTargeted = [kBodyStorageTarget];
const kDroneAndBodyStorageTargeted: TargetSignature[] = [
  {
    name: 'Дрон',
    allowedTypes: ['drone'],
    field: 'droneId',
  },
  kBodyStorageTarget,
];
const kSpiritAndBodyStorageTargeted: TargetSignature[] = [
  {
    name: 'Дух',
    allowedTypes: ['spirit'],
    field: 'droneId',
  },
  kBodyStorageTarget,
];
const kEmptyQrTarget: TargetSignature = {
  name: 'Контейнер',
  allowedTypes: ['empty'],
  field: 'qrCodeId',
};
const kWoundedBodyTarget: TargetSignature = {
  name: 'Жертва',
  allowedTypes: ['WOUNDED_BODY'],
  field: 'targetCharacterId',
};
const kBodyAndContainerTargeted: TargetSignature[] = [...kPhysicalBodyTargeted, kEmptyQrTarget];
// Not exported by design, use kAllActiveAbilities instead.
export const kAllActiveAbilitiesList: ActiveAbility[] = [
  //
  {
    id: 'ground-heal-ability',
    humanReadableName: 'Ground Heal - Эффект',
    description: 'Поднимает одну цель из КС/тяжрана в полные хиты.',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['WOUNDED_BODY', 'CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: (character) => 0,
    prerequisites: ['arch-mage'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: oneTimeRevive.name,
  },
  // добивание до АС (из тяжрана или КС)
  {
    id: 'absolutely-finish-him',
    humanReadableName: 'абсолютная смерть',
    description: 'Ты можешь добивать персонажа в Абсолютную смерть',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Жертва',
        allowedTypes: ['WOUNDED_BODY', 'CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: (character) => 180,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 100,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: absoluteDeathAbility.name,
  },
  // Применяется к мясному телу в состоянии "тяжело ранен" - переводит его в состояние КС.
  //
  {
    id: 'finish-him',
    humanReadableName: 'Добивание тела из тяжрана в КС',
    description: 'Добей это тело!  *работает только на биологические объекты',
    target: 'scan',
    targetsSignature: [kWoundedBodyTarget],
    cooldownMinutes: (character) => 30,
    prerequisites: [],
    pack: { id: 'chummer-zero', level: 1 },
    availability: 'open',
    karmaCost: 120,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: finishHimAbility.name,
  },
  // Целевой персонаж забывает события "этой сцены", если персонажу не был нанесен физический урон (снят хотя бы 1 хит) за это время.
  {
    id: 'oblivion',
    humanReadableName: 'Забвение',
    description:
      'Целевой персонаж не помнит события последней сцены. Работает только, если персонажу не был нанесен урон (снят хотя бы 1 хит).  Начало сцены определяет менталист, но не больше 30 минут.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: oblivionAbility.name,
  },
  // Персонаж забывает события "этой сцены", даже если персонажу был нанесен физический урон (снят хотя бы 1 хит) за это время.
  {
    id: 'full-oblivion',
    humanReadableName: 'Полное Забвение',
    description: 'Персонаж не помнит события последней сцены. Начало сцены определяет менталист, но не больше 30 минут.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'oblivion'],
    availability: 'open',
    karmaCost: 80,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: fullOblivionAbility.name,
  },
  // Целевой персонаж не забывает события перед КС, срок действия - 6 часов. Для менталиста эта абилка  активная. У целевого персонажа появляется абилка cloud-memory-temporary на 6 часов.
  {
    id: 'cloud-memory',
    humanReadableName: 'Облачная память ',
    description: 'Следующие 6 часов целевой персонаж не забывает события перед КС',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => (character.magic < 1 ? 360 : 360 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'full-oblivion'],
    availability: 'open',
    karmaCost: 80,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: cloudMemoryAbility.name,
  },
  // Цель честно отвечает на 3 вопроса.
  {
    id: 'tell-me-truth',
    humanReadableName: 'Скажи как есть.',
    description: 'Целевой персонаж честно отвечает на 3 вопроса. \n',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'lie-to-me'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: tellMeTheTruthAbility.name,
  },
  // Цель озвучивает какой-то признак (щелканье пальцами, пожимание плечами, заикание), и в течение беседы в следующие 15 минут должна воспроизводить этот признак, если врет.
  {
    id: 'lie-to-me',
    humanReadableName: 'Лай ту ми',
    description:
      'Целевой персонаж не может скрыть свою ложь. Ты говоришь маркер цели (например щелканье пальцами). Если она лжет, то выполняет это маркер. Эффект длится 15 минут',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 30 : 30 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: lieToMeAbility.name,
  },
  // Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 1 экономический цикл). Выполнение услуги не должно занимать больше 10 минут.
  {
    id: 'danila-i-need-help',
    humanReadableName: 'Оказать услугу',
    description:
      'Данила, ай нид хелп. Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 6 часов). Выполнение услуги не должно занимать больше 10 минут.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: danilaINeedHelpAbility.name,
  },
  // Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.
  {
    id: 'luke-i-am-your-father',
    humanReadableName: 'Выполнить любую просьбу',
    description:
      'Люк. Я твой отец. Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут. ',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 180 : 120 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'really-need-it'],
    availability: 'open',
    karmaCost: 70,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: lukeIAmYourFatherAbility.name,
  },
  // цели выдается текстовое сообщение с эффектом
  // (вы боитесь, убегаете, не можете.... )
  // У цели заблокирована активация всех активных абилок на 10 минут (надпись "Вы очень боитесь и не можете сосредоточиться")
  // Было бы круто сделать пуш об окончании действия эффекта.
  {
    id: 'fly-you-fool',
    humanReadableName: 'Беги отсюда',
    description:
      'Цель боится и убегает как можно дальше от менталиста. У цели заблокирована активация всех активных абилок на 10 минут. Через 10 минут эффект проходит.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'paralysis-1'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: flyYouFoolAbility.name,
  },
  // Цель не может двигаться 10 минут или пока ей не нанесён физический урон (-1хит).
  //
  {
    id: 'paralysis-1',
    humanReadableName: 'Оцепенение',
    description: 'Цель не может двигаться 10 минут или пока ей не нанесён физический урон (-1хит). ',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 40 : 30 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: paralysis1Ability.name,
  },
  // Цель не может двигаться 10 минут.
  // У цели заблокирована активация всех активных абилок. Надпись: Не получается, вы парализованы.
  {
    id: 'paralysis-2',
    humanReadableName: 'Паралич движения',
    description: 'Цель не может двигаться 10 минут.\nНе может пользоваться активными абилками.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'paralysis-1'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: paralysis2Ability.name,
  },
  // Цель не может двигаться и говорить 10 минут.
  // У цели заблокирована активация всех активных абилок. Надпись: Не получается, вы парализованы.
  {
    id: 'paralysis-3',
    humanReadableName: 'Паралич полный',
    description: 'Цель не может двигаться и произносить звуки 10 минут.\nНе может пользоваться активными абилками.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'paralysis-2'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: paralysis3Ability.name,
  },
  // Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям)
  {
    id: 'scorn-him',
    humanReadableName: 'Презрение',
    description:
      'Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, выразить презрение убеждениям )  Адресат должен находиться в прямой видимости. ',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 20 : 10 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: scornHimAbility.name,
  },
  // Цель активно пытается убить персонажа, на которого указывает менталист.
  {
    id: 'kill-him',
    humanReadableName: 'Агрессия',
    description:
      'Цель активно пытается убить (в Клиническую смерть)  персонажа, на которого указывает менталист (персонаж должен быть в прямой видимости). Если цель убита - эффект воздействия прекращается. Пока цель жива - твоя жертва пытается её убить. После клинической смерти персонажа, попавшего под действие менталиста, воздействие проходит.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 360 : 360 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'scorn-him', 'paralysis-3'],
    availability: 'open',
    karmaCost: 100,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: killHimAbility.name,
  },
  // Сканируется код локуса, код персонажа, персонаж приобретает абилку “член группы” для соответствующей локусу группы, локус теряет заряд. Запускается процедура пересчета дискурс-абилок. Если на локусе нет зарядов, абилка не работает. Дает карму владельцу абилки.
  {
    id: 'dgroup-add',
    humanReadableName: 'Принять в дискурс-группу',
    description: 'Принять персонажа в дискурс-группу',
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 5,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: discourseGroupAddAbility.name,
  },
  // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Запускается процедура пересчета дискурс-абилок. Дает карму владельцу абилки.
  {
    id: 'dgroup-exclude',
    humanReadableName: 'Исключить из дискурс-группы',
    description: 'Исключить персонажа из дискурс-группы',
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 5,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: discourseGroupExcludeAbility.name,
  },
  // Сканируется код локуса, код пополнения заряда. Количество зарядов на локусе увеличивается на 1.
  {
    id: 'dm-inc-counter',
    humanReadableName: 'Пропаганда',
    description: 'Добавить один заряд к локусу',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Локус',
        allowedTypes: ['locus'],
        field: 'locusId',
      },
      {
        name: 'Заряд',
        allowedTypes: ['locus_charge'],
        field: 'qrCodeId',
      },
    ],
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: chargeLocusAbility.name,
  },
  // Сканируется код локуса, код персонажа, персонаж приобретает абилку “член группы” для соответствующей локусу группы. Запускается процедура пересчета дискурс-абилок. Если на локусе нет зарядов, абилка не работает.  Дает карму владельцу абилки.
  {
    id: 'dm-add-guru',
    humanReadableName: 'Гуру',
    description: 'Принять персонажа в дискурс-группу, не расходуя заряд локуса',
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: discourseGroupAddGuru.name,
  },
  // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Количество зарядов локуса увеличивается на 1. Запускается процедура пересчета дискурс-абилок.  Дает карму владельцу абилки.
  {
    id: 'dm-exclude-inq-1',
    humanReadableName: 'Инквизитор-1',
    description: 'Выгнать персонажа из дискурс-группы, восстановив заряд локуса',
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: (character) => 30,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: discourseGroupInquisitor1.name,
  },
  // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Количество зарядов локуса увеличивается на 2. Запускается процедура пересчета дискурс-абилок.  Дает карму владельцу абилки.
  {
    id: 'dm-exclude-inq-2',
    humanReadableName: 'Инквизитор-2',
    description: 'Выгнать персонажа из дискурс-группы, восстановив два заряда локуса',
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: (character) => 30,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: discourseGroupInquisitor2.name,
  },
  // Абилка-сертификат с кулдауном. Предъявителю выдается QR локуса дискурс-группы, к которой он принадлежит.
  {
    id: 'dm-prophet',
    humanReadableName: 'Пророк',
    description: 'Предъявите экран с описанием абилки региональному мастеру, чтобы получить новый QR локуса.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 360,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: prophetAbility.name,
  },
  // Цель дарит менталисту 1 игровой предмет по выбору менталиста.
  {
    id: 'really-need-it',
    humanReadableName: 'Очень надо.',
    description:
      'Цель дарит менталисту 1 игровой предмет по выбору менталиста. Предмет должен быть отчуждаем (например, нельзя попросить подарить установленный имплант)',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 180 : 120 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'billioner-walk'],
    availability: 'open',
    karmaCost: 70,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: reallyNeedItAbility.name,
  },
  // Убеждает жертву перевести со своего на счет менталиста 20%
  {
    id: 'billioner-walk',
    humanReadableName: 'Прогулка миллионера',
    description:
      'Цель переводит на счет менталиста 20% денег со своего счета. Способность не работает на персонажей с иридиевым лафстайлом.',
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 120 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'danila-i-need-help'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: billionerWalkAbility.name,
  },
  // Добавляет +8 к ментальной защите целевого персонажа  на 12 часов
  {
    id: 'increase-the-mental-protection',
    humanReadableName: 'увеличение м. защиты другого персонажа',
    description: 'на 12 часов увеличивает сопротивляемость целевого персонажа ментальному воздействию. ',
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: (character) => (character.magic < 1 ? 240 : 180 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'paralysis-3'],
    availability: 'closed',
    karmaCost: 80,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: increaseTheMentalProtectionAbility.name,
  },
  // Добавляет -8 к ментальной защите целевого персонажа на 6 часов
  {
    id: 'reduce-the-mental-protection',
    humanReadableName: 'уменьшение м. защиты другого персонажа',
    description: 'на 6 часов  уменьшает сопротивляемость целевого персонажа ментальному воздействию. ',
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: (character) => (character.magic < 1 ? 180 : 120 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'master',
    karmaCost: 80,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: reduceTheMentalProtectionAbility.name,
  },
  // Менталист увеличивает свою ментальную защиту на +8 на 30 минут.
  {
    id: 'i-dont-trust-anybody',
    humanReadableName: 'Я никому не верю',
    description: 'Временно увеличивает сопротивляемость менталиста ментальному воздействию. Срок воздействия меньше часа.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => (character.magic < 1 ? 240 : 120 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: iDontTrustAnybody.name,
  },
  // Менталист увеличивает ментальную защиту другого персонажа на +8 на 30 минут
  {
    id: 'you-dont-trust-anybody',
    humanReadableName: 'Ты никому не веришь',
    description: 'Временно на 30 минут увеличивает сопротивляемость другого персонажа ментальному воздействию.',
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: (character) => (character.magic < 1 ? 240 : 180 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face', 'i-dont-trust-anybody'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: youDontTrustAnybody.name,
  },
  // qr товара содержит информацию о базовой стоимости товара при его покупке
  // При применении абилки на экране отображается записанная на QR baseprice товара.
  // Если товар не был продан через магазин - возвращает 0.
  {
    id: 'how-much-it-costs',
    humanReadableName: 'Чо почем',
    description: 'посмотреть на qr и сказать сколько это стоит, базовую цену товара',
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: (character) => (character.magic < 1 ? 60 : 60 * (1 / Math.sqrt(character.magic))),
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: howMuchItCosts.name,
  },
  // Выводит на экран гм информацию из скрытого текстового поля товара .
  // Текст по умолчанию: Ты не знаешь ничего интересного про этот товар.
  {
    id: 'who-needs-it',
    humanReadableName: 'Кто платит',
    description: 'Ты можешь посмотреть кто платит ренту по этому товару.',
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: (character) => 30 - 3 * character.intelligence,
    prerequisites: ['arch-face', 're-rent'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: whoNeedsIt.name,
  },
  // Показывает (возвращает) размер рентного платежа по данному товару. Данная информация записывается на QR при его покупке.
  // Если товар не был продан через магазин - возвращает 0.
  {
    id: 'how-much-is-rent',
    humanReadableName: 'ПлачУ и ПлАчу',
    description: 'посмотреть на qr и сказать размер рентного платежа чаммера. ',
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: (character) => 1,
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: howMuchTheRent.name,
  },
  // ГМ переписывает кредит за предмет с другого перонажа на себя. При этом сумма последующих рентных платежей пересчитывается. Новые рентные платежи рассчитываются исходя из скоринга гма на момент активации абилки.
  // Механика:
  // Активировать абилку, отсканировать QR-код товара.
  // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
  {
    id: 'let-me-pay',
    humanReadableName: 'Давай я заплачу',
    description: 'Гешефтмахер может переписать кредит за 1 предмет на себя. Работает только если есть QR-код товара.',
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-face'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: letMePay.name,
  },
  // Переписать долг за 1 предмет c QR с персонажа А на персонажа Б.
  // При этом сумма последующих рентных платежей пересчитывается. Новые рентные платежи рассчитываются исходя из скоринга гма на момент активации абилки.
  // Механика:
  // Активировать абилку, отсканировать QR-код товара, отсканировать QR код персонажа, на которого .
  // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
  {
    id: 'let-him-pay',
    humanReadableName: 'Давай он заплатит',
    description: 'переписать долг за 1 предмет по выбору с персонажа А на персонажа Б.',
    target: 'scan',
    targetsSignature: [
      kMerchandiseTargeted,
      {
        name: 'Новый плательщик',
        field: 'targetCharacterId',
        allowedTypes: ['HEALTHY_BODY'],
      },
    ],
    cooldownMinutes: (character) => 70 - 5 * character.intelligence,
    prerequisites: ['arch-face', 'let-me-pay'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: letHimPay.name,
  },
  // ГМ переписывает кредит за предмет: пересчитывается сумма последующих рентных платежей . Новые рентные платежи рассчитываются исходя из скоринга персонажа, на которого записан кредит на момент активации абилки.
  // Механика:
  // Активировать абилку, отсканировать QR-код товара.
  // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
  {
    id: 're-rent',
    humanReadableName: 'Переоформить ренту',
    description: 'ГМ может целевому персонажу переоформить контракт с новым коэфициентом скоринга. ',
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: (character) => 70 - 5 * character.intelligence,
    prerequisites: ['arch-face', 'let-him-pay'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: reRent.name,
  },
  // Показывает актуальные коэффициенты, которые влияют на скоринг. У целевого персонажа в течение следующих 5 минут отображаются его коэффициенты скоринга.
  {
    id: 'investigate-scoring',
    humanReadableName: 'Посмотрим скоринг',
    description: 'другой персонаж сможет видеть свои коэффициенты скоринга в течение 5 минут.',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-face', 'my-scoring'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: investigateScoring.name,
  },
  // Время действия 60 минут. Кулдаун 40 минут. Аура цели на это время случайным образом меняется на 20% (и случайный фрагмент, и на случайное значение).
  {
    id: 'silentium-est-aurum',
    humanReadableName: 'Silentium est aurum',
    description: 'На 60 минут частично изменить другому персонажу его ауру. Требуемая эссенция мага: больше 4',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['ASTRAL_BODY', 'HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: (character) => 40,
    prerequisites: ['arch-mage', 'nothing-special'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 4,
    fadingPrice: 0,
    eventType: changeAuraAbility.name,
  },
  // - время действия 10+N минут, кулдаун 25 минут. Дает на время действия абилку hammer-of-justice-effect. N=умвл*3 минут
  {
    id: 'hammer-of-justice',
    humanReadableName: 'Hammer of Justice',
    description:
      'Активируемый статус "тяжелое" для одноручного холодного оружия.  Требуемая эссенция: больше 3. Время действия "10+3*уровень маны в локации" минут. Кулдаун 25 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 25,
    prerequisites: ['arch-mage', 'i-will-survive'],
    availability: 'open',
    karmaCost: 60,
    minimalEssence: 3,
    fadingPrice: 0,
    eventType: hammerOfJustice.name,
  },
  // - время действия 5+N минут, кулдаун 15 минут. Дает абилку arrowgant-effect на это время. N=умвл*1 минут
  {
    id: 'arrowgant',
    humanReadableName: 'Arrowgant',
    description:
      'Активируемая защита от дистанционного легкого оружия. Требуемая эссенция: больше 4. Время действия "5+уровень маны в локации" минут. Кулдаун 15 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 4,
    fadingPrice: 0,
    eventType: arrowgant.name,
  },
  // - время действия 5+N минут, кулдаун 30 минут. Дает абилку trollton-effect. N=умвл*2 минут
  {
    id: 'trollton',
    humanReadableName: 'Trollton',
    description:
      'На время активности повяжи на себя красную ленту - считается, что на тебе тяжёлая броня. Требуемая эссенция: больше 2.  Время действия "5+2*уровень маны в локации" минут. Кулдаун 30 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-mage', 'stand-up-and-fight'],
    availability: 'open',
    karmaCost: 50,
    minimalEssence: 2,
    fadingPrice: 0,
    eventType: trollton.name,
  },
  // - время действия 5+N минут, кулдаун 20 минут. Позволяет автоматически подняться из тяжрана через 30с с полным запасом текущих хитов. N=умвл*2 минут
  {
    id: 'i-will-survive',
    humanReadableName: 'I will survive ',
    description:
      'Возможность самому в течение "5+2*уровень маны в локации" минут один раз автоматически перейти из тяжрана в состояние Здоров. Требуемая эссенция: больше 2. Кулдаун 20 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 50,
    minimalEssence: 2,
    fadingPrice: 0,
    eventType: iWillSurvive.name,
  },
  // - мгновенное, кулдаун 15 минут. Позволяет поднять из тяжрана одного другого персонажа с полным запасом текущих хитов
  {
    id: 'stand-up-and-fight',
    humanReadableName: 'Stand up and fight ',
    description: 'Мгновенное поднятие другого персонажа из тяжрана. Требуемая эссенция: больше 5. Кулдаун 15 минут.',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['WOUNDED_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: (character) => 15,
    prerequisites: ['arch-mage', 'agnus-dei'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 5,
    fadingPrice: 0,
    eventType: reviveOnTarget.name,
  },
  // Активация дает возможность открыть замок (см.правила по взломам в "Прочих моделях"). Кулдаун - 20 минут
  {
    id: 'allo-homorus',
    humanReadableName: 'Allo, homorus!',
    description: 'Активация дает возможность открыть один замок. Требуемая эссенция: больше 2. Кулдаун 20 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 2,
    fadingPrice: 0,
    eventType: alloHomorusAbility.name,
  },
  // Для мчс  Переводит чаммера из состояния КС в состояние Здоров
  // надо отсканировать:
  // - QR воскрешательной капсулы
  // - QR ИИ
  // - QR целевого чаммера
  // Делается запись в лог использования абилок (кто использовал, какая капсула, какой ИИ, какой символ чаммер)
  // В зависимости от параметров Капсулы делает вот что:
  // drain-essense = Снимает с целевого чаммера Эссенс
  // get-essence = записывает в таблицу Имя ИИ и количество get-essence
  // air-essense  = записывает в таблици количество Air Essense
  // reanimate-cooldown = кулдаун в минутах у персонажа, применившего абилку
  // price-reanimate  = Это коэффициент цены, его надо как-то учесть в экономике (прописать в цену услуги "воскрешение на оборудовании таком-то ???)
  //
  // Зависимости, которые были у персонажа до КС сохраняются. После воскрешения таймер зависимостей переходит в состояние ноль.
  {
    id: 'reanimate',
    humanReadableName: 'Встань и иди',
    description: 'Поднять персонажа из состояния клинической смерти',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Капсула',
        allowedTypes: ['reanimate_capsule'],
        field: 'droneId',
      },
      {
        name: 'ИИ',
        allowedTypes: ['ai_symbol'],
        field: 'qrCodeId',
      },
      {
        name: 'Пациент',
        allowedTypes: ['CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: capsuleReanimate.name,
  },
  // Активирует процесс снятия импланта\мода.
  // надо отсканировать
  // QR чаммера \ дрона \ кибердеки
  // QR пустышки, куда запишется трофей
  // Выбираем самый слабый мод по параметру Сложности.
  // Если несколько одинаково слабых - любой.
  // Проходит 2 проверки:
  // Если параметр rigging.repomanBonus+Int ниже или равен сложности установки имплант - снятия не происходит.
  // Если ок => происходит проверка вероятности: implantsRemovalResistance+10*body
  {
    id: 'repoman-active',
    humanReadableName: 'Рипомен',
    description:
      'Активируй, чтобы снять имплант\\мод с чаммера. Выберется самый слабый.  Для использования тебе не нужны медикарт или автодок. Нужен пустой QR чип.',
    target: 'scan',
    targetsSignature: kBodyAndContainerTargeted,
    cooldownMinutes: (character) => Math.max(5, 30 - 2 * character.intelligence - 2 * character.rigging.repomanBonus),
    prerequisites: ['arch-rigger'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: repomanAbility.name,
  },
  // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Add proper implementation
  // Активирует процесс снятия импланта\мода (надо отсканировать QR пустышки, куда запишется трофей и QR чаммера \ дрона \ кибердеки ).
  // Смотрим параметр rigging.repomanBonus + Int ,
  // Выбираем самый дорогой мод по параметру Сложности, но не больше чем параметр rigging.repomanBonus+int. Если несколько одинаково дорогих - любой.
  // Проходит 2 проверки:
  // Если параметр rigging.repomanBonus+Int ниже или равен сложности установки имплант - снятия не происходит.
  // Если ок => происходит проверка вероятности: implantsRemovalResistance+10*body
  {
    id: 'repoman-black',
    humanReadableName: 'Черный рипомен',
    description:
      'Активируй, чтобы снять имплант\\мод. Выберется самый сложный.  Для использования тебе не нужны медикарт или автодок. Нужен пустой QR чип.',
    target: 'scan',
    targetsSignature: kBodyAndContainerTargeted,
    cooldownMinutes: (character) => Math.max(5, 30 - 2 * character.intelligence - 2 * character.rigging.repomanBonus),
    prerequisites: ['arch-rigger', 'repoman-3'],
    availability: 'open',
    karmaCost: 50,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: repomanBlackAbility.name,
  },
  // При активации кнопки необходимо выбрать ЯЧЕЙКУ телохранилища, в котором лежит тело ригги.
  // Риггер выходит из дрона, пропадают абилки дрона, появляются абилки риггера.
  // Статус сообщение при выходе "Вы потеряли  DroneFeedbaсk хитов"
  // где DroneFeedback = DroneFeedback1 + DroneFeedback2 + DroneFeedback3
  {
    id: 'drone-logoff',
    humanReadableName: 'Отключение от дрона',
    description: 'Если вы хотите отключиться от дрона - нажмите эту кнопку, после чего вернитесь в свое тело.',
    target: 'scan',
    targetsSignature: kBodyStorageTargeted,
    cooldownMinutes: (character) => 0,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: exitDrone.name,
  },
  // Эта кнопка символизирует аварийное отключение.
  // Используется в случае если
  // - с дрона сняли все хиты.
  // Кроме того, происходит автоматически если:
  // - закончилось время на включение в дрона
  // - было атаковано мясное тело риггера
  // DroneFeedback1 = 1
  {
    id: 'drone-danger',
    humanReadableName: 'Повреждение дрона',
    description:
      'Если ваш дрон атакован и с него сняли все хиты - нажмите эту кнопку. Оставьте QR дрона там где вы находитесь. Дрон перейдет в состояние "Сломан". \nСами наденьте белый хайратник, вернитесь к месту, где вы оставили тело и примените абилку "Отключение от дрона". После чего немедленно вернитесь в свое тело. ',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: droneDangerAbility.name,
  },
  // При активации аблики игрок сканирует куар-код с препаратом, видит его название и самый крупный компонент.
  // формат:
  // название препарата - основное вещество - дозировка в мг
  // Таблица препаратов сейчас составлена так, что самый крупный всегда в левой колонке записан.
  // второй и далее компоненты НЕ показываем, только первый!
  {
    id: 'pill-name',
    humanReadableName: 'Фармацевтика (что за таблетка?)',
    description: 'Позволяет узнать название препарата и его основной компонент.',
    target: 'scan',
    targetsSignature: [kPillTarget],
    prerequisites: ['arch-rigger'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: getPillNameAbility.name,
    cooldownMinutes: (character) => 7,
  },
  // Эта абилка нужна как мастерская.
  // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  восстанавливаются все хиты.
  //
  // Зависимости, которые были у персонажа до КС сохраняются. После воскрешения таймер зависимостей переходит в состояние ноль
  {
    id: 'gm-respawn-normal',
    humanReadableName: 'Воскрешение общее',
    description: 'Воскрешение Норм, эльф, орк, тролль, гном',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY', 'ABSOLUTELY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: reviveAbsoluteOnTarget.name,
    cooldownMinutes: (character) => 0,
  },
  // Активная абилка Медикарта
  {
    id: 'medcart-light-heal-1',
    humanReadableName: 'Лечение легких ранений (1)',
    description: 'Вылечить легкое ранение (1)',
    target: 'scan',
    targetsSignature: kMedcartHealthyBodyTargeted,
    cooldownMinutes: (character) => 5,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: medcartHealAbility.name,
  },
  // Активная абилка Медикарта
  {
    id: 'medcart-light-heal-2',
    humanReadableName: 'Лечение легких ранений (2)',
    description: 'Вылечить легкое ранение (2)',
    target: 'scan',
    targetsSignature: kMedcartHealthyBodyTargeted,
    cooldownMinutes: (character) => 5,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: medcartHealAbility.name,
  },
  // Активная абилка Медикарта
  {
    id: 'medcart-light-heal-3',
    humanReadableName: 'Лечение легких ранений (3)',
    description: 'Вылечить легкое ранение (3)',
    target: 'scan',
    targetsSignature: kMedcartHealthyBodyTargeted,
    cooldownMinutes: (character) => 5,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: medcartHealAbility.name,
  },
  // Активная абилка Медикарта
  {
    id: 'medcart-heavy-heal-1',
    humanReadableName: 'Лечение тяжелых ранений (1)',
    description: 'Вылечить тяжелое ранение (1)',
    target: 'scan',
    targetsSignature: kMedcartWoundedBodyTargeted,
    cooldownMinutes: (character) => 15,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: medcartReviveAbility.name,
  },
  // Активная абилка Медикарта
  {
    id: 'medcart-heavy-heal-2',
    humanReadableName: 'Лечение тяжелых ранений (2)',
    description: 'Вылечить тяжелое ранение (2)',
    target: 'scan',
    targetsSignature: kMedcartWoundedBodyTargeted,
    cooldownMinutes: (character) => 15,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: medcartReviveAbility.name,
  },
  // Активная абилка Медикарта
  {
    id: 'medcart-heavy-heal-3',
    humanReadableName: 'Лечение тяжелых ранений (3)',
    description: 'Вылечить тяжелое ранение (3)',
    target: 'scan',
    targetsSignature: kMedcartWoundedBodyTargeted,
    cooldownMinutes: (character) => 15,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: medcartReviveAbility.name,
  },
  // Активная абилка Медикарта
  {
    id: 'medcart-reanimate',
    humanReadableName: 'Лечение состояния КС',
    description: 'Вылечить состояние КС',
    target: 'scan',
    targetsSignature: kMedcartDeadBodyTargeted,
    cooldownMinutes: (character) => 120,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: reviveOnTarget.name,
  },
  // появляется абилка automatic-weapons-unlock на 15 минут
  // itGapEssense +5
  {
    id: 'kokkoro-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveShooterAbility.name,
  },
  // мясное тело +2 хита на 15 минут
  // itGapEssense +5
  {
    id: 'kokkoro-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveHealhAbility.name,
  },
  // появляется текст "ты забыл эпизод"
  // itGapEssense +5"
  {
    id: 'kokkoro-backup',
    humanReadableName: 'Бэкап ',
    description:
      'ты можешь забыть эпизод, если напишешь о нем Искусственному Интеллекту используя мессенджеры или расскажешь лично. Только в личном присутствии этого Искусственного Интеллекта ты помнишь все забытые таким образом эпизоды',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveBackupAbility.name,
  },
  // появляется абилка automatic-weapons-unlock на 15 минут
  // itGapEssense +5
  {
    id: 'koshcghei-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveShooterAbility.name,
  },
  // мясное тело +2 хита на 15 минут
  // itGapEssense +5"
  {
    id: 'koshcghei-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveHealhAbility.name,
  },
  // появляется текст "ты забыл эпизод"
  // itGapEssense +5"
  {
    id: 'koshcghei-backup',
    humanReadableName: 'Бэкап ',
    description:
      'ты можешь забыть эпизод, если напишешь о нем Искусственному Интеллекту используя мессенджеры или расскажешь лично. Только в личном присутствии этого Искусственного Интеллекта ты помнишь все забытые таким образом эпизоды',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveBackupAbility.name,
  },
  // появляется абилка automatic-weapons-unlock на 15 минут
  // itGapEssense +5
  {
    id: 'horizon-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveShooterAbility.name,
  },
  // мясное тело +2 хита на 15 минут
  // itGapEssense +5"
  {
    id: 'horizon-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveHealhAbility.name,
  },
  // появляется текст "ты забыл эпизод"
  // itGapEssense +5"
  {
    id: 'horizon-backup',
    humanReadableName: 'Бэкап ',
    description:
      'ты можешь забыть эпизод, если напишешь о нем Искусственному Интеллекту используя мессенджеры или расскажешь лично. Только в личном присутствии этого Искусственного Интеллекта ты помнишь все забытые таким образом эпизоды',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveBackupAbility.name,
  },
  // появляется абилка automatic-weapons-unlock на 15 минут
  // itGapEssense +5
  {
    id: 'badass-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveShooterAbility.name,
  },
  // мясное тело +2 хита на 15 минут
  // itGapEssense +5"
  {
    id: 'badass-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveHealhAbility.name,
  },
  // появляется текст "ты забыл эпизод"
  // itGapEssense +5"
  {
    id: 'badass-backup',
    humanReadableName: 'Бэкап ',
    description:
      'ты можешь забыть эпизод, если напишешь о нем Искусственному Интеллекту используя мессенджеры или расскажешь лично. Только в личном присутствии этого Искусственного Интеллекта ты помнишь все забытые таким образом эпизоды',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveBackupAbility.name,
  },
  // Эта абилка нужна как мастерская.
  // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  восстанавливаются все хиты.
  // Эссенс становится равен 0,8
  // itEssense пересчитывается
  // itGapEssence=920
  //
  // Зависимости, которые были у персонажа до КС сохраняются. После воскрешения таймер зависимостей переходит в состояние ноль
  {
    id: 'gm-respawn-hmhvv',
    humanReadableName: 'Воскрешение HMHVV',
    description: 'Воскрешение HMHVV',
    target: 'scan',
    targetsSignature: kPhysicalBodyTargeted,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: gmRespawnHmhvv.name,
  },
  // Гуль сканирует QR другого персонажа, находящегося в тяжелом ранении ИЛИ добровольно показавшего свой QR.
  //
  // может иметь целью только персонажей метарас эльф, орк, гном, норм, тролль, находящихся в базовом мясном теле при применении абилки.
  //
  // Эссенс гуля увеличивается на  min (100, itEssense жертвы)
  // Эссенс персонажа уменьшается на min ( 100, itEssense жертвы). Укушенный персонаж переходит в состояние КС
  // itGapEssense Жертвы = itGapEssense + [min ( 100, itEssense жертвы)]
  // itGapEssense гуля = itGapEssense -кусь гуля
  {
    id: 'ghoul-feast',
    humanReadableName: 'Питание гулей',
    description: 'Отсканируй QR жертвы для питания\nТвой Эссенс увеличится на 1.',
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: (character) => 10,
    prerequisites: ['meta-ghoul'],
    pack: { id: 'gen-meta-ghoul', level: 1 },
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: ghoulBite.name,
  },
  // Вампир сканирует QR другого персонажа, находящегося в тяжелом ранении ИЛИ добровольно показавшего свой QR.
  // При применении абилки вампиром жертва  получает инъекцию вещества vampirium (слюна вампира).
  // может иметь целью только персонажей метарас эльф, орк, гном, норм, тролль, находящихся в базовом мясном теле при применении абилки.
  //
  // Эссенс вампира увеличивается на  min (200, itEssense жертвы)
  // Эссенс персонажа уменьшается на min ( 200, itEssense жертвы). Укушенный персонаж переходит в состояние КС
  // itGapEssense Жертвы = itGapEssense + [min ( 200, itEssense жертвы)]
  // itGapEssense вампира= itGapEssense - кусьВампира
  {
    id: 'vampire-feast',
    humanReadableName: 'Питание вампиров',
    description: 'Отсканируй QR жертвы для питания\nТвой Эссенс увеличится на 2.',
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: (character) => 10,
    prerequisites: ['meta-vampire'],
    pack: { id: 'gen-meta-vampire', level: 1 },
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: vampireBite.name,
  },
  // TODO(aeremin): Add proper implementation
  // выдает абилку Форма зверя - выдает игроку текст на экране
  {
    id: 'meta-werewolf',
    humanReadableName: 'Оборотень',
    description: 'Нажми, чтобы принять форму зверя - не более чем на 60 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 120,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // Эта абилка нужна как мастерская.
  // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  пересчитывается itEssense
  // itUsedEssense = 0
  // itGapEssense = 0
  // Все импланты, установленные в тело персонажа-объекта - ломаются и выходят из строя. Тело их отторгает. (Импланты как товары - ломаются, слоты в теле персонажа - пустые)
  {
    id: 'rd-reset-essence',
    humanReadableName: 'РД Полное восстановление Эссенс',
    description: 'РД Эссенс персонажа станет =6, все импланты деактивируются(ломаются)\nдействует на расы: эльф, орк, норм, тролль, гном',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 360,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: gmEssenceReset.name,
  },
  // TODO(aeremin): Add proper implementation
  // На допросе цель развернуто отвечает на заданный вопрос и теряет один хит. Абилка-сертификат с кулдауном
  {
    id: 'termorectal-analysis',
    humanReadableName: 'Терморектальный криптоанализ',
    description: 'Ты можешь допрашивать персонажей. На допросе цель развернуто отвечает на 3 заданных вопрос и теряет один хит.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // При активации на 5 минут выдаёт способность Magic Shield
  {
    id: 'take-no-harm',
    humanReadableName: 'Take no harm',
    description: 'Доступна активация магического щита',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-mage'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: takeNoHarmAbility.name,
  },
  // При активации на 5 минут выдаёт способность PENCIL
  {
    id: 'pencil-large',
    humanReadableName: 'Pencil, large!',
    description: 'Получить силу - одно холодное оружие в руках будет считаться тяжёлым. После активации действует 5 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-mage'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: pencilLargeAbility.name,
  },
  // При активации на 5 минут выдаёт способность Stone Skin
  {
    id: 'skin-stone',
    humanReadableName: 'Skin, Stone!',
    description:
      'Поднять щиты - надетая согласно остальным правилам лёгкая броня будет считаться тяжёлой. После активации действует 5 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-mage'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: skinStoneAbility.name,
  },
  // После активации абилки у мага появляется на 10 минут пассивная абилка tincasm-able.
  {
    id: 'tincasm',
    humanReadableName: 'Think as a master',
    description: 'Последнее китайское предупреждение уже было.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'master',
    karmaCost: 300,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: tincasmAbility.name,
  },
  // Эта абилка нужна как мастерская.
  // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  его  базовый показатель Эссенса увеличивается на +1.
  //  itMaxEssense = itMaxEssense + 100.
  {
    id: 'gm-increase-essence',
    humanReadableName: 'Эссенс "+1"',
    description: 'Увеличить Эссенс персонажа +1',
    target: 'scan',
    targetsSignature: kPhysicalBodyTargeted,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: gmIncreaseMaxEssence.name,
  },
  // Эта абилка нужна как мастерская.
  // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  его  базовый показатель Эссенса уменьшается на -1
  //  itMaxEssense = itMaxEssense - 100
  {
    id: 'gm-decrease-essence',
    humanReadableName: 'Эссенс "-1"',
    description: 'Уменьшить Эссенс на -1',
    target: 'scan',
    targetsSignature: kPhysicalBodyTargeted,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: gmDecreaseMaxEssence.name,
  },
  // Эта абилка нужна как мастерская.
  // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  меняются показатели:
  // itUsedEssense = 0
  // itGapEssense = 0
  // Все импланты, установленные в тело персонажа-объекта - ломаются и выходят из строя. Тело их отторгает. (Импланты как товары - ломаются, слоты в теле персонажа - пустые)
  {
    id: 'gm-reset-essence',
    humanReadableName: 'Полное восстановление Эссенс',
    description: 'Эссенс персонажа станет =6, все импланты деактивируются(ломаются)\nдействует на расы: эльф, орк, норм, тролль, гном',
    target: 'scan',
    targetsSignature: kPhysicalBodyTargeted,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: gmEssenceReset.name,
  },
  // TODO(aeremin): Add proper implementation
  // Эта абилка нужна как мастерская.
  // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  восстанавливаются все хиты.
  //
  // Зависимости, которые были у персонажа до КС сохраняются. После воскрешения таймер зависимостей переходит в состояние ноль
  {
    id: 'gm-respawn-digital',
    humanReadableName: 'Воскрешение цифровой',
    description: 'Воскрешение Цифровой',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // Увеличение нехуеватости Магии "+1".
  {
    id: 'gm-increase-magic',
    humanReadableName: 'Увеличение магии "+1"',
    description: 'Увеличение магии +1',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // В качестве ответа на применение абилки, надо сформировать текстовое сообщение ( в лог?), в котором перечислены все вещества, которые находятся в чаммере в формате
  // имя_чаммера
  // Название вещества - количество в мг.
  // Указываем только вещества с содержанием более чем  ( 280 - Интеллект * 10)  милиграмм
  {
    id: 'whats-in-the-body-1',
    humanReadableName: 'Диагностика (что в чаммере?)',
    description: 'Ты можешь проверить, какие вещества находятся в теле пациенте.\n',
    target: 'scan',
    targetsSignature: kPhysicalBodyTargeted,
    cooldownMinutes: (character) => 15,
    prerequisites: ['arch-rigger'],
    availability: 'open',
    karmaCost: 50,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: whatsInTheBodyAbility.name,
  },
  // Показывает текстовое сообщение ( в лог?) формата
  // имя_чаммера
  // название препарата  - время приема
  // за последние 4 часа
  {
    id: 'biomonitor-scan',
    humanReadableName: 'Сканер биомонитора',
    description: 'Отсканируй чаммера и увидишь список препаратов, которые он принимал за последние 4 часа.',
    target: 'scan',
    targetsSignature: kPhysicalBodyTargeted,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-rigger', 'pill-name', 'whats-in-the-body-1'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: biomonitorScanAbility.name,
  },
  // Надо отсканировать QR кибердеки. +посылает PubSub ability_used
  {
    id: 'jack-in',
    humanReadableName: 'Jack-in',
    description: 'Джекнуться (jack-in) в кибердеку. \nОтсканируй QR код своей деки',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Кибердека',
        field: 'qrCodeId',
        allowedTypes: ['cyberdeck'],
      },
    ],
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'gen-arch-hackerman-decker', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: jackInAbility.name,
  },
  // Сама абилка ничего не делает, но посылает PubSub ability_used. ничего страшного если ее будут жамкать пока не заджеканы. если есть какой-то простой способ дизейблить- я его не знаю
  {
    id: 'jack-out',
    humanReadableName: 'Jack-out',
    description: 'Выстегнуться из деки (jack-out).\nВНИМАНИЕ: ты получишь дампшок, если находишься в HotSim',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 0,
    prerequisites: ['arch-hackerman-decker'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: jackOutAbility.name,
  },
  // Сама абилка ничего не делает, но посылает PubSub ability_used
  {
    id: 'activate-soft',
    humanReadableName: 'Активация софта',
    description:
      'Активирует софт, после чего его можно загрузить в память кибердеки\nВНИМАНИЕ: нельзя использовать, когда ты уже соединен с кибердекой.',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Софт',
        field: 'qrCodeId',
        allowedTypes: ['software'],
      },
    ],
    cooldownMinutes: (character) => 0,
    prerequisites: ['arch-hackerman-decker'],
    pack: { id: 'gen-arch-hackerman-decker', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: activateSoft.name,
  },
  // TODO(aeremin): Add proper implementation
  // применяется к телу, которое лежит в телохранилище - запускает процедуру "недобровольный выход из сменного тела"
  {
    id: 'finish-his-body',
    humanReadableName: 'Атака на тело в телохранилище',
    description: 'Добей это тело!  *работает только на тело, находящееся в телохранилище',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: [],
    pack: { id: 'null', level: 1 },
    availability: 'closed',
    karmaCost: 60,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // Применяет препарат на другого персонажа
  // цель 1: куар препарата
  // цель2: куар цели (куар мясного тела, показаный добровольно или куар тела в жижране)
  {
    id: 'use-pills-on-others',
    humanReadableName: 'Вколоть препарат',
    description:
      'Активируй, чтобы применить препарат на другого персонажа. После объявления "Колю препарат" и качания игрока рукой, игрок обязан показать QR своего тела для применения абилки, даже если он против.',
    target: 'scan',
    targetsSignature: [kPillTarget, ...kNonDeadBodyTargeted],
    cooldownMinutes: (character) => 7,
    prerequisites: ['arch-rigger'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: usePillsOnOthersAbility.name,
  },
  // При активации игроку показывается список духов, присутствующих в этой локации в этот момент. При выборе одного из них (и подтверждении выбора) делается попытка с вероятностью (M*10-W)/100 захватить указанного духа. Если попытка удалась, то магу предлагается поместить этого духа в свободное телохранилище (через сканирование QR-кода, ранее записанного как "телохранилище"). При закрытии этого диалога попытка ловли отменяется и можно сделать новую (если Own Spirit ещё доступна). При успешной записи в телохранилище захваченный свободный дух (не персонаж) исчезает из пространства игры (не слышен в океане маны, не входит в списки целей "присутствующие духи" и тд), зато доступен для Suit Up (через сканирование этого духохранилища). W это текущая Сопротивляемость духа*Коэффициент Сопротивления духов этого мага. M = {{ might }}, с которой выдавалась эта абилка
  // Если попытка взять духа под контроль не удалась, то на Магию ловца накладывается штраф - величиной W (округлённое вверх) на время 10 минут.
  // Поскольку кулдаун у абилки 0, то маг может продолжать свои попытки ловить духов.
  {
    id: 'own-spirit',
    humanReadableName: 'Own spirit',
    description:
      'Попытаться поймать духа, находящегося в этой локации. Потребуется свободное духохранилище. При неудаче будет временный штраф на Магию. Вероятность зависит от Сопротивляемости духа (базовой и лично этому магу) и от Мощи заклинания (чем мощнее, тем вероятнее)',
    target: 'scan',
    targetsSignature: kSpiritAndBodyStorageTargeted,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    pack: { id: 'mage-summon-spirit', level: 1 },
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // Деятельность в качестве духа прекращается, игроку необходимо вернуться в телохранилище, чтобы продолжить действовать в своём мясном теле.
  {
    id: 'dispirit',
    humanReadableName: 'Dispirit',
    description: 'Вылезти из духа\n*Применяется для нормального выхода из эктотела*',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-mage'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: exitSpirit.name,
  },
  // Эта кнопка символизирует разрушение оболочки духа
  // Используется в случае если
  // - с духа сняли все хиты.
  // Кроме того, происходит автоматически если:
  // - закончилось время на включение в духа
  // - было атаковано мясное тело мага
  {
    id: 'spirit-danger',
    humanReadableName: 'Если оболочка разрушена...',
    description: 'Эктотело духа разрушено! Необходимо срочно вернуться к своему телу!\n*Применяется если тебя в эктотеле уничтожили*',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-mage'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: spiritEmergencyExit.name,
  },
  // для применения надо отсканировать куар код мясного телуа в состоянии "тяжело ранен" - переводит его в состояние КС.
  //
  {
    id: 'executioner-1',
    humanReadableName: 'Быстрое добивание',
    description: 'Используй эту способность чтобы быстро добить из тяжрана в КС',
    target: 'scan',
    targetsSignature: [kWoundedBodyTarget],
    cooldownMinutes: (character) => 3,
    prerequisites: ['arch-samurai', 'binding'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: finishHimAbility.name,
  },
  // Абилка доступна для применения только из мясного тела (т.е. из физического мира)
  // На 20 минут выдаётся AstralopithecusRage
  {
    id: 'astralopithecus',
    humanReadableName: 'Astralopithecus',
    description:
      'Ты можешь из реала видеть и изгонять сущности, находящиеся в астрале. Требуемая эссенция: больше 3. Время действия 20 минут. Кулдаун 30 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-mage', 'allo-homorus'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 3,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // По аналогии с дронами - игрок активирует эту абилку, сканирует QR-код духохранилища (где лежит нужный дух), сканирует QR -код свободного телохранилища. После этого телохранилище занято его мясным телом, духохранилище свободно, а сам игрок действует в эктоплазменном теле - согласно описанию конкретного духа и общим свойствам эктоплазменного духа https://docs.google.com/document/d/1TBug3i5LFEW7BTm-iSgBRf9Snpknuu7sSkhVgP_Iko0/edit#heading=h.gcmlf4uf63ju
  //
  // Переход в тело духа совершается на 30 минут, но может быть модифицировано другими абилками
  //
  {
    id: 'suit-up',
    humanReadableName: 'Suit Up',
    description:
      'Призвать духа, используя Тотем и временно перейти в эктоплазменное тело духа. Своё мясное тело маг должен оставить в телохранилище. Продолжительность призыва духа - 30 минут. (время может быть увеличено)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: ['arch-mage'],
    pack: { id: 'mage-summon-spirit', level: 1 },
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 4,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // При активации абилки открывается окно сканирования QR-кода, необходимо сосканировать пустой QR-код. После этого будет создано свободное телохранилище, действующее в течение 600 минут. По окончании этого срока QR-код освободится, и если там находился дух - он окажется на свободе
  {
    id: 'spirit-jar',
    humanReadableName: 'Spirit Jar',
    description: 'Создать телохранилище (нужен QR-код пустышка).  Срок действия - 600минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 240,
    prerequisites: ['arch-mage'],
    pack: { id: 'mage-summon-spirit', level: 1 },
    availability: 'closed',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // текстовая абилка
  {
    id: 'rummage',
    humanReadableName: 'Обыск',
    description:
      ' Покажи этот текст тому, кого хочешь обыскать. Тот, кого обыскивают, должен показать тебе все игровые предметы, не встроенные в тело. Показывать надо все, на чем есть qr-код. Также он показывает игровые документы, письма, записки. обыскивающий может их прочесть и сфотографировать.  НЕ показывает чаты, импланты, содержание телефона и игрового приложения.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-samurai'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'marauder-1',
    humanReadableName: 'Сломать оружие',
    description: 'Ты можешь порвать (разрушить по игре) куар оружия.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60 - 5 * character.body,
    prerequisites: ['arch-samurai', 'rummage'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'marauder-3',
    humanReadableName: 'Разрушить предмет',
    description:
      'Ты можешь порвать (разрушить по игре) куар доспеха, дрона, кибердеки, магического фокуса или импланта. Способность можно применить только к куару, который находится у тебя в руках. К куару находящемуся у другого персонажа способность применять НЕЛЬЗЯ.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 130 - 10 * character.body,
    prerequisites: ['arch-samurai', 'marauder-1'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // показывает игроку текст абилки, больше ничего
  {
    id: 'executioner-3',
    humanReadableName: 'Допрос раненого',
    description: 'Ты можешь допросить тяжело раненного персонажа. Допрашиваемый обязан честно и полно ответить на три вопроса.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => Math.max(0, 60 - 5 * character.charisma - 5 * character.intelligence),
    prerequisites: ['arch-samurai', 'rummage'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Сканирует тело, находящееся  в тяжране.
  // Со счета жертвы на счет самурая переводится 10% средств. После применения абилки тело переходит в КС
  {
    id: 'marauder-2',
    humanReadableName: 'Забрать деньги у раненого',
    description:
      'Ты можешь ограбить тяжелораненного персонажа, для этого отсканируй его куар - тебе переведется 10% с его счета. После грабежа жертва перейдет в состояние клинической смерти.',
    target: 'scan',
    targetsSignature: [kWoundedBodyTarget],
    cooldownMinutes: (character) => 60,
    prerequisites: ['arch-samurai', 'rummage'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: marauderAbility.name,
  },
  // текстовая абилка
  {
    id: 'rowing',
    humanReadableName: 'Забрать предмет',
    description:
      'Если вы обыскиваете человека - вы можете его ограбить. Покажите этот текст тому, кого вы собираетесь ограбить.  Вы можете забрать у жертвы три любые игровые предмета из числа тех, которые вы нашли при обыске. Телефон и доступ в сеть заблокировать обыском нельзя. Оружие (оружие, броня и т.п, все, на чем чип “оружие допущено”) при обыске забрать нельзя.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: ['rummage', 'arch-samurai'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая абилка
  {
    id: 'binding',
    humanReadableName: 'Cвязывание',
    description:
      ' Ты можешь связать человека, который не сопротивляется (добровольно) или оглушен или тяжело ранен. Для моделирования связывания человеку надевают на кисти рук две веревочные петли (чисто символические, на самом деле ничего связывать не надо). Эти петли запрещено прятать, по человеку всегда должно быть понятно, что он связан.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-samurai'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  //
  {
    id: 'unbinding',
    humanReadableName: 'Освобождение связанного',
    description:
      'Ты можешь освободить связанного мгновенно и в боевой ситуации. Отыграй, как ты оружием перепиливаешь\\отстреливаешь связующие путы. Это должно быть хорошо заметное внешнее воздействие. ',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-samurai', 'binding'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая абилка
  {
    id: 'stunning',
    humanReadableName: 'Оглушение',
    description:
      'Ты можешь оглушать. Нужно подойти к цели сзади и нанести слабый удар по плечу рукоятью холодного оружия или нерфа и произнести маркер “оглушен”. Оглушение можно производить только в небоевой ситуции.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60 - 5 * character.body,
    prerequisites: ['arch-samurai', 'binding'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Игрок может пройти по земле вместо лазанья по бревнам, сеткам и форсирования прочих препятствий припрохождении комнаты в данже. Либо игрок может применить эту комплексную форму к другому игроку.
  // А так же считается, что он собрал три предмета, если есть задание собрать предметы висящие на веревках. деревьях и т.д, поскольку он мог добраться до них при помощи левитации.
  // techno.fading + 500
  //
  {
    id: 'levitation',
    humanReadableName: 'левитация',
    description: 'Сейчас ты можешь спокойно обойти препятствие или топь по земле, считается, что ты летишь',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'magnetism', 'add-basement'],
    availability: 'open',
    karmaCost: 15,
    minimalEssence: 0,
    fadingPrice: 500,
    eventType: noItActionAbility.name,
  },
  // Прменив эту КФ игрок может выбрать любой предмет из тех, что надо собрать и игротехник должен подать игроку этот предмет.
  // techno.fading + 70
  {
    id: 'magnetism',
    humanReadableName: 'магнетизм',
    description: 'У тебя в руках магнит, он притягивает любой предмет, который надо собрать в этой комнате, но только один',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    availability: 'open',
    karmaCost: 15,
    minimalEssence: 0,
    fadingPrice: 70,
    eventType: noItActionAbility.name,
  },
  // Игрок может игнорировать усложениня типа - прохождение с одной рукой, завязанные глаза, может использовать КФ на другого игрока команды, может использовать в красной комнате, если его команда применяет КФ вторыми и кто-то в команде связан.
  // techno.fading  + 80
  {
    id: 'bond-breaker',
    humanReadableName: 'освобождение от пут',
    description: 'Ты можешь освободить одну руку себе или товарищу',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'remove-excees'],
    availability: 'open',
    karmaCost: 15,
    minimalEssence: 0,
    fadingPrice: 80,
    eventType: noItActionAbility.name,
  },
  // Игрок, на которого применили эту КФ может пройти комнату в основании один, остальные спокойно проходят за ним по земле игнорируя препятствия.
  // techno.fading + 200
  {
    id: 'one-for-all',
    humanReadableName: 'один за всех',
    description: 'Ты можешь пройти эту комнату один за всю свою команду',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'initiative-basic'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 200,
    eventType: noItActionAbility.name,
  },
  // Добавляет 1 минуту к прохождению основания, это должно быть вписано в карточку команды, как только КФ применена.
  // techno.fading + 30
  {
    id: 'add-time-1',
    humanReadableName: 'больше времени +1',
    description: 'Теперь у вас на 1 минуту больше времени в данже',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 30,
    eventType: noItActionAbility.name,
  },
  // Добавляет 2 минуты к прохождению основания, это должно быть вписано в карточку команды, как только КФ применена.
  // techno.fading + 40
  {
    id: 'add-time-2',
    humanReadableName: 'больше времени +2',
    description: 'Теперь у вас на 2 минуты больше времени в данже',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'add-time-1'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 40,
    eventType: noItActionAbility.name,
  },
  // Добавляет 3 минуты к прохождению основания, это должно быть вписано в карточку команды, как только КФ применена.
  // techno.fading + 60
  {
    id: 'add-time-3',
    humanReadableName: 'больше времени +3',
    description: 'Теперь у вас на 3 минуты больше времени в данже',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'add-time-2'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 60,
    eventType: noItActionAbility.name,
  },
  // Добавляет 4 минуты к прохождению основания, это должно быть вписано в карточку команды, как только КФ применена.
  // techno.fading + 80
  {
    id: 'add-time-4',
    humanReadableName: 'Больше времени +4',
    description: 'Теперь у вас на 4 минуты больше времени в данже',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'add-time-3'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 80,
    eventType: noItActionAbility.name,
  },
  // Добавляет 5 минут к прохождению основания, это должно быть вписано в карточку команды, как только КФ применена.
  // techno.fading + 100
  {
    id: 'add-time-5',
    humanReadableName: 'больше времени +5',
    description: 'Теперь у вас на 5 минут больше времени в данже',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'add-time-4'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 100,
    eventType: noItActionAbility.name,
  },
  // При использовании игроком этой КФ игротехник добавляет в указанном игроком месте "опору" - кладет на землю круг диаметром 20 см
  // techno.fading +120
  {
    id: 'add-basement',
    humanReadableName: 'добавить опору',
    description: 'Укажи, где должна появиться дополнительная опора',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 120,
    eventType: noItActionAbility.name,
  },
  // Игрок может задевать колокольчики, это не будет считаться проваленным прохождением комнаты.
  // techno.fading +150
  {
    id: 'bell-silence',
    humanReadableName: 'молчание колокольчиков',
    description: 'Ты можешь задевать колокольчики, матрица их не услышит',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 150,
    eventType: noItActionAbility.name,
  },
  // Игрок может сфотографировать объект и переслать фото другой части команды в основании
  // techno.fading + 230
  {
    id: 'photo-memory',
    humanReadableName: 'фотографическая память',
    description: 'Ты можешь сфотографировать объект и переслать фото другому участнику комнады',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'complex-form-basic'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 230,
    eventType: noItActionAbility.name,
  },
  // Игротехник подсказывает игроку расположение двух деталей конструкции, либо нахождение двух из искомых предметов
  // techno.fading +100
  {
    id: 'second-sight',
    humanReadableName: 'ясновидение',
    description: 'Теперь матрица (в лице игротеха) может подсказать тебе расположение двух деталей конструкции',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'photo-memory'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 100,
    eventType: noItActionAbility.name,
  },
  // Игротехник убирает все лишние детали из предложенных команде при прохождении комнаты в данже
  // techno.fading + 200
  {
    id: 'remove-excees',
    humanReadableName: 'убрать все лишнее',
    description: 'Теперь матрица подскажет тебе, какие детали лишние',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'remove-half'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 200,
    eventType: noItActionAbility.name,
  },
  // Игротехник убирает половину деталей из предложенных команде при прохождении комнаты в данже
  // techno.fading + 150
  {
    id: 'remove-half',
    humanReadableName: 'убрать половину ',
    description: 'Теперь матрица убирает половину деталей, чтобы уменьшить сложность конструкции',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 150,
    eventType: noItActionAbility.name,
  },
  // Игрок может вскрывать цифровые замки в реальном мире.
  // Через 2 минуты после активации абилки показать текст "Замок вскрыт"
  // techno.fading + 25
  {
    id: 'lockpicking',
    humanReadableName: 'Real: вскрытие замков',
    description: 'Ты можешь вскрыть цифровой замок за 2 минуты',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-hackerman-technomancer', 'bond-breaker'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 25,
    eventType: dummyAbility.name,
  },
  // Игрок может вывести из строя дрон на 90 секунд
  // techno.fading +200
  {
    id: 'attack-drone',
    humanReadableName: 'Real: паралич дрона',
    description: 'Ты можешь касанием (рукой или кинжалом) И криком "Паралич!" обездвижить любого дрона на 90 секунд.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'attack-drone-2'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 200,
    eventType: noItActionAbility.name,
  },
  // Игрок может в VR посмотреть син любого другого игрока, у которого простая аватара.
  // Показывать текст "Покажи SIN"
  // techno.fading +100
  {
    id: 'identity-scan',
    humanReadableName: 'VR: узнать личность аватарки',
    description: 'Работает только в VR. Покажи это персонажу, к которому ты хочешь узнать личность, он должен показать тебе свой SIN.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 5,
    prerequisites: ['arch-hackerman-technomancer', 'identity-hide'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 100,
    eventType: noItActionAbility.name,
  },
  // параметр techno.initiative +2 (у нападающих базовая и = 1, у защитников базовая и = 0) применяется строго до входа в красную комнату
  // techno.fading +120
  {
    id: 'initiative-add-2',
    humanReadableName: 'инициатива +2 ',
    description: 'Твои лидерские качества улучшились, Инициатива +2 \n(у нападающих базовая и = 1, у защитников базовая и = 0)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'complex-form-combat', 'initiative-basic'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 120,
    eventType: noItActionAbility.name,
  },
  // добавлет 1 хит союзнику. хиты считают сами
  // techno.fading +80
  {
    id: 'hp-add-ally-1',
    humanReadableName: 'добавить 1 хит союзнику',
    description: 'Добавить один хит союзнику (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'complex-form-combat'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 80,
    eventType: noItActionAbility.name,
  },
  // добавлет 2 хита союзнику. хиты считают сами
  // techno.fading +100
  {
    id: 'hp-add-ally-2',
    humanReadableName: 'добавить 2 хита союзнику',
    description: 'Добавить два хита союзнику (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-add-ally-1'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 100,
    eventType: noItActionAbility.name,
  },
  // добавляет 1 хит всем союзникам. хиты считают сами
  // techno.fading +150
  {
    id: 'hp-add-ally-all-1',
    humanReadableName: 'добавить 1 хит всем союзникам',
    description: 'Добавить один хит всем союзникам (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-add-ally-2'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 150,
    eventType: noItActionAbility.name,
  },
  // добавляет 2 хита всем союзникам. хиты считают сами
  // techno.fading +200
  {
    id: 'hp-add-ally-all-2',
    humanReadableName: 'добавить 2 хита всем союзникам',
    description: 'Добавить два хита всем союзникам (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-add-ally-all-1'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 200,
    eventType: noItActionAbility.name,
  },
  // снимает 1 хит противника. хиты считают сами
  // techno.fading +100
  {
    id: 'hp-remove-foe-1',
    humanReadableName: 'снять 1 хит противника',
    description: 'Снять один хит противника (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-add-ally-1'],
    availability: 'open',
    karmaCost: 5,
    minimalEssence: 0,
    fadingPrice: 100,
    eventType: noItActionAbility.name,
  },
  // снимает 2 хита противника. хиты считают сами
  // techno.fading +120
  {
    id: 'hp-remove-foe-2',
    humanReadableName: 'снять 2 хита противника',
    description: 'Снять два хита противника (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-remove-foe-1'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 120,
    eventType: noItActionAbility.name,
  },
  // снимает 1 хит со всех противников. хиты считают сами
  // techno.fading +180
  {
    id: 'hp-remove-foe-all-1',
    humanReadableName: 'снять 1 хит всем противникам',
    description: 'Снять один хит со всех противников (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-remove-foe-2'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 180,
    eventType: noItActionAbility.name,
  },
  // снимает 2 хита со всех противников. хиты считают сами
  // techno.fading +300
  {
    id: 'hp-remove-foe-all-2',
    humanReadableName: 'снять 2 хита всем противникам',
    description: 'Снять два хита со всех противников (Хиты считаете сами)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-remove-foe-all-1'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 300,
    eventType: noItActionAbility.name,
  },
  // игрок убирает одну руку за спину, она связана. игрок не может держать двуручное оружие или щит
  // techno.fading +50
  {
    id: 'bind-foe',
    humanReadableName: 'путы на одного противника',
    description:
      'Ты связал одну руку противника, теперь он не может ее использовать (должен убрать за спину и не может применять никакие предметы в этой руке)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'hp-remove-foe-1', 'initiative-add-2'],
    availability: 'open',
    karmaCost: 5,
    minimalEssence: 0,
    fadingPrice: 50,
    eventType: noItActionAbility.name,
  },
  // игроки убирают однуруку за спину, она связана. игроки не могут держать двуручное оружие или щиты
  // techno.fading +150
  {
    id: 'bind-foe-all',
    humanReadableName: 'путы на всех противников',
    description: 'Ты связал одну руку у всех противников, теперь они не могут ее использовать',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'bind-foe', 'hp-remove-foe-all-1'],
    availability: 'open',
    karmaCost: 15,
    minimalEssence: 0,
    fadingPrice: 150,
    eventType: noItActionAbility.name,
  },
  // Игроки с этого момента не могут больше использовать КФ в красной комнате, все, что было скастовано - отменятся.
  // techno.fading +600
  {
    id: 'magic-remove',
    humanReadableName: '"безмагия" на всех, кто в комнате',
    description:
      'После использования этой комплексной формы никто не может использовать комплексные формы и все действительные эффекты комплексных форм - отменяются ',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'one-for-all'],
    availability: 'open',
    karmaCost: 80,
    minimalEssence: 0,
    fadingPrice: 600,
    eventType: noItActionAbility.name,
  },
  // Игрок может покинуть основание в любой момент прохождения, например, прихватив лут из призовой комнаты, если он там будет, или поняв, что он не сможет пройти испытание и т.д.
  // Показывает текст "Ты сбежал из основания обратно в свое тело"
  // techno.fading +300
  {
    id: 'runaway',
    humanReadableName: 'Бегство из Основания',
    description:
      'Активируй способность, чтобы покинуть основание прямо сейчас. В процессе выхода тебя никто не может остановить или как-то с тобой взаимодейстовать. Ты не можешь взаимодействовать с другими персонажами или объектами. ',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic', 'initiative-basic'],
    availability: 'open',
    karmaCost: 50,
    minimalEssence: 0,
    fadingPrice: 300,
    eventType: noItActionAbility.name,
  },
  // Активирует процесс включения в дрона.
  // надо отсканировать:
  // - QR дрона
  // - QR телохранилища
  {
    id: 'drones-active',
    humanReadableName: 'Активировать управление дроном',
    description: 'Активируй, чтобы включиться в дрона.',
    target: 'scan',
    targetsSignature: kDroneAndBodyStorageTargeted,
    cooldownMinutes: (character) => Math.max(0, character.drones.recoveryTime - 5 * character.body),
    prerequisites: ['arch-rigger'],
    pack: { id: 'base-rigger', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: enterDrone.name,
  },
  // Сравнивает навык риггера drones.recoverySkill  ПЛЮС бонус ремкомплекта  с сенсором Дрона, если больше или равно - дрон переходит из состояния Сломан в состояние Работает
  {
    id: 'drone-recovery',
    humanReadableName: 'Ремонт дрона',
    description: 'Восстанавливает работоспособность дрона (необходимо отсканировать сломанного дрона и предмет "ремкомплект")',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Дрон',
        allowedTypes: ['drone'],
        field: 'droneId',
      },
      {
        name: 'Ремкомплект',
        allowedTypes: ['repair_kit'],
        field: 'qrCodeId',
      },
    ],
    cooldownMinutes: (character) => Math.max(20, 150 - 15 * character.intelligence),
    prerequisites: ['in-drone'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: droneRepairAbility.name,
  },
  // Отсканировать куар целевого персонажа, у целевого персонажа Магия уменьшается на 1.
  {
    id: 'gm-decrease-magic',
    humanReadableName: 'Уменьшение магии "-1"',
    description: 'Уменьшение магии -1',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // Отсканировать куар нода Основания матрицы.
  // Отсканировать куар спрайта
  // Информацию об активации абилки персонажем забирает Кривда на свой сайт.
  //
  {
    id: 'settle-backdoor',
    humanReadableName: 'Установить спрайт на хост',
    description: 'Установить спрайт на хост. ',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Спрайт',
        field: 'qrCodeId',
        allowedTypes: ['sprite'],
      },
      {
        name: 'Нода',
        field: 'nodeId',
        allowedTypes: ['foundation_node'],
      },
    ],
    cooldownMinutes: (character) => 15,
    prerequisites: ['arch-hackerman-technomancer'],
    pack: { id: 'gen-arch-hackerman-technomancer', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 80,
    eventType: settleBackdoorAbility.name,
  },
  // Отсканировать куар нода Основания матрицы.
  // Информацию об активации абилки персонажем забирает Кривда на свой сайт.
  // techno.fading +200
  {
    id: 'delete-backdoor',
    humanReadableName: 'Удалить спрайт ',
    description: 'Удалить спрайт с данного хоста.',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Нода',
        field: 'nodeId',
        allowedTypes: ['foundation_node'],
      },
    ],
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-hackerman-technomancer', 'settle-backdoor'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 200,
    eventType: externalAbility.name,
  },
  // Посмотреть спрайты на хосте.
  // Абилка-маркер для сайта Кривды
  // techno.fading +150
  {
    id: 'see-backdoor',
    humanReadableName: 'Посмотреть спрайты',
    description: 'Ты можешь посмотреть спрайт, установленные на данный хост.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 40,
    prerequisites: ['arch-hackerman-technomancer', 'settle-backdoor'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 150,
    eventType: externalAbility.name,
  },
  // Реализовано у Кривды
  // Гражданство: Россия
  // Распорядитель: нет
  // Виза: не применимо
  //
  {
    id: 'passport-citizen',
    humanReadableName: 'Принять в гражданство',
    description: 'Ты можешь сделать чаммера полноправным гражданином корпорации Россия',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => 3,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // Реализовано у Кривды
  // Распорядитель: как у персонажа, применившего абилку
  // фейлится, если Распорядитель = Россия до применения
  //
  {
    id: 'passport-kz',
    humanReadableName: 'Выкупить акцию',
    description: 'Ты можешь выкупить гражданскую акцию Корпорации Россия в залог',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => 3,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // Реализовано у Кривды
  // Гражданство: нет
  // Виза: нет
  // фейлится, если Гражданство = не Россия
  // фейлится, если Гражданство клерка = не Россия
  {
    id: 'passport-hobo',
    humanReadableName: 'Лишить гражданства России',
    description: 'Ты можешь лишить чаммера гражданства Корпорация Россия',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => 3,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // Реализовано у Кривды
  // Виза: null
  // успешно, если Гражданство = не Россия
  //
  {
    id: 'passport-visa-null',
    humanReadableName: 'Аннулировать визу',
    description: 'Ты можешь аннулировать визу России чаммеру, не являющемуся гражданином России',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => 3,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // показывает текст игроку, включает кулдаун
  // работает только с пререквизитами:
  // Гражданство: Россия && Распорядитель: Нет
  {
    id: 'voting-1',
    humanReadableName: 'Голосование: вариант 1',
    description: 'Ты голосуешь за вариант 1 в голосовании.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // показывает текст игроку, включает кулдаун
  // работает только с пререквизитами:
  // Гражданство: Россия && Распорядитель: Нет
  {
    id: 'voting-2',
    humanReadableName: 'Голосование: вариант 2',
    description: 'Ты голосуешь за вариант 2 в голосовании.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // показывает текст игроку, включает кулдаун
  // работает только с пререквизитами:
  // Гражданство: Россия && Распорядитель: Нет
  {
    id: 'voting-3',
    humanReadableName: 'Голосование: вариант 3',
    description: 'Ты голосуешь за вариант 3 в голосовании.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // показывает текст игроку, включает кулдаун
  // работает только с пререквизитами:
  // Гражданство: Россия && Распорядитель: Нет
  {
    id: 'voting-4',
    humanReadableName: 'Голосование: вариант 4',
    description: 'Ты голосуешь за вариант 4 в голосовании.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // показывает текст игроку, включает кулдаун
  // работает только с пререквизитами:
  // Гражданство: Россия && Распорядитель: Нет
  {
    id: 'voting-5',
    humanReadableName: 'Голосование: вариант 5',
    description: 'Ты голосуешь за вариант 5 в голосовании.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // Реализовано у Кривды
  // Виза: Есть
  // успешно, если Гражданство = не Россия
  //
  {
    id: 'passport-visa',
    humanReadableName: 'Выдать визу в Россию',
    description: 'Ты можешь выдать визу России чаммеру, не являющемуся гражданином России',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => 3,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // Реализовано у Кривды
  // Распорядитель: нет
  //
  {
    id: 'passport-kz-null',
    humanReadableName: 'Вернуть акцию из залога',
    description: 'Возвращает гражданскую акцию Корпорации Россия из залога',
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: (character) => 3,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: externalAbility.name,
  },
  // У мага на 10 минут появляется пассивная способность fireball-able, amount=1.
  {
    id: 'faerbol',
    humanReadableName: 'Faerbol',
    description:
      'У мага на 10 минут появляется пассивная способность Fireball-Эффект, позволяющая кинуть 1 файербол. Файербол должен выглядеть как обшитый мягким теннисный шар с красной лентой, его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие).',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-mage', 'arrowgant'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: faerbolAbility.name,
  },
  // Открывается окошко, куда маг вводит ауру чаммера.
  // Если чаммер с такой аурой на полигоне есть - эффект успешен.
  // Открывается экран отсканирования куар кода и на него запишется Кукла Вуду  = гиперссылка, которая ведет на мясного чаммера.
  // То есть когда какое-то заклинание говорит "отсканируй чаммера" можно отсканировать куклу.
  //
  // Через 2 часа после создания куклы
  // - кукла вуду должна самоуничтожиться
  {
    id: 'voodoo-people',
    humanReadableName: 'Создать куклу вуду',
    description:
      'Ты можешь создать куклу Вуду. Для этого тебе надо узнать ауру чаммера. Помни, что кукла ограничена по времени и необратимо влияет на цель',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['arch-mage'],
    availability: 'closed',
    karmaCost: 100,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // Активная абилка Полицаев, клон абилки paralizard-effect
  //
  {
    id: 'drone-paralysis-1',
    humanReadableName: 'Паралич движения 1',
    description: 'Ты можешь касанием (рукой или кинжалом) И криком "Паралич!" обездвижить любое мясное/эктоплазменное тело на 90 секунд.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Активная абилка Полицаев, клон абилки paralizard-effect
  //
  {
    id: 'drone-paralysis-2',
    humanReadableName: 'Паралич движения 2',
    description: 'Ты можешь касанием (рукой или кинжалом) И криком "Паралич!" обездвижить любое мясное/эктоплазменное тело на 90 секунд.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Активная абилка Полицаев, клон абилки paralizard-effect
  //
  {
    id: 'drone-paralysis-3',
    humanReadableName: 'Паралич движения 3',
    description: 'Ты можешь касанием (рукой или кинжалом) И криком "Паралич!" обездвижить любое мясное/эктоплазменное тело на 90 секунд.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['in-drone'],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Активация отключает все активные абилки (как при входе в дрона)
  // И оставляет "тело" в телохранилище.
  // - QR телохранилища
  // отсканировать одно, другое и подключиться.
  // QR аватарок мы не вводим, потому что все аватарки одинаковые и ничего не делают.  Способностей у них нет никаких.
  {
    id: 'enter-vr',
    humanReadableName: 'Зайти в Виар (колдсим)',
    description:
      'Активируй, чтобы зайти в VR (колдсим). Надо отсканировать телохранилище. Помни, что время пребывания в Виар ограничено. Если ты опоздаешь - можешь получить биофидбек (хиты, тяжран или КС).',
    target: 'scan',
    targetsSignature: kBodyStorageTargeted,
    cooldownMinutes: (character) => 120,
    prerequisites: [],
    pack: { id: 'chummer_zero', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: enterVr.name,
  },
  //
  {
    id: 'exit-vr',
    humanReadableName: 'Выйти из Виар',
    description: 'вернись к телохранилищу, чтобы покинуть VR. активируй способность и забери свое тело.',
    target: 'scan',
    targetsSignature: kBodyStorageTargeted,
    cooldownMinutes: (character) => 0,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: exitVr.name,
  },
  // текстовая абилка
  {
    id: 'loud-break-in',
    humanReadableName: 'Громкий взлом',
    description:
      'Ты можешь открыть дверь, закрытую на замок. Для этого надо в течении 5 минут громко изображать попытки выбить замок / сломать дверь. Попытки должны быть громкими и заметными окружающим.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['lock-the-door'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая абилка
  {
    id: 'quiet-break-in-hacker',
    humanReadableName: 'Тихий взлом (техномант)',
    description:
      'Ты можешь открыть дверь, закрытую на замок. Для этого надо стоять 2 минуты у закрытой двери, все это время держась рукой за сертификат замка.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['lock-the-door', 'arch-hackerman-technomancer'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая абилка
  {
    id: 'quiet-break-in-rigger',
    humanReadableName: 'Тихий взлом (риггер)',
    description:
      'Ты можешь открыть дверь, закрытую на замок. Для этого надо стоять 2 минуты у закрытой двери, все это время держась рукой за сертификат замка.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['lock-the-door', 'arch-rigger'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Игрок может снять хит с дрона
  // techno.fading +200
  {
    id: 'attack-drone-2',
    humanReadableName: 'Real: нападение на дрона',
    description: 'Ты можешь касанием (рукой или кинжалом) И криком "Нападение на дрон"\nснять 1 хит с любого тела типа дрон',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-hackerman-technomancer', 'sword-short'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 200,
    eventType: dummyAbility.name,
  },
  // После использования этой КФ игрок, на которого она была направлена, попадает в состояние КС
  // techno.fading +150
  {
    id: 'clinical-death-rr',
    humanReadableName: 'Добивание в КС в красной комнате',
    description:
      'После использования этой КФ игрок, на которого она была направлена, отправляется \nк месту, где персонаж оставил тело, а далее по правилам КС реального мира. цена 150Ф',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 30,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic', 'initiative-basic', 'sword-short'],
    availability: 'open',
    karmaCost: 150,
    minimalEssence: 0,
    fadingPrice: 150,
    eventType: dummyAbility.name,
  },
  // После использования этой КФ игрок, на которого она была направлена, попадает в состояние АС
  // techno.fading +300
  {
    id: 'absolutely-death-rr',
    humanReadableName: 'Добивание в АС в красной комнате',
    description:
      'После использования этой КФ игрок, на которого она была направлена, отправляется \nк месту, где персонаж оставил тело, а далее по правилам АС реального мира. цена 300Ф',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 90,
    prerequisites: ['arch-hackerman-technomancer', 'control-basic', 'initiative-basic', 'sword-short', 'clinical-death-rr'],
    availability: 'master',
    karmaCost: 300,
    minimalEssence: 0,
    fadingPrice: 300,
    eventType: dummyAbility.name,
  },
  // Отсканировать куар Спрайта, чтобы потратить его
  // +80
  //
  {
    id: 'native-compile',
    humanReadableName: 'Компиляция спрайта',
    description: 'Компиляция спрайта в основании',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Спрайт',
        field: 'qrCodeId',
        allowedTypes: ['sprite'],
      },
    ],
    cooldownMinutes: (character) => 1,
    prerequisites: ['arch-hackerman-technomancer'],
    pack: { id: 'gen-arch-hackerman-technomancer', level: 1 },
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 80,
    eventType: useSpriteAbility.name,
  },
  // В качестве цели сканируется QR-код телохранилища .Абилка срабатывает вне зависимости от того, есть там тело или нет. Кулдаун включается.
  // Если тела нет - получаем сообщение "Увы, камера пуста".
  // Если тело есть - со счёта этого персонажа снимается N имеющихся нюйен и переводится на счёт того, кто активировал абилку.
  // N = 10% на счёте жертвы, но не более 10% от значения _текущий максимальный баланс не иридиевого игрока_.
  {
    id: 'sleep-check',
    humanReadableName: 'Спи-спи',
    description: 'Отсканируй qr телохранилища с телом внутри, чтобы ограбить его',
    target: 'scan',
    targetsSignature: kBodyStorageTargeted,
    cooldownMinutes: (character) => 5,
    prerequisites: [],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: sleepCheckAbility.name,
  },
  // макс время в VR + 60 минут
  // itGapEssense +5"
  {
    id: 'kokkoro-vr',
    humanReadableName: 'Нано-подключение к VR',
    description: 'При подключении к VR в течение 40 минут, время пребывания там увеличено на час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveVrAbility.name,
  },
  // макс время в VR + 60 минут
  // itGapEssense +5"
  {
    id: 'koshcghei-vr',
    humanReadableName: 'Нано-подключение к VR',
    description: 'При подключении к VR в течение 40 минут, время пребывания там увеличено на час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveVrAbility.name,
  },
  // макс время в VR + 60 минут
  // itGapEssense +5"
  {
    id: 'horizon-vr',
    humanReadableName: 'Нано-подключение к VR',
    description: 'При подключении к VR в течение 40 минут, время пребывания там увеличено на час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveVrAbility.name,
  },
  // макс время в VR + 60 минут
  // itGapEssense +5"
  {
    id: 'badass-vr',
    humanReadableName: 'Нано-подключение к VR',
    description: 'При подключении к VR в течение 40 минут, время пребывания там увеличено на час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: nanohiveVrAbility.name,
  },
  // текстовая
  {
    id: 'ethic-kind',
    humanReadableName: 'Сострадание',
    description:
      'Если вы видите как кого-то планируют добить в КС, вы можете призвать атакующего проявить милосердие, показав ему эту абилку. Несостоявшийся убийца должен помочь спастись своей жертве и вам тоже (вывести из опасной ситуации). Вы должны находиться в здоровом\\легкораненом состоянии и быть способны говорить для применения этой способности. ',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая
  {
    id: 'ethic-control',
    humanReadableName: 'Решай за других',
    description: 'Ты можешь заставить другого персонажа показать его куар (при активации способности 1 раз)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 120,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая
  {
    id: 'ethic-common',
    humanReadableName: 'Моральная поддержка',
    description:
      'Покажите текст цели. Цель может нажать "Готово" на любом поступке личной этики, не выполняя его условий. Ты можешь оказать поддержку один раз в час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая
  {
    id: 'ethic-individual',
    humanReadableName: 'Волк-одиночка',
    description:
      'Если после твоей атаки враг перешел в тяжелое ранение - ты вылечиваешь все хиты. Ты можешь использовать эту способность один раз в час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // текстовая
  {
    id: 'ethic-deanon',
    humanReadableName: 'Абсолютный деанон',
    description:
      'Если ты используешь способность Деанон - от нее не спасают способности Режим Инкогнито и Режим Фаерволл. Ты можешь использовать эту способсноть один раз в час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // текстовая
  {
    id: 'ethic-treat',
    humanReadableName: 'Экстренная перевязка. ',
    description:
      'Ты можешь вылечить два хита. Способность работает как в боевой, так и  в небоевой ситуации. Ты не можешь применить способность сам на себя.  Ты можешь использовать эту способность один раз в час. Не работает на персонажей в тяжране.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // Более быстрое уменьшение фейдинга
  {
    id: 'ethic-shadow',
    humanReadableName: 'Флагеллянт',
    description:
      'Адепт должен причинить себе наказание, громко и прилюдно. После чего может проигнорировать первое попадание оружия в бою (даже тяжелого оружия).. Ты можешь использовать эту способность один раз в час.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // текстовая
  {
    id: 'ethic-ordo',
    humanReadableName: 'Давление',
    description: 'Ты можешь заставить другого персонажа показать его куар ',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // absolutely-finish-him
  {
    id: 'ethic-absolutely-finish-him',
    humanReadableName: 'Абсолютная смерть',
    description: 'Ты можешь убивать в Абсолютную смерть',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180,
    prerequisites: [],
    availability: 'closed',
    karmaCost: 100,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // В качестве цели сканируется QR-код телохранилища. Абилка срабатывает вне зависимости от того, есть там тело или нет. Кулдаун включается.
  // Если тела нет - получаем сообщение "Увы, камера пуста".
  // Если тело есть - персонажу выдается сообщение "Ваше тело атаковано! Если вы вернетесь за 10 минут - будете здоровый, за 30 минут - тяжран, более - КС".  То это должно работать  на три  кейса: дух, дрон, подключение к виар.  Важно: если у персонажа есть какие-то триггеры его собственные (например по длительности времени в дроне), то выбирается худшая опция.
  // в идеале (если например там дрон или дух) - отключать абилки дрона \ духа. Чтобы совсем наприятно было.  И страничку с экономикой тоже, чтобы в Виаре бухать не могли
  {
    id: 'sleep-shock',
    humanReadableName: 'Электрошок в мягкое тельце!',
    description: 'Отсканируй qr телохранилища с телом внутри, чтобы ударить его шоком и принудить вернуться к телу.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-rigger'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // В качестве цели сканируется QR-код телохранилища. Абилка срабатывает вне зависимости от того, есть там тело или нет. Кулдаун включается.
  // Если тела нет - получаем сообщение "Увы, камера пуста".
  // Если тело есть - персонажу выдается сообщение "Ваше тело атаковано! Если вы вернетесь за 10 минут - будете здоровый, за 30 минут - тяжран, более - КС".  То это должно работать  на три  кейса: дух, дрон, подключение к виар.  Важно: если у персонажа есть какие-то триггеры его собственные (например по длительности времени в дроне), то выбирается худшая опция.
  // в идеале (если например там дрон или дух) - отключать абилки дрона \ духа. Чтобы совсем наприятно было.  И страничку с экономикой тоже, чтобы в Виаре бухать не могли
  {
    id: 'sleep-kick',
    humanReadableName: 'Пинок в мягкое тельце!',
    description: 'Отсканируй qr телохранилища с телом внутри, чтобы больно ударить его и принудить вернуться к телу.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['arch-samurai'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // В качестве цели сканируется QR-код телохранилища. Если тело есть - получаем сообщение "здесь лежит чаммер.", указываем его имя и метатип. если нет - получаем сообщение "Здесь никого нет."
  {
    id: 'sleep-whois-decker',
    humanReadableName: 'Кто в коробчонке? (декер)',
    description: 'Отсканируй qr телохранилища с телом внутри, чтобы узнать, кто там лежит.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 4,
    prerequisites: ['arch-hackerman-decker'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // В качестве цели сканируется QR-код телохранилища. Если тело есть - получаем сообщение "здесь лежит чаммер.", указываем его имя и метатип. если нет - получаем сообщение "Здесь никого нет."
  {
    id: 'sleep-whois-technomancer',
    humanReadableName: 'Кто в коробчонке? (техномант)',
    description: 'Отсканируй qr телохранилища с телом внутри, чтобы узнать, кто там лежит.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 4,
    prerequisites: ['arch-hackerman-technomancer'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // В качестве цели сканируется QR-код телохранилища. Если тело есть - получаем сообщение "да, здесь есть тело", если нет - получаем сообщение "Здесь тела нет."
  {
    id: 'sleep-isthere-mage',
    humanReadableName: 'Есть ли кто-то в коробчонке? (маг)',
    description: 'Отсканируй qr телохранилища, чтобы проверить, есть ли кто-то внутри.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 2,
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // В качестве цели сканируется QR-код телохранилища. Если тело есть - получаем сообщение "да, здесь есть тело", если нет - получаем сообщение "Здесь тела нет."
  {
    id: 'sleep-isthere-rigger',
    humanReadableName: 'Есть ли кто-то в коробчонке? (риггер)',
    description: 'Отсканируй qr телохранилища, чтобы проверить, есть ли кто-то внутри.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 2,
    prerequisites: ['arch-rigger'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  //
  {
    id: 'enter-vr-hot',
    humanReadableName: 'Стать аватаркой и зайти в Виар (ХОТСИМ)',
    description:
      'Используй способность, чтобы зайти в Виар в режиме ХОТсим и использовать там свои способности. Переход разрешен только в точке c Виар-телохранилищами. Время пребывания в Виар ограничено, используй препараты, чтобы его увеличить. Для выхода из Виар ничего нажимать не надо.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 40,
    prerequisites: ['arch-hackerman-technomancer'],
    availability: 'open',
    karmaCost: 30,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'no-enter-agent',
    humanReadableName: 'Запрет Доступа (агент)',
    description:
      'Покажи активированную способность персонажу в VR. Он должен немедленно покинуть заведение, сотрудником которого ты являешься',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 2,
    prerequisites: ['sub-agent', 'arch-digital'],
    availability: 'open',
    karmaCost: 10,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'want-to-speak',
    humanReadableName: 'А поговорить?',
    description:
      'Покажи только что активированную способность на персонажа в Виар. Он должен быть с тобой рядом и поддерживать разговор не менее чем 5 минут. Будь вежлив и интересен! ',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: ['sub-eghost'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'forget-it-all-eghost',
    humanReadableName: 'Забвение',
    description:
      'Покажи активированную способность персонажу в VR (на Цифровых не действует!) . Цель способности забывает последние 10 минут проведенные в ВИАР. Применяется только в VR.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 90,
    prerequisites: ['want-to-speak'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'big-mommy-eghost',
    humanReadableName: 'Спроси Большого Брата',
    description: 'Задать мастеру вопрос на который можно ответить "Да", "Нет", "Это не имеет значения" и получить ответ.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 240,
    prerequisites: ['want-to-speak'],
    availability: 'open',
    karmaCost: 60,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'tell-me-what-you-know-eghost',
    humanReadableName: 'Скажи как есть',
    description:
      'Покажи активированную способность персонажу в VR (на цифровых не действует!) Цель честно отвечает на 3 вопроса. Применяется только в VR.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 90,
    prerequisites: ['want-to-speak'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'no-enter-eghost',
    humanReadableName: 'Запрет Доступа (егост)',
    description:
      'Покажи только что активированную способность персонажу. Он должен немедленно покинуть заведение, сотрудником которого ты являешься',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: ['sub-eghost', 'arch-digital'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'come-with-me-shit-eater',
    humanReadableName: 'Пойдем, выйдем',
    description: 'Вызвать на дуэль проекцию другого ИИ. В Красной комнате вы можете использовать только одноручный меч.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 90,
    prerequisites: ['sub-ai'],
    availability: 'open',
    karmaCost: 60,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-big-mommy',
    humanReadableName: 'Спроси Большого Брата',
    description: 'Задать вопрос на который можно ответить "Да", "Нет", "Это не имеет значения" и получить ответ.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180 - 10 * character.depth,
    prerequisites: ['ai-researcher'],
    availability: 'open',
    karmaCost: 50,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Абилка делает ничего.
  // Потом, мастер через админку, посчитав Эссенс, выдает цели sub-ai  .
  // Можно наверное, сначала принять эссенс, а потом просканировать персонажа, и если он sub-eghost или sub-agent - выдать дополнительно sub-ai
  {
    id: 'ai-additional-projection',
    humanReadableName: 'Нас становится больше',
    description: 'Сделать цифрового чаммера E-ghosta своей дополнительной проекцией. Необходима трата эссенса.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180,
    prerequisites: ['ai-researcher'],
    availability: 'open',
    karmaCost: 100,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-precious',
    humanReadableName: 'Моя прелесть',
    description: 'Вы можете поставить метку своего ИИ на заведение.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180 - 20 * character.depth,
    prerequisites: ['ai-manager'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-qouta',
    humanReadableName: 'Настраиваемые квоты',
    description: 'Может забрать себе содержимое одной заполненной коробки Позитива из заведения, где стоит ваша метка.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180 - 20 * character.depth,
    prerequisites: ['ai-precious'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-its-mine',
    humanReadableName: 'Это моё!',
    description: 'Может забрать себе содержимое одной заполненной коробки Позитива из заведения, где НЕ стоит ваша метка.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 360 - 20 * character.depth,
    prerequisites: ['ai-precious'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-more-precious',
    humanReadableName: 'Нужно больше Позитива',
    description: 'Вы можете увеличить запасы Вашего Позитива на 50% от имеющегося количества на момент применения способности.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 360 - 20 * character.depth,
    prerequisites: ['ai-precious'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-agressive-marketing',
    humanReadableName: 'Агрессивный Маркетинг',
    description: 'Добавляет Заведению одну белую коробку для Позитива.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180 - 20 * character.depth,
    prerequisites: ['ai-precious'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-black-pr',
    humanReadableName: 'Чёрный Пиар',
    description: 'Добавляет Заведению одну чёрную коробку для Негатива.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180 - 20 * character.depth,
    prerequisites: ['ai-manager'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-sabotage',
    humanReadableName: 'Саботаж',
    description: 'Убирает у Заведения одну белую коробку для Позитива.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 360 - 20 * character.depth,
    prerequisites: ['ai-black-pr'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-confidential',
    humanReadableName: 'Конфиденциальные протоколы',
    description: 'Ты можешь поместить временную печать на ящик Позитива или Негатива.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180 - 20 * character.depth,
    prerequisites: ['ai-black-pr'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-concurents',
    humanReadableName: 'Происки конкурентов',
    description: 'Заполнить один ящик Негатива указанного заведения (необходим мастер, он заполнит коробку бусинами).',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 360 - 20 * character.depth,
    prerequisites: ['ai-black-pr'],
    availability: 'open',
    karmaCost: 20,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-sherlock',
    humanReadableName: 'Комплексный Анализ',
    description: 'Вы можете узнать у Мастера, кто и как манипулировал коробками, Позитивом и Негативом в текущем цикле в выбранном Заведении.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 180 - 20 * character.depth,
    prerequisites: ['ai-manager'],
    availability: 'open',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // делает ничего, просто запускает кулдаун
  {
    id: 'ai-digital-violence',
    humanReadableName: 'Цифровое Ультранасилие',
    description: 'Позволяет временно заблокировать работу магазина указанного заведения.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 360 - 20 * character.depth,
    prerequisites: ['ai-manager'],
    availability: 'closed',
    karmaCost: 40,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: noItActionAbility.name,
  },
  // Активация равна входу обычного чаммера в Виар . Нужен
  // QR телохранилища
  // отсканировать и подключиться.
  // При активакии  делает все то же самое, что и обычный вход в Виар,  выдает абилку exit-vr для обратного входа в тело.
  // Смысл абилки - ИИ может делать это очень быстро. Каждые 10 минут
  {
    id: 'compile-coldsim',
    humanReadableName: 'Закрыться аватаркой (перейти в колдсим)',
    description: 'Активируй, чтобы подключиться в Колдсим (ты спрячешься в аватарку,  станешь беспомощным, но анонимным)',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: ['compile-hotsim', 'sub-ai'],
    availability: 'open',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // Штука должна работать и на хотсим (техноманты) и на колдсим (все остальные).  В колдсиме персонаж в аватарке - надо подумать. можно ли это закодить. Либо можно делать это через мастера, Потому что Позитив все равно у нас на бусинах и ручном контроле
  {
    id: 'black-ice-ai',
    humanReadableName: 'Черный лед',
    description:
      'Ты можешь убивать в Клиническую смерть. Применение требует траты Позитива (заверь у мастера). Отсканируй QR персонажа в VR, он должен немедленно выйти из  VR. После возвращения в тело с ним случится КС.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 120,
    prerequisites: ['sub-ai'],
    availability: 'closed',
    karmaCost: 80,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // Штука должна работать и на хотсим (техноманты) и на колдсим (все остальные).  В колдсиме персонаж в аватарке - надо подумать. можно ли это закодить. Либо можно делать это через мастера, Потому что Позитив все равно у нас на бусинах и ручном контроле
  {
    id: 'storm-blast-ai',
    humanReadableName: 'Цифровой шторм',
    description:
      'Ты можешь убивать в Абсолютную смерть. Применение требует траты Позитива (заверь у мастера). Отсканируй QR персонажа в VR, он должен немедленно выйти из  VR. После возвращения в тело с ним случится АС.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 240,
    prerequisites: ['black-ice-ai'],
    availability: 'closed',
    karmaCost: 80,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // Время действия 80 минут. Аура цели на это время случайным образом меняется на 30% (и случайный фрагмент, и на случайное значение).
  {
    id: 'aurma',
    humanReadableName: 'Aurma',
    description: 'На 80 минут частично изменить другому персонажу его ауру. Кулдаун 60 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 60,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // Активация дает возможность открыть замок (см.правила по взломам в "Прочих моделях"). Кулдаун - 5 минут
  {
    id: 'i-shall-pass',
    humanReadableName: 'I shall pass',
    description: 'Активация дает возможность открыть один замок. Кулдаун 5 минут',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 5,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // - время действия 10 минут, кулдаун 15 минут. Дает абилку arrowgant-effect на это время.
  {
    id: 'arr-ow',
    humanReadableName: 'Arr! Ow...',
    description: 'Активируемая защита от дистанционного легкого оружия. Время действия 10 минут. Кулдаун 15 минут.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 15,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // у цели сканируется QR, она из тяжрана/КС переходит в состояние "здоров и в максимальных хитах"
  {
    id: 'undiena',
    humanReadableName: 'Undiena',
    description: 'Поднимает одну цель из КС/тяжрана в полные хиты.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // У духа появляется на 3 минуты пассивная абилка avalance-able. amount=4. Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты упали. Для подтверждения может показать текст.
  {
    id: 'aval-festival',
    humanReadableName: 'Aval-festival',
    description:
      'Снять со всех персонажей в реале в радиусе 5 метров от точки активации хиты в количестве 4. Действует на всех, кроме самого духа. \nРекомендуется привлекать для подтверждения эффекта представителя МГ.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 9000,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // На 5 минут у духа появляется пассивная абилка birds-able.
  // Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты падают. Для подтверждения может показать текст.
  {
    id: 'date-of-birds',
    humanReadableName: 'Date of birds',
    description:
      'В течение 5 минут каждую минуту со всех в реале в радиусе 5 метров от точки активации эффекта снимается по 1 хиту (рекомендуется привлекать для подтверждения эффекта представителя МГ). \nДействует на всех, кроме самого духа.\nЕсли дух отходит от точки активации больше чем на 2 метра - действие эффекта прекращается.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 9000,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // После активации эффекта в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 15 минут - список (название заклинания,  Мощь, Откат, 40% ауры творца, метарасу творца).
  {
    id: 'trackpointer',
    humanReadableName: 'Trackpointer',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последние 25 минут.  Ауры считываются на 40 процентов',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 5,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // После активации эффекта в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 15 минут - список (название заклинания,  Мощь, DMX Отката, 80% ауры творца, метарасу творца).
  {
    id: 'trackeeteer',
    humanReadableName: 'Trackeeteer',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последние 15 минут.  Ауры считываются на 80 процентов',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // В течение 15 минут каждые 60с будет безусловно вытягиваться 1 уровень плотности маны из случайной соседней локации в текущую (там понизится, тут повысится).
  {
    id: 'get-high',
    humanReadableName: 'Get high',
    description: 'В течение 15 минут мана из соседних локаций периодически будет призываться в эту',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // В течение 15 минут каждые 60с 1 уровень плотности маны будет безусловно выгоняться в случайную соседнюю локацию (там понизится, тут повысится).
  {
    id: 'get-low',
    humanReadableName: 'Get low',
    description: 'В течение 15 минут мана из этой локации будет изгоняться в соседние',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 20,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // дух узнает часть ауры цели (95% для метачеловека, не сопротивляющегося сканированию своего qr).
  {
    id: 'auriel',
    humanReadableName: 'Auriel',
    description: 'Узнать 95% ауры не сопротивляющегося человека',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 10,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // дух узнает ауру текущей локации
  {
    id: 'reefwise',
    humanReadableName: 'Reefwise',
    description: 'Узнать ауру локации',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 5,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // у цели на 60 минут понижается Резонанс на 3.
  {
    id: 'surge-the-unclean',
    humanReadableName: 'Surge the unclean',
    description: 'На 60 минут понизить на 3 Резонанс цели, указанной добровольно предоставленным qr-кодом.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 9000,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // у цели на 60 минут понижается Харизма на 2.
  {
    id: 'ugly-is-pechi',
    humanReadableName: 'Ugly is pechi',
    description: 'На 60 минут понизить на 2 Харизму цели, указанной добровольно предоставленным qr-кодом.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 9000,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
  // TODO(aeremin): Add proper implementation
  // у цели на 60 минут повышается Харизма на 2 - но не выше 5
  {
    id: 'beautti-frutti',
    humanReadableName: 'Beautti-frutti',
    description: 'На 60 минут повысить Харизму на 2, но не выше 5, цели, указанной добровольно предоставленным qr-кодом.',
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: (character) => 9000,
    prerequisites: [],
    pack: undefined,
    availability: 'master',
    karmaCost: 0,
    minimalEssence: 0,
    fadingPrice: 0,
    eventType: dummyAbility.name,
  },
];
setAllActiveAbilities(
  (() => {
    const result = new Map<string, ActiveAbility>();
    kAllActiveAbilitiesList.forEach((f) => {
      if (result.has(f.id)) throw new Error('Non-unique active ability id: ' + f.id);
      result.set(f.id, f);
    });
    return result;
  })(),
);
