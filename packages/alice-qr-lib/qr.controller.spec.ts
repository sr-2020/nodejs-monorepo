import { Test, TestingModule } from '@nestjs/testing';

import { QrController } from './qr.controller';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [QrController],
      providers: [],
    }).compile();
  });

  describe('QR Service', () => {
    it('Encode and decode back is idempotent', () => {
      const appController = app.get<QrController>(QrController);
      const encoded = appController.encode({ type: 10, kind: 26, validUntil: 1697919090, payload: 'UUID' });
      expect(encoded.content).toEqual(expect.stringContaining(''));
      const decoded = appController.decode(encoded);
      expect(decoded).toEqual({ type: 10, kind: 26, validUntil: 1697919090, payload: 'UUID' });
    });
  });
});
