import { Condition, Modifier, ViewModelApiInterface } from '@alice/interface/models/alice-model-engine';
import { Change, DeusExModel, MemoryEntry, Message } from '../deus-ex-model';
import { IllnessModifier } from '../helpers/catalog_types';

interface PageViewModel {
  menuTitle: string;
  __type: string;
  viewId: string;
}

interface Row {
  text: string;
  value: string;
  percent?: number;
  valueColor?: string;
}

function getCharacterName(model: DeusExModel) {
  return model.firstName + ' ' + model.lastName;
}

function getRussianSex(sex: string) {
  switch (sex) {
    case 'male':
      return 'мужской';
    case 'female':
      return 'женский';
    case 'agender':
      return 'агендер';
    default:
      return '---';
  }
}

function getHandicaps(model: DeusExModel) {
  if (model.hp == 0) {
    return 'только лежать';
  } else {
    return '';
  }
}

function getStartPage(model: DeusExModel) {
  const isHuman = model.profileType == 'human';
  const isProgram = model.profileType == 'program';
  const isExHumanProgram = model.profileType == 'exhuman-program';
  const isRobot = model.profileType == 'robot';
  const isExHumanRobot = model.profileType == 'ex-human-robot';

  const items: Row[] = [
    {
      text: 'Имя',
      value: getCharacterName(model),
    },
    {
      text: 'ID',
      value: model.modelId,
    },
    {
      text: 'e-mail',
      value: model.mail,
    },
  ];

  const pageInfo = {
    __type: 'ListPageViewModel',
    viewId: 'page:general',
    menuTitle: 'Общая информация',
    body: {
      title: 'Общая информация',
      items: items,
    },
  };

  if (!isProgram && !isExHumanProgram) {
    pageInfo.body.items.push({ text: 'Пол', value: getRussianSex(model.sex) });
  }

  if (!model.isAlive) {
    pageInfo.body.items.unshift({
      text: 'Состояние персонажа',
      value: 'Вы мертвы!',
      valueColor: '#ff565c',
    });
  }

  if (isRobot) {
    pageInfo.body.items.unshift({ text: 'Тип системы:', value: `Андроид ${model.model}` });
  }

  if (isExHumanRobot) {
    pageInfo.body.items.unshift({ text: 'Тип системы:', value: model.model });
  }

  if (isProgram || isExHumanProgram) {
    pageInfo.body.items.unshift({ text: 'Тип системы:', value: 'Программа' });
  }

  if (model.profileType == 'robot' || isProgram) {
    pageInfo.body.items.push({ text: 'Создатель', value: model.creator });
    pageInfo.body.items.push({ text: 'Владелец', value: model.owner });
  }

  if (model.generation && isHuman) {
    pageInfo.body.items.push({ text: 'Поколение', value: model.generation });
  }

  if (!isProgram && !isExHumanProgram) {
    pageInfo.body.items.push({ text: 'Проживание', value: model.sweethome });
  }

  const workRow = {
    text: 'Работа',
    value: model.corporation,
  };

  const insuranceRow = {
    text: 'Страховка',
    value: model.insuranceDiplayName,
  };

  if (isHuman || isExHumanProgram || isExHumanRobot) {
    pageInfo.body.items.push(workRow);
    pageInfo.body.items.push(insuranceRow);
  }

  if (!isProgram && !isExHumanProgram) {
    const hpRow: Row = {
      text: 'Hit Points',
      value: model.hp + ' / ' + model.maxHp,
      percent: 0,
    };

    if (model.maxHp) {
      hpRow.percent = (100 * model.hp) / model.maxHp;
    }

    if (model.hp == 0) {
      hpRow.valueColor = '#ff565c';
    }

    pageInfo.body.items.push(hpRow);
  }

  const illnesses = model.modifiers.filter((e) => e.class == 'illness' && (e as IllnessModifier).currentStage > 2);

  if (illnesses?.length) {
    pageInfo.body.items.push({
      text: 'Внимание!',
      value: 'Больно и плохо, врача!',
      valueColor: '#ff565c',
      percent: 100,
    });
  } else if (isHuman) {
    pageInfo.body.items.push({
      text: 'Инфо:',
      value: 'Проверяй ALICE часто',
    });
  }

  const handicaps = getHandicaps(model);
  if (handicaps) {
    pageInfo.body.items.push({
      text: 'Ограничения движения',
      value: getHandicaps(model),
      valueColor: '#ff565c',
    });
  }

  return pageInfo;
}

