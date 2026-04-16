import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
    private config: ConfigService,
  ) {}

  // ─── 1. Monthly contribution reminder ───────────────────────────────────────
  // Fires hourly; runs only when the configured hour matches
  @Cron('0 * * * *')
  async sendMonthlyReminders() {
    const config = await this.prisma.scheduleConfig.findUnique({ where: { id: 'monthly' } });
    const currentHour = new Date().getHours();
    if (!config?.enabled || config.hour !== currentHour) return;

    this.logger.log('Running monthly contribution reminder job');

    const members = await this.prisma.member.findMany({
      where: { approvalStatus: 'APPROVED', status: 'ACTIVE' },
    });

    if (!members.length) return;

    const month = new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
    const message = `Dear {name}, this is your monthly contribution reminder for ${month}. Please pay your contribution by the end of the month. God bless you. — CWA St. Gabriel`;

    try {
      await this.whatsapp.sendIndividualMessages(
        members.map((m) => ({ name: m.name, phone: m.phone })),
        message,
      );

      await this.prisma.notification.create({
        data: {
          message,
          type: 'Payment Reminder',
          targetGroup: 'All',
          recipientCount: members.length,
        },
      });

      this.logger.log(`Monthly reminders sent to ${members.length} members`);
    } catch (err) {
      this.logger.error('Monthly reminder job failed (WhatsApp unavailable)', err);
    }
  }

  // ─── 2. Due-soon reminder ────────────────────────────────────────────────────
  // Fires hourly; runs only when the configured hour matches
  @Cron('0 * * * *')
  async sendDueSoonReminders() {
    const config = await this.prisma.scheduleConfig.findUnique({ where: { id: 'dueSoon' } });
    const currentHour = new Date().getHours();
    if (!config?.enabled || config.hour !== currentHour) return;

    this.logger.log('Running due-soon reminder job');

    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const dayStart = new Date(in3Days.setHours(0, 0, 0, 0));
    const dayEnd = new Date(in3Days.setHours(23, 59, 59, 999));

    const events = await this.prisma.contributionEvent.findMany({
      where: { status: 'ACTIVE', dueDate: { gte: dayStart, lte: dayEnd } },
    });

    for (const event of events) {
      const pendingPayments = await this.prisma.eventPayment.findMany({
        where: { eventId: event.id, status: 'PENDING' },
        include: { member: true },
      });

      if (!pendingPayments.length) continue;

      const dueDateStr = event.dueDate.toLocaleDateString('en-KE');
      const message = `Dear {name}, your contribution of KES ${event.amountPerMember} for "${event.title}" is due in 3 days (${dueDateStr}). Please make your payment soon. — CWA St. Gabriel`;

      try {
        await this.whatsapp.sendIndividualMessages(
          pendingPayments.map((p) => ({ name: p.member.name, phone: p.member.phone })),
          message,
        );

        await this.prisma.notification.create({
          data: {
            message,
            type: 'Payment Reminder',
            targetGroup: event.targetJumuia,
            recipientCount: pendingPayments.length,
          },
        });

        this.logger.log(`Due-soon reminders sent for event "${event.title}" to ${pendingPayments.length} members`);
      } catch (err) {
        this.logger.error(`Due-soon reminder failed for event ${event.id}`, err);
      }
    }
  }

  // ─── 3. Overdue reminder ─────────────────────────────────────────────────────
  // Fires hourly; runs only when the configured hour matches
  @Cron('0 * * * *')
  async sendOverdueReminders() {
    const config = await this.prisma.scheduleConfig.findUnique({ where: { id: 'overdue' } });
    const currentHour = new Date().getHours();
    if (!config?.enabled || config.hour !== currentHour) return;

    this.logger.log('Running overdue reminder job');

    const now = new Date();

    const events = await this.prisma.contributionEvent.findMany({
      where: { status: 'ACTIVE', dueDate: { lt: now } },
    });

    for (const event of events) {
      const pendingPayments = await this.prisma.eventPayment.findMany({
        where: { eventId: event.id, status: 'PENDING' },
        include: { member: true },
      });

      if (!pendingPayments.length) continue;

      const dueDateStr = event.dueDate.toLocaleDateString('en-KE');
      const message = `Dear {name}, your contribution of KES ${event.amountPerMember} for "${event.title}" was due on ${dueDateStr}. Please settle this at your earliest convenience. God bless you. — CWA St. Gabriel`;

      try {
        await this.whatsapp.sendIndividualMessages(
          pendingPayments.map((p) => ({ name: p.member.name, phone: p.member.phone })),
          message,
        );

        await this.prisma.notification.create({
          data: {
            message,
            type: 'Payment Reminder',
            targetGroup: event.targetJumuia,
            recipientCount: pendingPayments.length,
          },
        });

        this.logger.log(`Overdue reminders sent for event "${event.title}" to ${pendingPayments.length} members`);
      } catch (err) {
        this.logger.error(`Overdue reminder failed for event ${event.id}`, err);
      }
    }
  }

  // ─── 4. Weekly defaulters digest ─────────────────────────────────────────────
  // Fires hourly; runs only when the configured hour matches — summary to admin phone
  @Cron('0 * * * *')
  async sendWeeklyDigest() {
    const config = await this.prisma.scheduleConfig.findUnique({ where: { id: 'weeklyDigest' } });
    const currentHour = new Date().getHours();
    if (!config?.enabled || config.hour !== currentHour) return;

    this.logger.log('Running weekly defaulters digest job');

    const adminPhone = this.config.get<string>('ADMIN_PHONE');
    if (!adminPhone) {
      this.logger.warn('ADMIN_PHONE not set — skipping weekly digest');
      return;
    }

    const outstanding = await this.prisma.eventPayment.findMany({
      where: { status: 'PENDING', event: { status: 'ACTIVE' } },
      include: { event: { select: { title: true } } },
    });

    if (!outstanding.length) {
      this.logger.log('No outstanding payments — skipping digest');
      return;
    }

    const totalOwed = outstanding.reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);
    const uniqueMembers = new Set(outstanding.map((p) => p.memberId)).size;
    const eventTitles = [...new Set(outstanding.map((p) => p.event.title))].join(', ');

    const message = `CWA Admin Report: ${uniqueMembers} members have outstanding payments totalling KES ${totalOwed.toLocaleString('en-KE')}. Active events with debt: ${eventTitles}.`;

    try {
      await this.whatsapp.sendIndividualMessages(
        [{ name: 'Admin', phone: adminPhone }],
        message,
      );

      await this.prisma.notification.create({
        data: {
          message,
          type: 'General Update',
          targetGroup: 'Admin',
          recipientCount: 1,
        },
      });

      this.logger.log('Weekly digest sent to admin');
    } catch (err) {
      this.logger.error('Weekly digest failed (WhatsApp unavailable)', err);
    }
  }
}
