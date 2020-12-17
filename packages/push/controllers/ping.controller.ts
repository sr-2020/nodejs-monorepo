import { Controller, Get } from '@nestjs/common';

@Controller()
export class PingController {
  @Get('/ping')
  ping() {
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
    };
  }
}
