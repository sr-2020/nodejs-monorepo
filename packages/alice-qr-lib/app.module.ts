import { Module } from '@nestjs/common';

import { QrController } from './qr.controller';

@Module({
  imports: [],
  controllers: [QrController],
  providers: [],
})
export class AppModule {}
