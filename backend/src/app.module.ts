import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { ContributionsModule } from './contributions/contributions.module';
import { ExpensesModule } from './expenses/expenses.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GroupsModule } from './groups/groups.module';
import { ReportsModule } from './reports/reports.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }]),
    PrismaModule,
    AuthModule,
    MembersModule,
    ContributionsModule,
    ExpensesModule,
    EventsModule,
    NotificationsModule,
    GroupsModule,
    ReportsModule,
    WhatsAppModule,
    SchedulerModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
