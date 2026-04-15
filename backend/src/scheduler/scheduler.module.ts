import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsAppModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
