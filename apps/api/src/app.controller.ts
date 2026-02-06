import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'ok',
      message: 'Hello from NestJS Backend!',
      timestamp: new Date().toISOString(),
    };
  }
}
