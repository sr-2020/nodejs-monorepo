import axios from 'axios';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@alice/sr2020-common/models/sr2020-character.model';
import { EventRequest } from '@alice/alice-common/models/alice-model-engine';

const MODELS_MANAGER_URL = 'https://models-manager.evarun.ru/';
const MODELS_MANAGER_CHARACTER_URL = MODELS_MANAGER_URL + 'character/model/';

export async function getCharacter(id: string): Promise<Sr2020Character> {
  const response = await axios.get<Sr2020CharacterProcessResponse>(MODELS_MANAGER_CHARACTER_URL + id);
  return response.data.workModel;
}

export async function sendCharacterEvent(id: string, event: EventRequest): Promise<Sr2020Character> {
  const response = await axios.post<Sr2020CharacterProcessResponse>(MODELS_MANAGER_CHARACTER_URL + id, event);
  return response.data.workModel;
}
