import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
