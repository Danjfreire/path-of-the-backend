import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('NOTIFICATION_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  getHello() {
    const payload = { test: 'it works' };
    this.client.emit<typeof payload>('notification', payload);
    console.log('Notification sent:', payload);
  }
}
