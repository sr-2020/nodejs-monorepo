import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Ping')
export class PingController {
  @Get('/ping')
  ping() {
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
    };
  }
}
