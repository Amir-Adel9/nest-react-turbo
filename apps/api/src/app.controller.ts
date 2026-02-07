import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getIndex() {
    return { status: 'ok', message: 'API is running' };
  }
}
