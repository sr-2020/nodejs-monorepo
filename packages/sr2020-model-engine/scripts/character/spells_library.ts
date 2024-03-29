import {
  avalancheSpell,
  birdsSpell,
  brasiliaSpell,
  cacophonySpell,
  charmSpell,
  deathTouchSpell,
  doNothingSpell,
  dumbieSpell,
  dummySpell,
  dumptyHumptySpell,
  enlargeMyPencilSpell,
  enlargeYourPencilSpell,
  fastChargeSpell,
  fireballSpell,
  frogSkinSpell,
  groundHealSpell,
  healtonSpell,
  keepYourselfSpell,
  letItGoSpell,
  liveLongAndProsperSpell,
  nothingSpecialSpell,
  odusSpell,
  paralizardSpell,
  readCharacterAuraSpell,
  readLocationAuraSpell,
  shtoppingSpell,
  smartieSpell,
  spiritsRelatedSpell,
  stoneSkinSpell,
  taxFreeSpell,
  teaseLesserMindSpell,
  tempusFugitSpell,
  trackBallSpell,
  trackpointSpell,
  scumStoneSkinSpell,
  spiritCatcher,
} from './spells';
import { Spell } from '@alice/sr2020-common/models/common_definitions';
import { setAllSpells } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
// Not exported by design, use kAllSpells instead.
const kAllSpellsList: Spell[] = [
  // маг может увеличить себе максимальные и текущие хиты на N на время T. N=Мощь. T=10*Мощь минут. Хиты не могут стать больше 6 (согласно правилам по боевке)
  {
    id: 'keep-yourself',
    humanReadableName: 'Keep yourself (S)',
    description:
      'Ты можешь увеличить себе максимальные и текущие хиты на N на время T. N=Мощь. T=10*Мощь минут. Хиты не могут стать больше 6 (согласно правилам по боевке)',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'protection',
    eventType: keepYourselfSpell.name,
  },
  // у мага появляется на время T/на одно использование (что раньше закончится) способность ground-heal-ability. T=Мощь*10 минут
  {
    id: 'ground-heal',
    humanReadableName: 'Ground Heal (S)',
    description:
      'У мага появляется на время T/на одно использование (что раньше закончится) способность поднять другого персонажа из тяжрана. T=Мощь*10 минут',
    prerequisites: ['arch-mage', 'keep-yourself'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'healing',
    eventType: groundHealSpell.name,
  },
  // маг увеличивает указанной во время каста цели количество максимальных и текущих хитов на N на время T. N=Мощь. T=10*Мощь минут. Общее количество хитов не может быть больше 6 (согласно правилам по боевке)
  {
    id: 'live-long-and-prosper',
    humanReadableName: 'Live long and prosper (S)',
    description:
      'Маг увеличивает указанному во время каста другому персонажу количество максимальных и текущих хитов на N на время T. N=Мощь. T=10*Мощь минут. Общее количество хитов не может быть больше 6 (согласно правилам по боевке)',
    prerequisites: ['arch-mage', 'keep-yourself'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'protection',
    eventType: liveLongAndProsperSpell.name,
    hasTarget: true,
  },
  // у мага на время T появляется пассивная способность fast-charge-able. Снаряд выглядит как мягкий шар с длинным (не менее 2м) хвостом, и его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). amount=Мощь + 1 (но не меньше 1), T=Мощь*10 минут
  {
    id: 'fast-charge',
    humanReadableName: 'Fast charge (S)',
    description:
      'У мага на Мощь*10 минут появляется пассивная способность Fast Charge, позволяющая кидать молнии. Молния должна выглядеть как обшитый мягким теннисный шар с красной лентой и длинным (не менее 2м) хвостом, её попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). Количество доступных молний: Мощь + 1 (но не меньше 1),',
    prerequisites: ['arch-mage', 'arrowgant'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'fighting',
    eventType: fastChargeSpell.name,
  },
  // у мага на время T появляется пассивная способность fireball-able. T и amount зависят от Мощи. Снаряд выглядит как мягкий шар, его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). amount=Мощь/2 с округлением вверх, duration=Мощь*4 минут
  {
    id: 'fireball',
    humanReadableName: 'Fireball (S)',
    description:
      'У мага на Мощь*4 минуты появляется пассивная способность Fireball-Эффект, позволяющая кидать файерболы. Файербол должен выглядеть как обшитый мягким теннисный шар с красной лентой, его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). Количество доступных файерболов: Мощь/2 с округлением вверх',
    prerequisites: ['arch-mage', 'arrowgant'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'fighting',
    eventType: fireballSpell.name,
  },
  // у мага на время T1=Мощь*10 минут появляется активируемая способность Take no harm.
  {
    id: 'tease-lesser-mind',
    humanReadableName: 'Tease lesser mind (S)',
    description:
      'На Мощь*10 минут выдаёт магу способность "раскрыть магический щит" (в течение 5 минут можно защищаться раскрытым прозрачным зонтиком от любого оружия), потребуется её активация перед использованием.\nC раскрытым маг.щитом нельзя перемещаться. Если такое случилось, эффект заклинания заканчивается, маг.щит нужно сложить и в этом бою раскрывать больше нельзя.\nПока активен эффект - складывать/раскладывать маг.щит можно сколько угодно раз\nКасание раскрытого маг.щита, в том числе оружием (кроме снарядов) приводит в тяжран нападающего.',
    prerequisites: ['arch-mage', 'enlarge-my-pencil'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'protection',
    eventType: teaseLesserMindSpell.name,
  },
  // У цели заклинания на T1=Мощь*20 минут появляется активируемая способность Pencil, Large!
  {
    id: 'enlarge-your-pencil',
    humanReadableName: 'Enlarge Your Pencil (S)',
    description:
      'Большой карандаш. На Мощь*20 минут выдаёт другому существу способность "Pencil, large!" (одно холодное оружие в руках 1 минуту будет считаться тяжёлым), потребуется её активация перед использованием.',
    prerequisites: ['arch-mage', 'charm', 'dumpty-humpty', 'smartie'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'fighting',
    hasTarget: true,
    eventType: enlargeYourPencilSpell.name,
  },
  // У мага на T1=Мощь*20 минут появляется активируемая способность Skin, Stone!
  {
    id: 'stone-skin',
    humanReadableName: 'Skin stoner (S)',
    description:
      'На Мощь*20 минут выдаёт магу способность "Skin, Stone!" (надетая согласно остальным правилам лёгкая броня 5 минут считается тяжёлой). Потребуется её активация и маркировка красной лентой',
    prerequisites: ['arch-mage', 'enlarge-my-pencil'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'protection',
    eventType: stoneSkinSpell.name,
  },
  // У мага появляется на 3 минуты пассивная абилка avalanche-able. amount=Мощь/2 (округленное вверх). Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты упали. Для подтверждения может показать текст.
  {
    id: 'avalanche',
    humanReadableName: 'Кровопускание Киннидерг (S)',
    description:
      'Снять со всех персонажей в реале в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) хиты в количестве Мощь/2. Можно указать исключения, на кого заклинание не действует  (рекомендуется привлекать для подтверждения эффекта представителя МГ)',
    prerequisites: ['arch-mage', 'trackball', 'fireball', 'tease-lesser-mind'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'fighting',
    eventType: avalancheSpell.name,
  },
  // На время=amount минут у мага появляется пассивная абилка birds-able. amount=Мощь*3. <Такое-то время> - момент активации заклинания.
  // Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что у них хиты падают. Для подтверждения может показать текст.
  {
    id: 'birds',
    humanReadableName: 'Birds (S)',
    description:
      'В течение Мощь*3 минут каждую минуту со всех в реале в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) снимается по 1 хиту (рекомендуется привлекать для подтверждения эффекта представителя МГ). Если маг отходит от точки произнесения заклинания больше чем на 2 метра - действие заклинания прекращается.',
    prerequisites: ['arch-mage', 'live-long-and-prosper', 'shtopping', 'mene', 'suit-up'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'fighting',
    eventType: birdsSpell.name,
  },
  // На время T=Мощь*2 минуты у мага появляется пассивная абилка cacophony-able.
  // Пояснение как должно работать - сопровождающий мага мастер всем рассказывает, что астральное тело подвергается атаке, и заставляет приседать
  {
    id: 'cacophony',
    humanReadableName: 'Cacophony (S)',
    description:
      'В течение Мощь*2 минуты каждую минуту все в астрале в радиусе 5 метров от точки активации спелла (либо в пределах этого помещения) кроме самого мага и его друзей должны сделать 20 приседаний. Кто не делает - должен немедленно покинуть астральное тело (рекомендуется привлекать для подтверждения эффекта представителя МГ)',
    prerequisites: ['arch-mage', 'astralopithecus'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'fighting',
    eventType: cacophonySpell.name,
  },
  // После активации заклинания у мага на T минут появляется пассивная абилка Healtouch. T=Мощь*20.
  {
    id: 'healton',
    humanReadableName: 'Healton (S)',
    description:
      'Ты получаешь свойство Healtouch (касанием в течение минуты восстанавливать другим мясным/экто телам текущие хиты до максимума. Из тяжрана не поднимает) на Мощь*20 минут. Чем больше Мощь, тем больше срок',
    prerequisites: ['arch-mage', 'ground-heal'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'healing',
    eventType: healtonSpell.name,
  },
  // После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 10+Мощь минут - список (название заклинания,  Мощь, Откат, (10+N)% ауры творца, метарасу творца). N=Мощь*5, но не более 40
  {
    id: 'trackpoint',
    humanReadableName: 'Trackpoint (S)',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последние 10+Мощь минут.  Ауры считываются на 10+(Мощь*5, но не более 40)%',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'astral',
    eventType: trackpointSpell.name,
  },
  // После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 60 минут - список (название заклинания,  Мощь, DMX Отката, (20+N)% ауры творца, метарасу творца). N=Мощь*10, но не более 60
  {
    id: 'trackball',
    humanReadableName: 'Trackball (S)',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последний час. Ауры считываются на 20+(Мощь*10, но не более 60)%',
    prerequisites: ['arch-mage', 'trackpoint'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'astral',
    eventType: trackBallSpell.name,
  },
  // При активации заклинания в текущей локации у всех заклинаний с датой активации позже, чем (Текущий момент - T1 минут), дата активации в следе сдвигается в прошлое на T2 минут (то есть activation_moment = activation_moment - T2). T1=Мощь*5. T2=Мощь*4.
  // Пример: заклинание Fireball было сотворено в 10:42. В 10:45 минут маг1 кастует поверх него заклинание Tempus Fugit, T1=10, T2=10. Теперь согласно следу у заклинания Fireball время активации станет 10:32 минуты. И когда в 10:55 минут маг2 захочет считать все заклинания на глубину 20 минут, то Fireball он уже не увидит. А без Tempus Fugit увидел бы.
  // В то же время, если маг1 в 10:50 минут захочет сдвинуть метку Fireball еще дальше в прошлое, и у него будет такое же T1=10, то он уже не сможет этого сделать (потому что 10:50-10=10:40, и Fireball уже не попадает в область видимости)
  {
    id: 'tempus-fugit',
    humanReadableName: 'Tempus Fugit (S)',
    description:
      'Единоразово сдвинуть в текущей локации следы всех заклинаний за последние Мощь*5 минут на Мощь*4 минут в прошлое. Чем больше Мощь, тем больше следов захватит заклинание и тем дальше сдвинет',
    prerequisites: ['arch-mage', 'light-step'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: tempusFugitSpell.name,
  },
  // В течение Мощь*6 минут даты активации всех заклинаний с датой "sysdate - 600c" каждые 60с сдвигаются в прошлое на 300с.
  {
    id: 'brasilia',
    humanReadableName: 'Brasilia (S)',
    description:
      'В течение Мощь*6 минут все следы всех заклинаний в этой локации, попадающих в интервал "последние 10 минут", будут каждую минуту сдвигаться в прошлое на 5 минут.',
    prerequisites: ['arch-mage', 'tempus-fugit'],
    availability: 'open',
    karmaCost: 40,
    sphere: 'astral',
    eventType: brasiliaSpell.name,
  },
  // TODO(https://trello.com/c/j2mrFQSU/156-реализовать-заклинания-работающие-с-плотностью-маны)
  // В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью Мощь*20) вытянуть 1 уровень плотности маны из случайной соседней локации (там понизится, тут повысится).
  {
    id: 'input-stream',
    humanReadableName: 'InputStream (S)',
    description:
      'В течение Мощь*3 минут мана из соседних локаций периодически будет призываться в эту  (с некоторой вероятностью). Чем больше Мощь, тем больше срок и вероятность',
    prerequisites: ['arch-mage', 'geomancy'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: doNothingSpell.name,
  },
  // TODO(https://trello.com/c/j2mrFQSU/156-реализовать-заклинания-работающие-с-плотностью-маны)
  // В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью Мощь*20) выгнать 1 уровень плотности маны в случайную соседнюю локацию (там понизится, тут повысится).
  {
    id: 'output-stream',
    humanReadableName: 'OutputStream (S)',
    description:
      'В течение Мощь*3 минут мана из этой локации будет изгоняться в соседние (с некоторой вероятностью). Чем больше Мощь, тем больше срок и вероятность',
    prerequisites: ['arch-mage', 'geomancy'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: doNothingSpell.name,
  },
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  // На T минут выдаётся способность Own Spirit с фактором {{ might }} . T=Мощь*10 минут. might = Мощь
  {
    id: 'spirit-suit',
    humanReadableName: 'Spirit Suit (S)',
    description:
      'На Мощь*10 минут появится способность Own Spirit, с её помощью можно попытаться поймать духа в текущей локации и поместить его в телохранилище (можно создать с помощью Spirit Jar). Чем больше Мощь, тем больше вероятность поимки.',
    prerequisites: [],
    availability: 'master',
    karmaCost: 30,
    sphere: 'astral',
    eventType: spiritsRelatedSpell.name,
  },
  // маг узнает часть ауры цели (90% для метачеловека, не сопротивляющегося сканированию своего qr).
  {
    id: 'mene',
    humanReadableName: 'Mene (S)',
    description: 'Узнать 90% ауры не сопротивляющегося человека',
    prerequisites: ['arch-mage', 'fares'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'aura',
    hasTarget: true,
    eventType: readCharacterAuraSpell.name,
  },
  // маг узнает ауру текущей локации
  {
    id: 'fares',
    humanReadableName: 'Fares (S)',
    description: 'Узнать ауру локации',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'aura',
    eventType: readLocationAuraSpell.name,
  },
  // У цели в течение 60 минут маска ауры увеличена на Мощь*2
  {
    id: 'nothing-special',
    humanReadableName: 'Nothing special (S)',
    description: 'На 60 минут усилить цели маску ауры на Мощь*2.',
    prerequisites: ['arch-mage', 'mene'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'aura',
    eventType: nothingSpecialSpell.name,
    hasTarget: true,
  },
  // у цели на время T понижается Резонанс на N. T=Мощь*10 минут. N=Мощь-1, но не меньше 1
  {
    id: 'odus',
    humanReadableName: 'Odus (S)',
    description:
      'Понизить Резонанс. На Мощь*10 минут понизить на Мощь -1 (но не меньше 1) Резонанс цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage', 'shtopping'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'stats',
    eventType: odusSpell.name,
    hasTarget: true,
  },
  // у цели на время T понижается Харизма на N. T=Мощь*10 минут. Если Мощь < 4, то N=1. Если Мощь >= 4, то N=2
  {
    id: 'frog-skin',
    humanReadableName: 'Frog skin (S)',
    description:
      'Понизить Харизму. На Мощь*10 минут понизить на 1, если Мощь <4, иначе на 2 Харизму цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage', 'shtopping'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'stats',
    eventType: frogSkinSpell.name,
    hasTarget: true,
  },
  // у цели на время T повышается Харизма на N. T=Мощь*5 минут. Если Мощь < 4, то эффекта нет. Если Мощь >= 4, то N=1
  {
    id: 'charm',
    humanReadableName: 'Charm (S)',
    description:
      'Повысить цели Харизму на 1 на период=Мощь*5 минут. Если Мощь < 4, то эффекта не будет.  Цель должна предоставить QR-код добровольно.',
    prerequisites: ['arch-mage', 'tax-free'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'stats',
    eventType: charmSpell.name,
    hasTarget: true,
  },
  // у цели на время T появляется модификатор стоимости всех приобретаемых товаров = [1+(N/100)] (через скоринг?) T=Мощь*10 минут. N=Мощь*10, но не больше 50.
  {
    id: 'shtopping',
    humanReadableName: 'Shtopping (S)',
    description: 'Повысить цены. На Мощь*10 минут повысить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'stats',
    eventType: shtoppingSpell.name,
    hasTarget: true,
  },
  // у цели на время T появляется модификатор стоимости всех приобретаемых товаров = [1-(N/100)] (через скоринг?). T=Мощь*10 минут. N=Мощь*10, но не больше 50
  {
    id: 'tax-free',
    humanReadableName: 'Tax free (S)',
    description: 'Понизить цены. На Мощь*10 минут понизить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'stats',
    eventType: taxFreeSpell.name,
    hasTarget: true,
  },
  // У цели штраф от дамп-шока уменьшается на 1. Если Мощь заклинания >= 4, то удаляется весь дамп-шок
  {
    id: 'dumpty-humpty',
    humanReadableName: 'Dumpty-Humpty (S)',
    description:
      'Перманентно понизить на 1 имеющийся штраф от дамп-шока цели, указанной добровольно предоставленным qr-кодом. При Мощи 4+ дамп-шок удаляется весь',
    prerequisites: ['arch-mage', 'tax-free'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'stats',
    eventType: dumptyHumptySpell.name,
    hasTarget: true,
  },
  // У мага на T1=Мощь*20 минут появляется активируемая способность Pencil, Large!
  {
    id: 'enlarge-my-pencil',
    humanReadableName: 'Enlarge My Pencil (S)',
    description:
      'На Мощь*20 минут выдаёт магу способность "Pencil, large!" (одно холодное оружие в руках 5 минут будет считаться тяжёлым), потребуется её активация перед использованием. Чем больше Мощь, тем дольше сроки хранения',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'fighting',
    eventType: enlargeMyPencilSpell.name,
    hasTarget: false,
  },
  // У цели заклинания на T1=Мощь*20 минут появляется активируемая способность Skin, Stone!
  {
    id: 'scum-stoner',
    humanReadableName: 'Scum stoner (S)',
    description:
      'Каменная кожа. На Мощь*20 минут выдаёт другому существу способность "Skin, Stone!" (надетая согласно остальным правилам лёгкая броня 1 минуту считается тяжёлой). Потребуется её активация и маркировка красной лентой',
    prerequisites: ['arch-mage', 'odus', 'frog-skin', 'dumbie'],
    availability: 'open',
    karmaCost: 50,
    sphere: 'protection',
    eventType: scumStoneSkinSpell.name,
    hasTarget: true,
  },
  // На Мощь*2 минут магу выдаётся абилка Paralizard-effect
  {
    id: 'paralizard',
    humanReadableName: 'Paralizard (S)',
    description:
      'В течение Мощь*2 минуты маг способен касанием и криком "Паралич!" парализовать одно любое мясное (не эктоплазменное) тело на 90 секунд - игнорируя любую броню.\nПарализованное тело не способно передвигаться, уклоняться, применять какие-либо способности. Может говорить, может являться целью чужих способностей (в том числе, требующих скана QR).',
    prerequisites: ['arch-mage', 'hammer-of-justice'],
    availability: 'open',
    karmaCost: 80,
    sphere: 'fighting',
    eventType: paralizardSpell.name,
    hasTarget: false,
  },
  // На Мощь*3 минут магу выдаётся абилка Death Touch-effect
  {
    id: 'death-touch',
    humanReadableName: 'Death Touch (S)',
    description:
      'В течение Мощь*3 минуты маг способен касанием и криком "Смертный час!" лишить всех хитов одно любое мясное/эктоплазменное тело - игнорируя любую броню.',
    prerequisites: ['arch-mage', 'ground-heal'],
    availability: 'open',
    karmaCost: 80,
    sphere: 'fighting',
    eventType: deathTouchSpell.name,
    hasTarget: false,
  },
  // На 60с выдаётся способность Let it go Effect
  {
    id: 'let-it-go',
    humanReadableName: 'Let it go (S)',
    description:
      'В течение 1 минуты сможешь изгнать одного материализованного духа. Потребуется коснуться его рукой или кинжалом с возгласом "Изыди!"\nПосле этого дух теряет все хиты.',
    prerequisites: ['arch-mage', 'leisure-suit'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'astral',
    eventType: letItGoSpell.name,
    hasTarget: false,
  },
  // у цели на время T понижается Интеллект на N. T=Мощь*10 минут. Если Мощь < 4, то N=1. Если Мощь >= 4, то N=2
  {
    id: 'dumbie',
    humanReadableName: 'Dumbie (S)',
    description:
      'Понизить Интеллект. На Мощь*10 минут понизить на 1, если Мощь <4, иначе на 2 Интеллект цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: ['arch-mage', 'shtopping'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'stats',
    eventType: dumbieSpell.name,
    hasTarget: true,
  },
  // у цели на время T повышается Интеллект на N. T=Мощь*5 минут. Если Мощь < 4, то эффекта нет. Если Мощь >= 4, то N=1
  {
    id: 'smartie',
    humanReadableName: 'Smartie (S)',
    description:
      'Повысить цели Интеллект на 1 на период=Мощь*5 минут. Если Мощь < 4, то эффекта не будет.  Цель должна предоставить QR-код добровольно.',
    prerequisites: ['arch-mage', 'tax-free'],
    availability: 'open',
    karmaCost: 30,
    sphere: 'stats',
    eventType: smartieSpell.name,
    hasTarget: true,
  },
  // у цели на время T повышается Интеллект на N. T=Мощь*10 минут. Если Мощь < 4, то N=1. Если Мощь >= 4, то N=2
  {
    id: 'ethic-buryaty-smartie',
    humanReadableName: 'Буряты умные!',
    description:
      'Повысить Интеллект. На Мощь*10 минут повысить на 1, если Мощь <4, иначе на 2  Интеллект цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    sphere: 'stats',
    eventType: smartieSpell.name,
    hasTarget: true,
  },
  // у цели на время T понижается Интеллект на N. T=Мощь*10 минут. Если Мощь < 4, то N=1. Если Мощь >= 4, то N=2
  {
    id: 'ethic-buryaty-dumbie',
    humanReadableName: 'Буряты хитрые!',
    description:
      'Понизить Интеллект. На Мощь*10 минут понизить на 1, если Мощь <4, иначе на 2 Интеллект цели, указанной добровольно предоставленным qr-кодом.',
    prerequisites: [],
    availability: 'closed',
    karmaCost: 0,
    sphere: 'stats',
    eventType: dumbieSpell.name,
    hasTarget: true,
  },
  // Спелл выдаёт в историю и нотификацией текст "В течение Power*2 минут можно три раза попытаться поймать духа. С увеличением Мощи растут и шансы на поимку", где Power это выбранная Мощь
  {
    id: 'spirit-catcher',
    humanReadableName: 'Spirit catcher (S)',
    description: 'В течение Мощь*2 минут можно три раза попытаться поймать духа. С увеличением Мощи растут и шансы на поимку',
    prerequisites: ['arch-mage'],
    availability: 'open',
    karmaCost: 20,
    sphere: 'stats',
    eventType: spiritCatcher.name,
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
