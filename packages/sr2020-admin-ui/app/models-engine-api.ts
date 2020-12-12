import axios from 'axios';
import { Feature } from '@alice/sr2020-common/models/sr2020-character.model';
import { Implant } from '@alice/sr2020-model-engine/scripts/character/common_definitions';

const MODEL_ENGINE_URL = 'https://model-engine.evarun.ru/';

export async function allFeatures(): Promise<Feature[]> {
  const response = await axios.get<Feature[]>(MODEL_ENGINE_URL + 'features');
  return response.data;
}

export async function allImplants(): Promise<Implant[]> {
  const response = await axios.get<Implant[]>(MODEL_ENGINE_URL + 'implants');
  return response.data;
}
