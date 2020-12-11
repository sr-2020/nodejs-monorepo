import { decode, encode } from './qr';
import { LegacyQrType } from './qr.types';
import { QrData } from '@alice/alice-qr-lib/qr.dto';

describe('QR content encoding/decode', () => {
  it('Throws format error if too short', () => {
    expect(() => decode('EQ1ybkhZksI')).toThrowError('Format Error');
  });

  const validContent = '92c2EQ1ybkhZHello';

  it('Decodable', () => {
    decode(validContent);
  });

  it('Changing any symbol fails signature check', () => {
    for (let i = 0; i < validContent.length; ++i) {
      const changedContent = validContent.slice(0, i) + 'A' + validContent.slice(i + 1);
      expect(() => decode(changedContent)).toThrowError('Validation Error');
    }
  });

  it('Invalid symbols in signature lead to format error', () => {
    const content = 'X2c2EQ1ybkhZHello'; // Symbol X is not hex symbol
    expect(() => decode(content)).toThrowError('Attempt to access memory outside buffer bounds');
  });

  it('Invalid symbols in header lead to exception', () => {
    for (let i = 4; i < 4 + 8; ++i) {
      // ? is not base64 symbol
      const changedContent = validContent.slice(0, i) + '?' + validContent.slice(i + 1);
      expect(() => decode(changedContent)).toThrowError();
    }
  });

  it('Can decode example content', () => {
    const decoded = decode('d810Aw1ybkhZHello');
    expect(decoded).toEqual({ type: LegacyQrType.InstantEffect, kind: 13, validUntil: 1497919090, payload: 'Hello' });
  });

  it('Can decode example content 2', () => {
    const decoded = decode('5472BwAA8VNl123,1267,abc');
    expect(decoded).toEqual({ type: LegacyQrType.Bill, kind: 0, validUntil: 1700000000, payload: '123,1267,abc' });
  });

  it('Can decode example content 3', () => {
    const decoded = decode('9447AQDQvrZe178').payload;
    expect(decoded).toBe('178');
  });

  it('Can decode example content 4', () => {
    const decoded = decode('c112AQCIyrZe178').payload;
    expect(decoded).toBe('178');
  });

  it('Can encode example content', () => {
    const encoded = encode({ type: LegacyQrType.InstantEffect, kind: 13, validUntil: 1497919090, payload: 'Hello' });
    expect(encoded).toBe('d810Aw1ybkhZHello');
  });

  it('Can encode example content 2', () => {
    const data: QrData = { type: LegacyQrType.Bill, kind: 0, validUntil: 1700000000, payload: '123,1267,abc' };
    expect(encode(data)).toEqual('5472BwAA8VNl123,1267,abc');
  });

  it('Can encode and decode example content with cyrillic characters', () => {
    const data: QrData = { type: LegacyQrType.InstantEffect, kind: 13, validUntil: 1497919090, payload: 'Рыба' };
    expect(decode(encode(data))).toEqual(data);
  });
});
