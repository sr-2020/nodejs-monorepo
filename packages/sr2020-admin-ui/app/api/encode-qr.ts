import axios from 'axios';
import { QrData } from '@alice/alice-qr-lib/qr.dto';

export async function encodeQr(qr: QrData): Promise<string> {
  const response = await axios.get<{ content: string }>(
    `https://qr.aerem.in/encode?type=${qr.type}&kind=${qr.kind}&validUntil=${qr.validUntil}&payload=${qr.payload}`,
  );
  return response.data.content;
}
