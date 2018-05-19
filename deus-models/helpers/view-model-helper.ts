export function hasMobileViewModel(model: any) {
  return model.profileType == 'human';
}

export function hasMedicViewModel(model: any) {
  return model.profileType == 'medic';
}