function getRussianConditionTag(tag: string) {
  switch (tag) {
    case 'physiology':
      return 'Физиология';
    case 'mind':
      return 'Психология';
    default:
      return 'Физиология';
  }
}

function getConditionsPageItem(cond: Condition) {
  let header = cond.text;
  const details = cond.details ? cond.details : header;
  const condClass = cond.class ? cond.class : 'physiology';

  if (details == header || details == header + '.') {
    header = 'Состояние';
  }

  return {
    viewId: 'id:' + cond.id,
    text: cond.text,
    tag: getRussianConditionTag(condClass),
    icon: condClass,
    details: {
      header,
      text: details,
    },
  };
}

function getConditionsPage(model: DeusExModel) {
  return {
    __type: 'ListPageViewModel',
    viewId: 'page:conditions',
    menuTitle: 'Состояния',
    body: {
      title: 'Ваши состояния',
      items: model.conditions.map(getConditionsPageItem),
      filters: ['Физиология', 'Психология'],
    },
  };
}

function getTechnicalInfoPage() {
  return {
    __type: 'TechnicalInfoPageViewModel',
    viewId: 'page:technicalInfo',
    menuTitle: 'Техническая инфа',
  };
}

function getEconomyPage() {
  return {
    __type: 'EconomyPageViewModel',
    viewId: 'page:economy',
    menuTitle: 'Экономика',
  };
}

function getEnabledText(enabled: boolean) {
  return enabled ? 'ON' : 'OFF';
}

function getEnabledColor(enabled: boolean) {
  return enabled ? '' : '#FF373F';
}

const implantsClasses = ['cyber-implant', 'bio-implant', 'illegal-cyber-implant', 'illegal-bio-implant', 'virtual', 'firmware'];

function isImplant(modifier: Modifier) {
  return implantsClasses.find((c) => modifier.class == c);
}

const systemNames = {
  musculoskeletal: 'опорно-двигательная',
  cardiovascular: 'сердечно-сосудистая',
  respiratory: 'дыхательная',
  endocrine: 'эндокринная',
  lymphatic: 'лимфатическая',
  nervous: 'нервная',
};

function getImplantDetails(modifier: Modifier) {
  const details = modifier.details ?? 'подробного описания нет';

  if (modifier.system) {
    return `<p><b>Система организма:</b> ${systemNames[modifier.system]}</p><p><b>Описание:</b></p><p>${details}</p>`;
  } else {
    return `<p><b>Описание:</b></p><p>${details}</p>`;
  }
}

function getImplantsPageItem(modifier: Modifier) {
  return {
    text: modifier.displayName,
    value: getEnabledText(modifier.enabled),
    valueColor: getEnabledColor(modifier.enabled),
    details: {
      header: modifier.displayName,
      text: getImplantDetails(modifier),
      actions: [
        // {
        //     text: getEnableActionText(modifier.enabled),
        //     eventType: modifier.enabled ? "disable-implant" : "enable-implant",
        //     dangerous: modifier.enabled ? true : false,
        //     needsQr: false,
        //     data: {
        //         mID: modifier.mID,
        //     },
        // }
        // {
        //     text: "Отдать гопнику (не работает)",
        //     eventType: "giveAway",
        //     needsQr: 100,
        //     destructive: true,
        //     data: {
        //         mID: modifier.mID,
        //     },
        // },
      ],
    },
  };
}

function getImplantsPage(model: DeusExModel) {
  const pageTitle = model.profileType == 'human' ? 'Импланты' : 'Прошивки';

  return {
    __type: 'ListPageViewModel',
    viewId: 'page:implants',
    menuTitle: pageTitle,
    body: {
      title: pageTitle,
      items: model.modifiers.filter(isImplant).map(getImplantsPageItem),
    },
  };
}

