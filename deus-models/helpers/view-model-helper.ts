export function hasMobileViewModel(model: any) {
  return model.profileType == 'human'  || model.profileType == 'mice';
}

export function hasMedicViewModel(model: any) {
  return model.profileType == 'medic';
}
