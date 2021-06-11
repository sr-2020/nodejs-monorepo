import axios, { AxiosRequestConfig } from 'axios';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@alice/sr2020-common/models/sr2020-character.model';
import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { QrCode, QrCodeProcessResponse } from '@alice/sr2020-common/models/qr-code.model';

const MODELS_MANAGER_URL = 'https://gateway.evarun.ru/api/v1/models-manager/';
const MODELS_MANAGER_CHARACTER_URL = MODELS_MANAGER_URL + 'character/model/';
const MODELS_MANAGER_QR_URL = MODELS_MANAGER_URL + 'qr/model/';

export function authToken(): string | undefined {
  const m = document.cookie.match(/Authorization=([^;]*)/);
  if (!m) return undefined;
  return m[1];
}

function config(): AxiosRequestConfig {
  return {
    headers: {
      Authorization: `Bearer ${authToken()}`,
    },
  };
}

export async function getCharacter(id: string): Promise<Sr2020Character> {
  const response = await axios.get<Sr2020CharacterProcessResponse>(MODELS_MANAGER_CHARACTER_URL + id, config());
  return response.data.workModel;
}

export async function sendCharacterEvent(id: string, event: EventRequest): Promise<Sr2020Character> {
  const response = await axios.post<Sr2020CharacterProcessResponse>(MODELS_MANAGER_CHARACTER_URL + id, event, config());
  return response.data.workModel;
}

export async function broadcastCharacterEvent(event: EventRequest): Promise<void> {
  await axios.post<Sr2020CharacterProcessResponse>(MODELS_MANAGER_CHARACTER_URL.replace('/model/', '/broadcast/'), event, config());
}

export async function setDefaultCharacter(id: string, name: string): Promise<Sr2020Character> {
  const response = await axios.put<Sr2020CharacterProcessResponse>(
    MODELS_MANAGER_CHARACTER_URL.replace('/model/', '/default/') + id,
    {
      name,
    },
    config(),
  );
  return response.data.workModel;
}

export async function getQr(id: string): Promise<QrCode> {
  const response = await axios.get<QrCodeProcessResponse>(MODELS_MANAGER_QR_URL + id, config());
  return response.data.workModel;
}

export async function sendQrEvent(id: string, event: EventRequest): Promise<QrCode> {
  const response = await axios.post<QrCodeProcessResponse>(MODELS_MANAGER_QR_URL + id, event, config());
  return response.data.workModel;
}
