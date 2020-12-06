import {
  avalancheSpell,
  birdsSpell,
  brasiliaSpell,
  cacophonySpell,
  charmSpell,
  doNothingSpell,
  dummyAreaSpell,
  dummySpell,
  dumptyHumptySpell,
  enlargeMyPencilSpell,
  enlargeYourPencilSpell,
  fastChargeSpell,
  fireballSpell,
  frogSkinSpell,
  groundHealSpell,
  increaseResonanceSpell,
  keepYourselfSpell,
  liveLongAndProsperSpell,
  nothingSpecialSpell,
  odusSpell,
  readCharacterAuraSpell,
  readLocationAuraSpell,
  shtoppingSpell,
  spiritsRelatedSpell,
  stoneSkinSpell,
  taxFreeSpell,
  teaseLesserMindSpell,
  tempusFugitSpell,
  trackBallSpell,
  trackpointSpell,
} from './spells';
import { Feature, SpellSphere } from '@alice/sr2020-common/models/sr2020-character.model';

export interface Spell extends Feature {
  sphere: SpellSphere;
  eventType: string;
  hasTarget?: boolean;
}
// Not exported by design, use kAllSpells instead.
const kAllSpellsList: Spell[] = [
  {
    id: 'dummy-spell',
    humanReadableName: 'Заглушка',
    description: 'Спелл-заглушка.',
    prerequisites: [],
    availability: 'master',
    karmaCost: 0,
    sphere: 'aura',
    eventType: increaseResonanceSpell.name,
  },
  // маг может увеличить себе максимальные и текущие хиты на N на время T. N=Мощь. T=10*Мощь минут. Хиты не могут стать больше шести
  {
    id: 'keep-yourself',
    humanReadableName: 'Keep yourself',
    description: 'Увеличение своих хитов. Чем больше Мощь, тем больше хитов и дольше срок',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-spirit', level: 2 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'protection',
    eventType: keepYourselfSpell.name,
  },
  // у мага появляется на время T/на одно использование (что раньше закончится) способность ground-heal-ability. T=Мощь*10 минут
  {
    id: 'ground-heal',
    humanReadableName: 'Ground Heal',
    description: 'Поднять цель из тяжрана. Восстановить хиты до максимума. Чем больше Мощь, тем на большее время запасено заклинание',
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-protect', level: 3 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'healing',
    eventType: groundHealSpell.name,
  },
  // маг увеличивает указанной во время каста цели количество максимальных и текущих хитов на N на время T. N=Мощь. T=10*Мощь минут. Общее количество хитов не может быть больше 6 (согласно правилам по боевке)
  {
    id: 'live-long-and-prosper',
    humanReadableName: 'Live long and prosper',
    description: 'Увеличить кому-то количество хитов. Чем больше Мощь, тем больше хитов и дольше срок',
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-protect', level: 3 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'protection',
    eventType: liveLongAndProsperSpell.name,
    hasTarget: true,
  },
  // у мага на время T появляется пассивная способность fast-charge-able. Снаряд выглядит как мягкий шар с длинным (не менее 2м) хвостом, и его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). amount=Мощь-2 (но не меньше 1), T=Мощь*10 минут
  {
    id: 'fast-charge',
    humanReadableName: 'Fast charge',
    description: 'Зарядиться на время молниями. Чем больше Мощь, тем больше снарядов и срок',
    prerequisites: ['arch-mage-spellcaster'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'fighting',
    eventType: fastChargeSpell.name,
  },
  // у мага на время T появляется пассивная способность fireball-able. T и amount зависят от Мощи. Снаряд выглядит как мягкий шар, его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). N=Мощь-3 (но не меньше 1), amount=Мощь*8 минут
  {
    id: 'fireball',
    humanReadableName: 'Fireball',
    description: 'Зарядиться на время файерболами. Чем больше Мощь, тем больше снарядов и срок',
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-combat', level: 1 },
    availability: 'open',
    karmaCost: 80,
    sphere: 'fighting',
    eventType: fireballSpell.name,
  },
  // у мага на время T1=Мощь*10 минут появляется активируемая способность Take no harm.
  {
    id: 'tease-lesser-mind',
    humanReadableName: 'Tease lesser mind',
    description:
      'Временно выдаёт способность "раскрыть магический щит" (прозрачный зонтик, защищает от любого легкого оружия), потребуется её активация перед использованием. Чем больше Мощь, тем дольше сроки хранения',
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-combat', level: 3 },
    availability: 'open',
    karmaCost: 80,
    sphere: 'protection',
    eventType: teaseLesserMindSpell.name,
  },
  // У цели заклинания на T1=Мощь*20 минут появляется активируемая способность Pencil, Large!
  {
    id: 'enlarge-your-pencil',
    humanReadableName: 'Enlarge Your Pencil',
    description:
      'Временно выдаёт другому существу способность "Pencil, large!" (одно оружие в руках будет считаться тяжёлым), потребуется её активация перед использованием. Чем больше Мощь, тем дольше сроки хранения',
    prerequisites: ['arch-mage-summoner'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'fighting',
    hasTarget: true,
    eventType: enlargeYourPencilSpell.name,
  },
  // У мага на T1=Мощь*20 минут появляется активируемая способность Skin, Stone!
  {
    id: 'stone-skin',
    humanReadableName: 'Skin stoner',
    description: 'Временно выдаёт магу способность "Skin, Stone!". Чем больше Мощь, тем дольше сроки хранения',
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-protect', level: 1 },
    availability: 'open',
    karmaCost: 80,
    sphere: 'protection',
    eventType: stoneSkinSpell.name,
  },
  // У мага появляется на 3 минуты пассивная абилка avalance-able. amount=Мощь/2 (округленное вверх). Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты упали. Для подтверждения может показать текст.
  {
    id: 'avalanche',
    humanReadableName: 'Avalanche',
    description: 'Один раз снять со всех в реале в этой локации хиты. Чем больше Мощь, тем больше снимется',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-astralog', level: 3 },
    availability: 'open',
    karmaCost: 100,
    sphere: 'fighting',
    eventType: avalancheSpell.name,
  },
  // На время=amount минут у мага появляется пассивная абилка birds-able. amount=Мощь*3. <Такое-то время> - момент активации заклинания.
  // Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты падают. Для подтверждения может показать текст.
  {
    id: 'birds',
    humanReadableName: 'Birds',
    description:
      'Каждую минуту, пока не пройдет заклинание, снимать со всех в реале в этой локации по 1 хиту. Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage-summoner'],
    availability: 'open',
    karmaCost: 100,
    sphere: 'fighting',
    eventType: birdsSpell.name,
  },
  // На время T минут у мага появляется пассивная абилка cacophony-able. amount=Мощь*5. <Такое-то время> - момент активации заклинания.
  // Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты падают.
  {
    id: 'cacophony',
    humanReadableName: 'Cacophony',
    description:
      'Каждую минуту, пока не пройдет заклинание, снимать со всех в астрале в этой локации по хиту. Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'closed',
    karmaCost: 100,
    sphere: 'fighting',
    eventType: cacophonySpell.name,
  },
  // После активации заклинания у мага на T минут появляется пассивная абилка Healtouch. T=Мощь*20.
  {
    id: 'healton',
    humanReadableName: 'Healton',
    description: 'Ты временно получаешь свойство Healtouch. Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-spirit', level: 3 },
    availability: 'closed',
    karmaCost: 100,
    sphere: 'healing',
    eventType: dummyAreaSpell.name,
  },
  // После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 10+Мощь минут - список (название заклинания,  Мощь, Откат, (10+N)% ауры творца, метарасу творца). N=Мощь*5, но не более 40
  {
    id: 'trackpoint',
    humanReadableName: 'Trackpoint',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последние несколько минут.  Чем больше Мощь, тем точнее будут данные об аурах заклинателей',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-astralog', level: 1 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'astral',
    eventType: trackpointSpell.name,
  },
  // После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 60 минут - список (название заклинания,  Мощь, DMX Отката, (20+N)% ауры творца, метарасу творца). N=Мощь*10, но не более 60
  {
    id: 'trackball',
    humanReadableName: 'Trackball',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последний час. Чем больше Мощь, тем точнее будут данные об аурах заклинателей',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-astralog', level: 2 },
    availability: 'open',
    karmaCost: 80,
    sphere: 'astral',
    eventType: trackBallSpell.name,
  },
  // При активации заклинания в текущей локации у всех заклинаний с датой активации позже, чем (Текущий момент - T1 минут), дата активации в следе сдвигается в прошлое на T2 минут (то есть activation_moment = activation_moment - T2). T1=Мощь*5. T2=Мощь*4.
  // Пример: заклинание Fireball было сотворено в 10:42. В 10:45 минут маг1 кастует поверх него заклинание Tempus Fugit, T1=10, T2=10. Теперь согласно следу у заклинания Fireball время активации станет 10:32 минуты. И когда в 10:55 минут маг2 захочет считать все заклинания на глубину 20 минут, то Fireball он уже не увидит. А без Tempus Fugit увидел бы.
  // В то же время, если маг1 в 10:50 минут захочет сдвинуть метку Fireball еще дальше в прошлое, и у него будет такое же T1=10, то он уже не сможет этого сделать (потому что 10:50-10=10:40, и Fireball уже не попадает в область видимости)
  {
    id: 'tempus-fugit',
    humanReadableName: 'Tempus Fugit',
    description:
      'Единоразово сдвинуть в текущей локации следы всех заклинаний за последние несколько минут на несколько минут в прошлое. Чем больше Мощь, тем больше следов захватит заклинание и тем дальше сдвинет',
    prerequisites: ['arch-mage-summoner'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'astral',
    eventType: tempusFugitSpell.name,
  },
  // В течение Мощь*6 минут даты активации всех заклинаний с датой "sysdate - 600c" каждые 60с сдвигаются в прошлое на 300с.
  {
    id: 'brasilia',
    humanReadableName: 'Brasilia',
    description:
      'Пока не кончится заклинание, все следы всех заклинаний в этой локации, попадающих в интервал "последние 10 минут", будут каждую минуту сдвигаться в прошлое на 5 минут. Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage-summoner'],
    availability: 'open',
    karmaCost: 100,
    sphere: 'astral',
    eventType: brasiliaSpell.name,
  },
  // TODO(https://trello.com/c/Tyuy7Xes/158-реализовать-заклинание-eh-bien)
  // Заклинание для расследований. Маг указывает конкретный момент и получает такой текстовый лог по интервалу длиной T, центром которого является указанный момент:
  // “0-5 минут из интервала - такие-то [раса-пол-кусок ауры-лайфстайл, раса-пол-кусок ауры-лайфстайл, раса-пол-кусок ауры-лайфстайл...], 5-10 минут - такие-то… и тд”
  // T=Мощь*5 минут
  {
    id: 'eh-bien',
    humanReadableName: 'Eh bien',
    description:
      'Получить информацию о тех, кто был в этой локации в интервале, содержащем указанный момент времени. Чем больше Мощь, тем больше интервал',
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: dummySpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // В течение Мощь*5 минут свободные духи (не персонажи) из соседних локаций будут каждые 20с с вероятностью (100-W/10)/100 двигаться в текущую. W - это текущая сопротивляемость каждого конкретного духа, поэтому шанс каждый раз определяется отдельно для каждого духа.
  {
    id: 'beacon',
    humanReadableName: 'Beacon',
    description:
      'Пока не кончится заклинание, в эту локацию будут созываться духи из соседних (слабые духи проще). Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // В течение Мощь*5 минут свободные духи (не персонажи) из текущей локации будут каждые 20с с вероятностью (100-W/10)/100 изгоняться в соседнюю. W - это текущая сопротивляемость каждого конкретного духа, поэтому шанс каждый раз определяется отдельно для каждого духа.
  {
    id: 'run-spirit-run',
    humanReadableName: 'Run, spirit, run',
    description:
      'Пока не кончится заклинание, из этой локации будут распугиваться духи (слабые духи проще). Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/j2mrFQSU/156-реализовать-заклинания-работающие-с-плотностью-маны)
  // В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью Мощь*20. Значение больше 100% учитывать как 100%) вытянуть 1 уровень плотности маны из случайной соседней локации (там понизится, тут повысится).
  {
    id: 'input-stream',
    humanReadableName: 'InputStream',
    description:
      'Пока не кончится заклинание, мана из соседних локаций будет призываться в эту  (с некоторой вероятностью). Чем больше Мощь, тем больше срок и вероятность',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 1,
    sphere: 'astral',
    eventType: doNothingSpell.name,
  },
  // TODO(https://trello.com/c/j2mrFQSU/156-реализовать-заклинания-работающие-с-плотностью-маны)
  // В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью Мощь*20. Значение больше 100% учитывать как 100%) выгнать 1 уровень плотности маны в случайную соседнюю локацию (там понизится, тут повысится).
  {
    id: 'output-stream',
    humanReadableName: 'OutputStream',
    description:
      'Пока не кончится заклинание, мана из этой локации будет изгоняться в соседние (с некоторой вероятностью). Чем больше Мощь, тем больше срок и вероятность',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 1,
    sphere: 'astral',
    eventType: doNothingSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // В течение 60*24*2 минут доступно неограниченное число активаций. При активации необходимо сосканировать qr-код мясного тела цели, цель теряет один текущий хит, и если цель подходит под случайным образом выбранный на стадии каста метатип (норм/эльф/гном/орк/тролль) - то в этой локации создается дух (хиты: floor(Мощь/2)+1, способности: Arrowgant, Stand up and fight для Мощи < 5, иначе дополнительно Trollton)
  {
    id: 'mosquito-tree',
    humanReadableName: 'Mosquito Tree',
    description: 'Создать генератор духов, при активации надо сосканировать qr-код человека. Чем больше Мощь, тем сильнее духи',
    prerequisites: ['arch-mage-spellcaster', 'master-of-the-universe'],
    availability: 'closed',
    karmaCost: 30,
    sphere: 'astral',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг подробнее анализирует указанного  духа (выбранного из списка, где перечислены присутствующие сейчас в этой локации духи - по имени. Не по ауре!). Маг узнает случайные 10% его ауры (не просто 2 символа, а с пониманием на какой позиции они находятся), может послать ему какое-то сообщение (задает его при касте) и в ответ в зависимости от текущего уровня дружелюбия духа к магу получит текстовые сообщения какого-то уровня доверия (из заранее записанных духу).
  {
    id: 'tweet-tweet-little-bird',
    humanReadableName: 'Tweet-tweet little bird',
    description:
      'Установить контакт с выбранным из присутствующих духом. Узнать часть его ауры. Послать ему сообщение. Получить от него сообщение',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг на время Мощь*5 минут понижает на Мощь*10 текущую Сопротивляемость указанного (выбранного из списка) духа.
  {
    id: 'feed-the-cat',
    humanReadableName: 'Feed the cat',
    description: 'На время понизить Сопротивляемость указанного духа. Чем больше Мощь, тем больше срок и эффект',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг перманентно понижает Сопротивляемость указанного (выбранного из списка) духа к себе на 10, что приводит к перманентному увеличению Сопротивляемости этого духа ко всем остальным.
  {
    id: 'tame-the-dog',
    humanReadableName: 'Tame the dog',
    description: 'понизить Сопротивляемость духа по отношению к себе',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг перманентно увеличивает Сопротивляемость духа на 10.
  {
    id: 'whip-the-horse',
    humanReadableName: 'Whip the horse',
    description: 'Повысить Сопротивляемость указанного духа. Чем больше Мощь, тем больше эффект',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // В течение T1 минут можно сделать одну попытку с вероятностью (-R*5-W+M*10+F*10)/100 взять указанного духа под контроль на время T2. То есть маг заранее заряжает это заклинание, и потом в нужной локации во время активации выбирает нужного духа из списка присутствующих (в астрале или реале) духов (в том числе контролируемых другими магами или персонажей с базовым телом астральным). Если попытка удалась, то захваченный свободный дух (не персонаж) на время Т2 исчезает из пространства игры (не слышен в океане маны, не входит в списки целей "присутствующие духи" и тд). Всё это время дух доступен этому магу как тело для переключения в него. У духа может быть иное число хитов (не обязательно больше), а также другие свойства. W это текущая Сопротивляемость духа. R - ранг духа.  F - уровень способности мага “Дружелюбие духов”.
  // Если под контроль брался дух-персонаж, то он просто на протяжении действия заклинания следует указаниям автора заклинания.
  // Если попытка взять духа под контроль не удалась, то на Магию ловца накладывается штраф - величиной F на время T2. T1=Мощь*10 минут. T2=Мощь*15 минут. M=Мощь
  {
    id: 'spirit-suit',
    humanReadableName: 'Spirit Suit',
    description:
      'На некоторое время получить возможность попытаться поймать духа, что позволит на протяжении определенного периода переключиться в его тело. Существует штраф за неудачу. Чем больше Мощь, тем больше вероятность поимки и все сроки.',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'fighting',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // с вероятностью К*(-R*5-W+M*5+F*10)/100 изгоняет указанного (выбранного из списка) духа, присутствующего в этой локации, в другой пласт реальности  (то есть дух не обнаруживается ни в одной локации полигона, и нацеленные на него по ауре симпатические заклинания не могут найти такую цель и рушатся) на время T. Если дух это персонаж, а не программный объект, то он на это же время лишается всех своих способностей и отправляется в "астральный мертвятник". К - текущий "коэффициент бесогона", может быть повышен пассивными абилками, реагентами, имплантами и т.п. По умолчанию К=1. W это текущая Сопротивляемость духа. R - ранг духа.  F - уровень способности мага “Дружелюбие духов”. T=Мощь*30 минут. М=Мощь
  {
    id: 'exorcizamus',
    humanReadableName: 'Exorcizamus',
    description: 'Попытаться изгнать духа из текущей локации',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'fighting',
    eventType: spiritsRelatedSpell.name,
  },
  // маг узнает часть ауры цели (90% для метачеловека, не сопротивляющегося сканированию своего qr).
  {
    id: 'mene',
    humanReadableName: 'Mene',
    description: 'Узнать часть ауры не сопротивляющегося человека',
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-simpatic', level: 1 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'aura',
    hasTarget: true,
    eventType: readCharacterAuraSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг узнает часть ауры цели (60% для выбранного из списка присутствующих (астрал/экто) в этой локации духа).
  {
    id: 'tekel',
    humanReadableName: 'Tekel',
    description: 'Узнать часть ауры одного из присутствующих духов',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'open',
    karmaCost: 2,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // маг узнает часть ауры цели (100% для текущей локации)
  {
    id: 'fares',
    humanReadableName: 'Fares',
    description: 'Узнать часть ауры локации',
    prerequisites: ['arch-mage-summoner'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'aura',
    eventType: readLocationAuraSpell.name,
  },
  // TODO(https://trello.com/c/hIHZn9De/154-реализовать-заклинания-бьющие-по-всем-в-текущей-локации)
  // Маг получает в приложении текстом список неточных слепков (10%+N*5%-R*5%) ауры всех, кто присутствует в локации на момент активации заклинания. N=Мощь. R это уровень сопротивления сканированию ауры (маска ауры) каждой цели.
  {
    id: 'panopticon',
    humanReadableName: 'Panopticon',
    description:
      'Узнать часть ауры всех присутствующих в этой локации в реале и в астрале людей. Чем больше Мощь, тем больший фрагмент аур удастся прочитать',
    prerequisites: ['arch-mage-summoner', 'master-of-the-universe'],
    availability: 'closed',
    karmaCost: 2,
    sphere: 'aura',
    eventType: dummyAreaSpell.name,
  },
  // У цели в течение 60 минут маска ауры увеличена на Мощь*2
  {
    id: 'nothing-special',
    humanReadableName: 'Nothing special',
    description: 'Временно усилить цели маску ауры. Чем больше Мощь, тем больше защита',
    prerequisites: ['arch-mage-spellcaster'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'aura',
    eventType: nothingSpecialSpell.name,
    hasTarget: true,
  },
  // у цели на время T понижается Резонанс на N. T=Мощь*10 минут. N=Мощь-1, но не меньше 1
  {
    id: 'odus',
    humanReadableName: 'Odus',
    description:
      'Временно понизить Резонанс цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 2 },
    availability: 'open',
    karmaCost: 20,
    sphere: 'stats',
    eventType: odusSpell.name,
    hasTarget: true,
  },
  // у цели на время T понижается Харизма на N. T=Мощь*10 минут. Если Мощь < 4, то N=1. Если Мощь >= 4, то N=2
  {
    id: 'frog-skin',
    humanReadableName: 'Frog skin',
    description:
      'Временно понизить Харизму цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 2 },
    availability: 'open',
    karmaCost: 25,
    sphere: 'stats',
    eventType: frogSkinSpell.name,
    hasTarget: true,
  },
  // у цели на время T повышается Харизма на N. T=Мощь*10 минут. Если Мощь < 4, то N=1. Если Мощь >= 4, то N=2
  {
    id: 'charm',
    humanReadableName: 'Charm',
    description:
      'Временно повысить Харизму цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 2 },
    availability: 'open',
    karmaCost: 25,
    sphere: 'stats',
    eventType: charmSpell.name,
    hasTarget: true,
  },
  // у цели на время T появляется модификатор стоимости всех приобретаемых товаров = [1+(N/100)] (через скоринг?) T=Мощь*10 минут. N=Мощь*10, но не больше 50.
  {
    id: 'shtopping',
    humanReadableName: 'Shtopping',
    description:
      'Временно повысить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 2 },
    availability: 'open',
    karmaCost: 25,
    sphere: 'stats',
    eventType: shtoppingSpell.name,
    hasTarget: true,
  },
  // у цели на время T появляется модификатор стоимости всех приобретаемых товаров = [1-(N/100)] (через скоринг?). T=Мощь*10 минут. N=Мощь*10, но не больше 50
  {
    id: 'tax-free',
    humanReadableName: 'Tax free',
    description:
      'Временно понизить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 3 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'stats',
    eventType: taxFreeSpell.name,
    hasTarget: true,
  },
  // у цели на время T штраф от дамп-шока уменьшается на 1. T=Мощь*10 минут.
  {
    id: 'dumpty-humpty',
    humanReadableName: 'Dumpty-Humpty',
    description:
      'Временно понизить штраф от дамп-шока цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 3 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'stats',
    eventType: dumptyHumptySpell.name,
    hasTarget: true,
  },
  // У мага на T1=Мощь*20 минут появляется активируемая способность Pencil, Large!
  {
    id: 'enlarge-my-pencil',
    humanReadableName: 'Enlarge My Pencil',
    description:
      'Временно выдаёт магу способность "Pencil, large!" (одно оружие в руках будет считаться тяжёлым), потребуется её активация перед использованием. Чем больше Мощь, тем дольше сроки хранения',
    prerequisites: ['arch-mage-summoner'],
    pack: { id: 'mage-summon-fate', level: 1 },
    availability: 'open',
    karmaCost: 40,
    sphere: 'fighting',
    eventType: enlargeMyPencilSpell.name,
    hasTarget: false,
  },
  // У цели заклинания на T1=Мощь*20 минут появляется активируемая способность Skin, Stone!
  {
    id: 'scum-stoner',
    humanReadableName: 'Scum stoner',
    description: 'Временно выдаёт другому существу способность "Skin, Stone!". Чем больше Мощь, тем дольше сроки хранения',
    prerequisites: ['arch-mage-spellcaster'],
    pack: { id: 'mage-conjur-protect', level: 2 },
    availability: 'open',
    karmaCost: 50,
    sphere: 'protection',
    eventType: dummySpell.name,
    hasTarget: false,
  },
];
export const kAllSpells: Map<string, Spell> = (() => {
  const result = new Map<string, Spell>();
  kAllSpellsList.forEach((f) => {
    if (result.has(f.id)) throw new Error('Non-unique passive ability id: ' + f.id);
    result.set(f.id, f);
  });
  return result;
})();
