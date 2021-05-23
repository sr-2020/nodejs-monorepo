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
import { Spell } from '@alice/sr2020-common/models/common_definitions';
import { setAllSpells } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
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
    description:
      'Ты можешь увеличить себе максимальные и текущие хиты на N на время T. N=Мощь. T=10*Мощь минут. Хиты не могут стать больше шести',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'protection',
    eventType: keepYourselfSpell.name,
  },
  // у мага появляется на время T/на одно использование (что раньше закончится) способность ground-heal-ability. T=Мощь*10 минут
  {
    id: 'ground-heal',
    humanReadableName: 'Ground Heal',
    description:
      'У мага появляется на время T/на одно использование (что раньше закончится) способность поднять другого персонажа из тяжрана. T=Мощь*10 минут',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'healing',
    eventType: groundHealSpell.name,
  },
  // маг увеличивает указанной во время каста цели количество максимальных и текущих хитов на N на время T. N=Мощь. T=10*Мощь минут. Общее количество хитов не может быть больше 6 (согласно правилам по боевке)
  {
    id: 'live-long-and-prosper',
    humanReadableName: 'Live long and prosper',
    description:
      'Маг увеличивает указанному во время каста другому персонажу количество максимальных и текущих хитов на N на время T. N=Мощь. T=10*Мощь минут. Общее количество хитов не может быть больше 6 (согласно правилам по боевке)',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'protection',
    eventType: liveLongAndProsperSpell.name,
    hasTarget: true,
  },
  // у мага на время T появляется пассивная способность fast-charge-able. Снаряд выглядит как мягкий шар с длинным (не менее 2м) хвостом, и его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). amount=Мощь + 1 (но не меньше 1), T=Мощь*10 минут
  {
    id: 'fast-charge',
    humanReadableName: 'Fast charge',
    description:
      'У мага на Мощь*10 минут появляется пассивная способность Fast Charge, позволяющая кидать молнии. Молния должна выглядеть как обшитый мягким теннисный шар с красной лентой и длинным (не менее 2м) хвостом, её попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). Количество доступных молний: Мощь + 1 (но не меньше 1),',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'fighting',
    eventType: fastChargeSpell.name,
  },
  // у мага на время T появляется пассивная способность fireball-able. T и amount зависят от Мощи. Снаряд выглядит как мягкий шар, его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). N=Мощь/2 с округлением вверх, amount=Мощь*8 минут
  {
    id: 'fireball',
    humanReadableName: 'Fireball',
    description:
      'У мага на Мощь*4 минуты появляется пассивная способность Fireball-Эффект, позволяющая кидать файерболы. Файербол должен выглядеть как обшитый мягким теннисный шар с красной лентой, его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). Количество доступных файерболов: Мощь/2 с округлением вверх',
    prerequisites: ['arch-mage'],
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
      'На Мощь*10 минут выдаёт магу способность "раскрыть магический щит" (в течение 5 минут можно защищаться раскрытым прозрачным зонтиком от любого лёгкого оружия), потребуется её активация перед использованием.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 60,
    sphere: 'protection',
    eventType: teaseLesserMindSpell.name,
  },
  // У цели заклинания на T1=Мощь*20 минут появляется активируемая способность Pencil, Large!
  {
    id: 'enlarge-your-pencil',
    humanReadableName: 'Enlarge Your Pencil',
    description:
      'На Мощь*20 минут выдаёт другому существу способность "Pencil, large!" (одно холодное оружие в руках 5 минут будет считаться тяжёлым), потребуется её активация перед использованием.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 80,
    sphere: 'fighting',
    hasTarget: true,
    eventType: enlargeYourPencilSpell.name,
  },
  // У мага на T1=Мощь*20 минут появляется активируемая способность Skin, Stone!
  {
    id: 'stone-skin',
    humanReadableName: 'Skin stoner',
    description:
      'На Мощь*20 минут выдаёт магу способность "Skin, Stone!" (надетая согласно остальным правилам лёгкая броня 5 минут считается тяжёлой). Потребуется её активация',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 80,
    sphere: 'protection',
    eventType: stoneSkinSpell.name,
  },
  // У мага появляется на 3 минуты пассивная абилка avalance-able. amount=Мощь/2 (округленное вверх). Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты упали. Для подтверждения может показать текст.
  {
    id: 'avalanche',
    humanReadableName: 'Avalanche',
    description:
      'Снять со всех персонажей в реале в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) хиты в количестве Мощь/2. Можно указать исключения, на кого заклинание не действует  (рекомендуется привлекать для подтверждения эффекта представителя МГ)',
    prerequisites: ['arch-mage'],
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
      'В течение Мощь*3 минут каждую минуту со всех в реале в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) снимается по 1 хиту (рекомендуется привлекать для подтверждения эффекта представителя МГ)',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 100,
    sphere: 'fighting',
    eventType: birdsSpell.name,
  },
  // На время T минут у мага появляется пассивная абилка cacophony-able. amount=Мощь*5. <Такое-то время> - момент активации заклинания.
  // Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что астральное тело подвергается атаке, и заставляет приседать
  {
    id: 'cacophony',
    humanReadableName: 'Cacophony',
    description:
      'В течение Мощь*2 минуты каждую минуту все в астрале в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) кроме самого мага и его друзей должны сделать 20 приседаний. Кто не делает - должен немедленно покинуть астральное тело (рекомендуется привлекать для подтверждения эффекта представителя МГ)',
    prerequisites: ['arch-mage'],
    availability: 'closed',
    karmaCost: 100,
    sphere: 'fighting',
    eventType: cacophonySpell.name,
  },
  // После активации заклинания у мага на T минут появляется пассивная абилка Healtouch. T=Мощь*20.
  {
    id: 'healton',
    humanReadableName: 'Healton',
    description:
      'Ты получаешь свойство Healtouch (касанием восстанавливать мясным телам текущие хиты до максимума) на Мощь*20 минут. Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage'],
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
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последние 10+Мощь минут.  Ауры считываются на 10+Мощь*5 процентов, но не более 40',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: trackpointSpell.name,
  },
  // После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 60 минут - список (название заклинания,  Мощь, DMX Отката, (20+N)% ауры творца, метарасу творца). N=Мощь*10, но не более 60
  {
    id: 'trackball',
    humanReadableName: 'Trackball',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последний час. Ауры считываются на 20+Мощь*10 процентов, но не более 60',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 70,
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
      'Единоразово сдвинуть в текущей локации следы всех заклинаний за последние Мощь*5 минут на Мощь*4 минут в прошлое. Чем больше Мощь, тем больше следов захватит заклинание и тем дальше сдвинет',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 70,
    sphere: 'astral',
    eventType: tempusFugitSpell.name,
  },
  // В течение Мощь*6 минут даты активации всех заклинаний с датой "sysdate - 600c" каждые 60с сдвигаются в прошлое на 300с.
  {
    id: 'brasilia',
    humanReadableName: 'Brasilia',
    description:
      'В течение Мощь*6 минут все следы всех заклинаний в этой локации, попадающих в интервал "последние 10 минут", будут каждую минуту сдвигаться в прошлое на 5 минут.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 150,
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
    description: 'Получить информацию о тех, кто был в текущей локации в интервале (Мощь*5 минут), содержащем указанный момент времени.',
    prerequisites: [],
    availability: 'closed',
    karmaCost: 30,
    sphere: 'astral',
    eventType: dummySpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // В течение Мощь*5 минут свободные духи (не персонажи) из соседних локаций будут каждые 20с с вероятностью (100-W/10)/100 двигаться в текущую. W - это текущая сопротивляемость каждого конкретного духа, поэтому шанс каждый раз определяется отдельно для каждого духа.
  {
    id: 'beacon',
    humanReadableName: 'Beacon',
    description: 'В течение Мощь*5 минут в эту локацию будут созываться духи из соседних (слабые духи проще).',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'astral',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // В течение Мощь*5 минут свободные духи (не персонажи) из текущей локации будут каждые 20с с вероятностью (100-W/10)/100 изгоняться в соседнюю. W - это текущая сопротивляемость каждого конкретного духа, поэтому шанс каждый раз определяется отдельно для каждого духа.
  {
    id: 'run-spirit-run',
    humanReadableName: 'Run, spirit, run',
    description: 'В течение Мощь*5 минут из этой локации будут распугиваться духи (слабые духи проще). Чем больше Мощь, тем больше срок',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'astral',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/j2mrFQSU/156-реализовать-заклинания-работающие-с-плотностью-маны)
  // В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью Мощь*20) вытянуть 1 уровень плотности маны из случайной соседней локации (там понизится, тут повысится).
  {
    id: 'input-stream',
    humanReadableName: 'InputStream',
    description: 'В течение Мощь*3 минут мана из соседних локаций периодически будет призываться в эту  (с некоторой вероятностью).',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 80,
    sphere: 'astral',
    eventType: doNothingSpell.name,
  },
  // TODO(https://trello.com/c/j2mrFQSU/156-реализовать-заклинания-работающие-с-плотностью-маны)
  // В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью Мощь*20) выгнать 1 уровень плотности маны в случайную соседнюю локацию (там понизится, тут повысится).
  {
    id: 'output-stream',
    humanReadableName: 'OutputStream',
    description:
      'В течение Мощь*3 минут мана из этой локации будет изгоняться в соседние (с некоторой вероятностью). Чем больше Мощь, тем больше срок и вероятность',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 80,
    sphere: 'astral',
    eventType: doNothingSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // В течение 60*24*2 минут доступно неограниченное число активаций. При активации необходимо сосканировать qr-код мясного тела цели, цель теряет один текущий хит, и если цель подходит под случайным образом выбранный на стадии каста метатип (норм/эльф/гном/орк/тролль) - то в этой локации создается дух (хиты: floor(Мощь/2)+1, способности: Arrowgant, Stand up and fight для Мощи < 5, иначе дополнительно Trollton)
  {
    id: 'mosquito-tree',
    humanReadableName: 'Mosquito Tree',
    description: 'Создать генератор духов, при активации надо сосканировать qr-код человека. Чем больше Мощь, тем сильнее духи',
    prerequisites: [],
    availability: 'master',
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
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг на время Мощь*5 минут понижает на Мощь*10 текущую Сопротивляемость указанного (выбранного из списка) духа.
  {
    id: 'feed-the-cat',
    humanReadableName: 'Feed the cat',
    description: 'На Мощь*5 минут понизить Сопротивляемость указанного духа на Мощь*10.',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг перманентно понижает Сопротивляемость указанного (выбранного из списка) духа к себе на 10, что приводит к перманентному увеличению Сопротивляемости этого духа ко всем остальным.
  {
    id: 'tame-the-dog',
    humanReadableName: 'Tame the dog',
    description: 'Перманентно понизить Сопротивляемость духа на 10 по отношению к себе',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг перманентно увеличивает Сопротивляемость духа на 10.
  {
    id: 'whip-the-horse',
    humanReadableName: 'Whip the horse',
    description: 'Перманентно повысить Сопротивляемость указанного духа на 10 ко всем. Чем больше Мощь, тем больше эффект',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // На T минут выдаётся способность Own Spirit с фактором {{ might }} . T=Мощь*10 минут. might = Мощь
  {
    id: 'spirit-suit',
    humanReadableName: 'Spirit Suit',
    description:
      'На Мощь*10 минут появится способность Own Spirit, с её помощью можно попытаться поймать духа в текущей локации и поместить его в телохранилище (можно создать с помощью Spirit Jar). Чем больше Мощь, тем больше вероятность поимки.',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'astral',
    eventType: spiritsRelatedSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // с вероятностью К*(-R*5-W+M*5+F*10)/100 изгоняет указанного (выбранного из списка) духа, присутствующего в этой локации, в другой пласт реальности  (то есть дух не обнаруживается ни в одной локации полигона, и нацеленные на него по ауре симпатические заклинания не могут найти такую цель и рушатся) на время T. Если дух это персонаж, а не программный объект, то он на это же время лишается всех своих способностей и отправляется в "астральный мертвятник". К - текущий "коэффициент бесогона", может быть повышен пассивными абилками, реагентами, имплантами и т.п. По умолчанию К=1. W это текущая Сопротивляемость духа. R - ранг духа.  F - уровень способности мага “Дружелюбие духов”. T=Мощь*30 минут. М=Мощь
  {
    id: 'exorcizamus',
    humanReadableName: 'Exorcizamus',
    description:
      'Попытаться изгнать духа из текущей локации на Мощь*30. Вероятность успеха зависит от ранга духа и его Сопротивления этому магу, от вложенной Мощи.',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'fighting',
    eventType: spiritsRelatedSpell.name,
  },
  // маг узнает часть ауры цели (90% для метачеловека, не сопротивляющегося сканированию своего qr).
  {
    id: 'mene',
    humanReadableName: 'Mene',
    description: 'Узнать 90% ауры не сопротивляющегося человека',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'aura',
    hasTarget: true,
    eventType: readCharacterAuraSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // маг узнает часть ауры цели (60% для выбранного из списка присутствующих (астрал/экто) в этой локации духа).
  {
    id: 'tekel',
    humanReadableName: 'Tekel',
    description: 'Узнать 60% ауры одного из присутствующих духов',
    prerequisites: [],
    availability: 'master',
    karmaCost: 2,
    sphere: 'aura',
    eventType: spiritsRelatedSpell.name,
  },
  // маг узнает часть ауры цели (100% для текущей локации)
  {
    id: 'fares',
    humanReadableName: 'Fares',
    description: 'Узнать ауру локации',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'aura',
    eventType: readLocationAuraSpell.name,
  },
  // TODO(https://trello.com/c/hIHZn9De/154-реализовать-заклинания-бьющие-по-всем-в-текущей-локации)
  // Маг получает в приложении текстом список неточных слепков (10%+N*5%-R*5%) ауры всех, кто присутствует в локации на момент активации заклинания. N=Мощь. R это уровень сопротивления сканированию ауры (маска ауры) каждой цели.
  {
    id: 'panopticon',
    humanReadableName: 'Panopticon',
    description: 'Узнать часть ауры (10 + Мощь*5 - ЗащитаАуры*5)% каждого присутствующего в этой локации в реале и в астрале человека.',
    prerequisites: [],
    availability: 'master',
    karmaCost: 2,
    sphere: 'aura',
    eventType: dummyAreaSpell.name,
  },
  // У цели в течение 60 минут маска ауры увеличена на Мощь*2
  {
    id: 'nothing-special',
    humanReadableName: 'Nothing special',
    description: 'На 60 минут усилить цели маску ауры на Мощь*2.',
    prerequisites: ['arch-mage'],
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
    description: 'На Мощь*10 минут понизить на Мощь -1 (но не меньше 1) Резонанс цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
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
    description: 'На Мощь*10 минут понизить на 1, если Мощь <4, иначе на 2 Харизму цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
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
    description: 'На Мощь*10 минут повысить на 1, если Мощь <4, иначе на 2  Харизму цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
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
      'На Мощь*10 минут на Мощь*10 (но не более, чем на 50) повысить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
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
      'На Мощь*10 минут на Мощь*10 (но не более, чем на 50) понизить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
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
    description: 'На Мощь*10 минут понизить на 1 штраф от дамп-шока цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'stats',
    eventType: dumptyHumptySpell.name,
    hasTarget: true,
  },
  // У мага на T1=Мощь*20 минут появляется активируемая способность Pencil, Large!
  {
    id: 'enlarge-my-pencil',
    humanReadableName: 'Enlarge My Pencil',
    description:
      'На Мощь*20 минут выдаёт магу способность "Pencil, large!" (одно холодное оружие в руках 5 минут будет считаться тяжёлым), потребуется её активация перед использованием. Чем больше Мощь, тем дольше сроки хранения',
    prerequisites: ['arch-mage'],
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
    description:
      'На Мощь*20 минут выдаёт другому существу способность "Skin, Stone!" (надетая согласно остальным правилам лёгкая броня 5 минут считается тяжёлой). Потребуется её активация',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'protection',
    eventType: dummySpell.name,
    hasTarget: false,
  },
  // В течение Мощь*8 минут каждые 60с маг в приложении получает текстом информацию, ближе или дальше он стал от цели, которую он указал вводом ее ауры.
  {
    id: 'hot-and-cold',
    humanReadableName: 'Hot and Cold',
    description:
      'В течение Мощь*8 минут каждые 60с будешь получать сообщение, ближе или дальше от цели ты оказался. Чем больше Мощь, тем больше срок',
    prerequisites: [],
    availability: 'closed',
    karmaCost: 30,
    sphere: 'astral',
    eventType: dummySpell.name,
    hasTarget: false,
  },
  // Текстом выдается аура локации, в которой на момент активации находится цель, указанная вводом ее ауры.
  {
    id: 'now-i-see',
    humanReadableName: 'Now I see',
    description: 'Получить ауру локации, в которой находится цель (указанная её аурой)',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'astral',
    eventType: dummySpell.name,
    hasTarget: false,
  },
  // На Мощь*2 минут магу выдаётся абилка Paralizard-effect
  {
    id: 'paralizard',
    humanReadableName: 'Paralizard',
    description:
      'В течение Мощь*2 минуты маг способен касанием и криком "Паралич!" обездвижить любое мясное тело на 90 секунд - игнорируя любую броню.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 70,
    sphere: 'fighting',
    eventType: dummySpell.name,
    hasTarget: false,
  },
  // На Мощь*3 минут магу выдаётся абилка Death Touch-effect
  {
    id: 'death-touch',
    humanReadableName: 'Death Touch',
    description:
      'В течение Мощь*3 минуты маг способен касанием и криком "Смертный час!" лишить всех хитов любое мясное/эктоплазменное тело - игнорируя любую броню.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 100,
    sphere: 'fighting',
    eventType: dummySpell.name,
    hasTarget: false,
  },
  // TODO(aeremin): Add proper implementation
  // На 60с выдаётся способность Let it go Effect
  {
    id: 'let-it-go',
    humanReadableName: 'Let it go',
    description:
      'В течение 1 минуты сможешь изгнать одного материализованного духа. Потребуется коснуться его рукой или кинжалом с возгласом "Изыди!"\nПосле этого дух теряет все хиты.',
    prerequisites: ['arch-mage'],
    pack: undefined,
    availability: 'open',
    karmaCost: 80,
    sphere: 'astral',
    eventType: dummySpell.name,
    hasTarget: false,
  },
];
setAllSpells(
  (() => {
    const result = new Map<string, Spell>();
    kAllSpellsList.forEach((f) => {
      if (result.has(f.id)) throw new Error('Non-unique spell id: ' + f.id);
      result.set(f.id, f);
    });
    return result;
  })(),
);