function getMemoryPageItem(mem: MemoryEntry) {
  let header = mem.title;

  if (mem.text == mem.title || mem.text == mem.title + '.') {
    header = 'Воспоминание';
  }

  let details = '';
  if (mem.text) details += `<p>${mem.text.replace(/\s/g, ' ')}</p>`;
  if (mem.url) details += `<p><a href="${mem.url}">${mem.url}</a></p>`;

  return {
    text: mem.title,
    details: {
      header: header,
      text: details,
    },
  };
}

function getMemoryPage(model: DeusExModel) {
  return {
    __type: 'ListPageViewModel',
    viewId: 'page:memory',
    menuTitle: 'Воспоминания',
    body: {
      title: 'Воспоминания',
      items: model.memory.map(getMemoryPageItem),
    },
  };
}

function getChangesPageItem(change: Change) {
  return {
    viewId: 'mid:' + change.mID,
    text: change.text,
    unixSecondsValue: Math.round(change.timestamp / 1000),
    details: {
      header: 'Изменение',
      text: change.text,
    },
  };
}

function getChangesPage(model: DeusExModel) {
  return {
    __type: 'ListPageViewModel',
    viewId: 'page:changes',
    menuTitle: 'Изменения',
    body: {
      title: 'Изменения',
      items: model.changes.reverse().map(getChangesPageItem),
    },
  };
}

function getMessagesPageItem(message: Message) {
  return {
    viewId: 'mid:' + message.mID,
    text: message.title,
    details: {
      header: message.title,
      text: message.text,
    },
  };
}

function getMessagesPage(model: DeusExModel) {
  return {
    __type: 'ListPageViewModel',
    viewId: 'page:messages',
    menuTitle: 'Сообщения',
    body: {
      title: 'Сообщения',
      items: model.messages.reverse().map(getMessagesPageItem),
    },
  };
}

function getPages(model: DeusExModel) {
  const pages: PageViewModel[] = [];

  const isHuman = model.profileType == 'human';
  const isProgram = model.profileType == 'program';
  const isExHumanProgram = model.profileType == 'exhuman-program';
  const isExHumanRobot = model.profileType == 'ex-human-robot';

  pages.push(getStartPage(model));
  pages.push(getMemoryPage(model));

  if (!isProgram) {
    pages.push(getConditionsPage(model));
  }

  if (!isProgram && !isExHumanRobot && !isExHumanProgram) {
    pages.push(getImplantsPage(model));
  }

  if (isHuman || isExHumanProgram || isExHumanRobot) {
    pages.push(getEconomyPage());
  }
  pages.push(getChangesPage(model));
  pages.push(getMessagesPage(model));

  if (model.showTechnicalInfo) {
    pages.push(getTechnicalInfoPage());
  }

  return pages;
}

// General characteristics not tied to any page or UI element.
function getGeneral(model: DeusExModel) {
  return {
    maxSecondsInVr: model.maxSecondsInVr,
  };
}

function getMenu(model: DeusExModel) {
  return {
    characterName: getCharacterName(model),
  };
}

function getToolbar(model: DeusExModel) {
  const ret = {
    hitPoints: model.hp,
    maxHitPoints: model.maxHp,
  };

  if (model.maxHp == 0) {
    ret.maxHitPoints = 1;
  }

  return ret;
}

function getPassportScreen(model: DeusExModel) {
  return {
    id: model.modelId,
    fullName: model.firstName + ' ' + model.lastName,
    corporation: model.corporation ? model.corporation : '',
    email: model.mail ? model.mail : '',
    insurance: model.insuranceDiplayName,
  };
}

function getViewModel(model: DeusExModel) {
  return {
    modelId: model.modelId,
    timestamp: model.timestamp,
    general: getGeneral(model),
    menu: getMenu(model),
    toolbar: getToolbar(model),
    passportScreen: getPassportScreen(model),
    pages: getPages(model),
  };
}

module.exports = () => {
  return {
    _view(api: ViewModelApiInterface<any>, model) {
      try {
        return getViewModel(model);
      } catch (err) {
        // The app would display error message when ViewModel is incorrect
        return {};
      }
    },
  };
};
