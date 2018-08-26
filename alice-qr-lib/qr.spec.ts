import { expect } from 'chai';
import 'mocha';
import { decode, encode } from './qr';
import { QrType, QrData } from './qr.types';

describe('QR content encoding/decode', () => {
  it('Throws format error if too short', () => {
    expect(() => decode('EQ1ybkhZksI')).to.throw('Format Error');
  });

  it('Changing any symbol fails signature check', () => {
    const properContent: string = '92c2EQ1ybkhZHello';
    for (let i = 0; i < properContent.length; ++i) {
      const changedContent = properContent.slice(0, i) + 'A' + properContent.slice(i + 1);
      expect(() => decode(changedContent)).to.throw('Validation Error');
    }
  });

  it('Invalid symbols in signature lead to format error', () => {
    const content = 'X2c2EQ1ybkhZHello'; // Symbol X is not hex symbol
    expect(() => decode(content)).to.throw('Format Error');
  });

  it('Invalid symbols in header lead to exception', () => {
    const properContent: string = '92c2EQ1ybkhZHello';
    for (let i = 4; i < 4 + 8; ++i) {
      // ! is not base64 symbol
      const changedContent = properContent.slice(0, i) + '?' + properContent.slice(i + 1);
      expect(() => decode(changedContent)).to.throw();
    }
  });

  it('Can decode example content', () => {
    const decoded = decode('d810Aw1ybkhZHello');
    expect(decoded).to.deep.equal({type: QrType.InstantEffect, kind: 13, validUntil: 1497919090, payload: 'Hello'});
  });

  it('Can encode example content', () => {
    const encoded = encode({type: QrType.InstantEffect, kind: 13, validUntil: 1497919090, payload: 'Hello'});
    expect(encoded).to.equal('d810Aw1ybkhZHello');
  });

  it('Can encode and decode example content with cyrillic characters', () => {
    const data: QrData = {type: QrType.InstantEffect, kind: 13, validUntil: 1497919090, payload: 'Рыба'};
    expect(decode(encode(data))).to.deep.equal(data);
  });
});
