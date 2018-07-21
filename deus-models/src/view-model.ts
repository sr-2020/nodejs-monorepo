import { ViewModelApiInterface } from 'deus-engine-manager-api';
import { BiologicalSystems, biologicalSystemsNames, Change,
  isReadyForGame, OrganismModel, systemsIndices } from '../helpers/basic-types';
import { getSymptoms, Symptoms, symptomToRussian } from '../helpers/symptoms';
import { hasMedicViewModel, hasMobileViewModel } from '../helpers/view-model-helper';

interface PageViewModel {
  menuTitle: string;
  __type: string;
  viewId: string;
}

interface Row {
  text: string;
  value?: string;
  percent?: number;
  valueColor?: string;
  viewId?: string;
}

function getCharacterName(model: OrganismModel) {
  return model.firstName + ' ' + model.lastName;
}

function getStartPage(model: OrganismModel) {
  const items: Row[] = [
    {
      text: 'Имя',
      value: getCharacterName(model),
    },
    {
      text: 'ID',
      value: model._id,
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

  if (!model.isAlive) {
    pageInfo.body.items.unshift({
      text: 'Состояние персонажа', value: 'Вы мертвы!', valueColor: '#ff565c',
    });
  }

  const illnesses = model.modifiers.filter(e => e.class == 'illness' && e.currentStage > 2);

  if (illnesses && illnesses.length) {
    pageInfo.body.items.push({
      text: 'Внимание!',
      value: 'Больно и плохо, врача!',
      valueColor: '#ff565c',
      percent: 100,
    });
  } else /*if (isHuman)*/ {
    pageInfo.body.items.push({
      text: 'Инфо:',
      value: 'Проверяй ALICE часто',
    });

  }

  return pageInfo;
}

function getRussianConditionTag(tag) {
  switch (tag) {
    case 'physiology': return 'Физиология';
    case 'mind': return 'Психология';
    default: return 'Физиология';
  }
}

function getConditionsPageItem(cond) {
  let header = cond.text;
  const details = cond.details ? cond.details : header;
  const condClass = cond.class ? cond.class : 'physiology';

  if (details == header || details == (header + '.')) {
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

function getConditionsPage(model: OrganismModel) {
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

function getBodyPage(model: OrganismModel) {
  const items: Row[] = [];
  const result = {
    __type: 'ListPageViewModel',
    menuTitle: 'Доктор Хаус',
    viewId: 'page:body',
    body: {
      title: 'Доктор Хаус',
      items,
    },
  };
  for (const i of systemsIndices()) {
    const system: BiologicalSystems = i;
    result.body.items.push({
      viewId: 'mid:' + BiologicalSystems[system],
      text: biologicalSystemsNames.get(system) as string,
      value: model.systems[i].value.toString(),
    });
  }
  return result;
}

function getSymptomsPage(model: OrganismModel): PageViewModel {
  const items: Row[] = [];
  const result = {
    __type: 'ListPageViewModel',
    menuTitle: 'Симптомы',
    viewId: 'page:symptoms',
    body: {
      title: 'Симптомы',
      items,
    },
  };

  const symptoms = getSymptoms(model);
  for (const s of symptoms) {
    result.body.items.push({
      viewId: 'mid:' + s.toString(),
      text: symptomToRussian.get(s) as string,
    });
  }
  return result;
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

function getChangesPage(model: OrganismModel) {
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

function getPages(model: OrganismModel) {
  const pages: PageViewModel[] = [];

  pages.push(getStartPage(model));

  pages.push(getConditionsPage(model));

  pages.push(getBodyPage(model));
  if (isReadyForGame(model)) {
    pages.push(getSymptomsPage(model));
  }

  pages.push(getEconomyPage());

  pages.push(getChangesPage(model));

  if (model.hasOwnProperty('showTechnicalInfo') && model.showTechnicalInfo) {
    pages.push(getTechnicalInfoPage());
  }

  return pages;
}

function getMenu(model: OrganismModel) {
  return {
    characterName: getCharacterName(model),
  };
}

function getPassportScreen(model: OrganismModel) {
  return {
    id: model._id,
    fullName: model.firstName + ' ' + model.lastName,
    corporation: model.corporation ? model.corporation : '',
    email: model.mail ? model.mail : '',
  };
}

function getToolbar(model: OrganismModel) {
  return {
    spaceSuitOn: model.spaceSuit.on,
    oxygenCapacity: model.spaceSuit.oxygenCapacity,
    timestampWhenPutOn: model.spaceSuit.timestampWhenPutOn,
  };
}

function getViewModel(model: OrganismModel) {
  return {
    _id: model._id,
    timestamp: model.timestamp,
    menu: getMenu(model),
    passportScreen: getPassportScreen(model),
    toolbar: getToolbar(model),
    pages: getPages(model),
  };
}

module.exports = () => {
  return {
    _view(_api: ViewModelApiInterface, model) {
      if (hasMobileViewModel(model)) {
        try {
          return getViewModel(model);
        } catch (err) {
          // The app would display error message when ViewModel is incorrect
          console.error(err);
          return {};
        }
      } else if (hasMedicViewModel(model)) {
        return model;
      } else
        return undefined;
    },
  };
};
