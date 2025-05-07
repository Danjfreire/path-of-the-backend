import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('notification')
  handleNotification(data: Record<string, unknown>) {
    console.log('Notification received:', data);
  }
}
