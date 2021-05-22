import axios from 'axios';
import { Feature } from '@alice/sr2020-common/models/sr2020-character.model';

const MODEL_ENGINE_URL = 'https://model-engine.evarun.ru/';

export interface DictionaryItem {
  id: string;
  name: string;
  description: string;
}

export async function allFeatures(): Promise<Feature[]> {
  const response = await axios.get<Feature[]>(MODEL_ENGINE_URL + 'features');
  return response.data;
}

export async function allImplants(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'implants');
  return response.data;
}

export async function allPills(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'pills');
  return response.data;
}

export async function allReagents(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'reagents');
  return response.data;
}

export async function allEthicGroups(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'ethic_groups');
  return response.data;
}

export async function allDrones(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'drones');
  return response.data;
}

export async function allCyberdecks(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'cyberdecks');
  return response.data;
}

export async function allSoftware(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'software');
  return response.data;
}

export async function allFocuses(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'focuses');
  return response.data;
}

export async function allSprites(): Promise<DictionaryItem[]> {
  const response = await axios.get<DictionaryItem[]>(MODEL_ENGINE_URL + 'sprites');
  return response.data;
}
