import { Condition, ViewModelApiInterface } from '@alice/interface/models/alice-model-engine';
import { Change, OrganismModel } from '../helpers/basic-types';
import { getSymptoms, symptomToRussian } from '../helpers/symptoms';
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
      value: model.modelId,
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
      text: 'Состояние персонажа',
      value: 'Вы мертвы!',
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

function getEconomyPage(model: OrganismModel) {
  return {
    __type: 'EconomyPageViewModel',
    viewId: 'page:economy',
    menuTitle: 'Экономика',
    isTopManager: model.isTopManager,
  };
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

  if (model.isAlive) {
    pages.push(getConditionsPage(model));
    pages.push(getSymptomsPage(model));
    if (model.profileType == 'human') {
      pages.push(getEconomyPage(model));
    }
  }

  pages.push(getChangesPage(model));

  if (model.showTechnicalInfo) {
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
    id: model.modelId,
    fullName: model.firstName + ' ' + model.lastName,
    corporation: model.corporation ? model.corporation : '',
  };
}

function getToolbar(model: OrganismModel) {
  if (model.profileType != 'human') {
    return {
      spaceSuitOn: false,
      oxygenCapacity: 0,
      timestampWhenPutOn: 0,
    };
  }

  return {
    spaceSuitOn: model.spaceSuit.on,
    oxygenCapacity: model.spaceSuit.oxygenCapacity,
    timestampWhenPutOn: model.spaceSuit.timestampWhenPutOn,
  };
}

function getViewModel(model: OrganismModel) {
  return {
    _id: model.modelId,
    timestamp: model.timestamp,
    menu: getMenu(model),
    passportScreen: getPassportScreen(model),
    toolbar: getToolbar(model),
    pages: getPages(model),
  };
}

module.exports = () => {
  return {
    _view(api: ViewModelApiInterface<OrganismModel>, model: any) {
      if (hasMobileViewModel(model)) {
        try {
          return getViewModel(model);
        } catch (err) {
          // The app would display error message when ViewModel is incorrect
          console.error(err);
          api.error('Error while generating viewmodel: ', err);
          return {};
        }
      } else if (hasMedicViewModel(model)) {
        return model;
      } else console.log('Not calculating viewmodel for model');
      return undefined;
    },
  };
};
