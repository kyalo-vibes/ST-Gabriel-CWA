import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
  ) {}

  findAll() {
    return this.prisma.contributionEvent.findMany({
      include: { _count: { select: { payments: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.contributionEvent.findUnique({
      where: { id },
      include: {
        payments: {
          include: {
            member: { select: { id: true, name: true, phone: true, jumuia: true } },
          },
        },
      },
    });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }

  async create(dto: CreateEventDto) {
    const whereClause: any = { approvalStatus: 'APPROVED', status: 'ACTIVE' };
    if (dto.targetJumuia && dto.targetJumuia !== 'All') {
      whereClause.jumuia = dto.targetJumuia;
    }

    const { created: eventRecord, members } = await this.prisma.$transaction(async (tx) => {
      const members = await tx.member.findMany({ where: whereClause });

      const created = await tx.contributionEvent.create({
        data: {
          ...dto,
          dueDate: new Date(dto.dueDate),
          targetJumuia: dto.targetJumuia ?? 'All',
        },
      });

      if (members.length > 0) {
        await tx.eventPayment.createMany({
          data: members.map((m) => ({
            eventId: created.id,
            memberId: m.id,
            amountDue: dto.amountPerMember,
            amountPaid: 0,
            status: 'PENDING',
          })),
        });
      }

      return { created, members };
    });

    if (members.length > 0) {
      const message = `Dear {name}, a new contribution event has been created: "${eventRecord.title}". Please contribute KES ${dto.amountPerMember} by ${new Date(dto.dueDate).toLocaleDateString('en-KE')}. God bless you. — CWA St. Gabriel`;

      void this.whatsapp.sendIndividualMessages(
        members.map((m) => ({ name: m.name, phone: m.phone })),
        message,
      ).then(() =>
        this.prisma.notification.create({
          data: {
            message,
            type: 'Event Announcement',
            targetGroup: dto.targetJumuia ?? 'All',
            recipientCount: members.length,
          },
        })
      ).catch((e) => this.logger.warn('Event WhatsApp notification failed', e?.message));
    }

    return eventRecord;
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    return this.prisma.contributionEvent.update({ where: { id }, data });
  }

  async getPayments(eventId: string, user: { id: string; role: string }) {
    await this.findOne(eventId);
    return this.prisma.eventPayment.findMany({
      where: { eventId, ...(user.role === 'Member' ? { memberId: user.id } : {}) },
      include: {
        member: { select: { id: true, name: true, phone: true, jumuia: true } },
      },
      orderBy: { member: { name: 'asc' } },
    });
  }

  async markAsPaid(eventId: string, memberId: string, dto: MarkPaidDto) {
    await this.findOne(eventId);

    const payment = await this.prisma.eventPayment.findUnique({
      where: { eventId_memberId: { eventId, memberId } },
      include: { member: true, event: true },
    });
    if (!payment) throw new NotFoundException(`Payment record not found`);
    if (payment.status === 'PAID') throw new BadRequestException('Payment already recorded');
    if (payment.event.status !== 'ACTIVE') throw new BadRequestException('Cannot mark payment on a closed event');

    const amountPaid = dto.amount ?? payment.amountDue;
    if (amountPaid > payment.amountDue) {
      throw new BadRequestException('Amount exceeds balance due');
    }
    const status = amountPaid >= payment.amountDue ? 'PAID' : 'PENDING';

    const updated = await this.prisma.eventPayment.update({
      where: { eventId_memberId: { eventId, memberId } },
      data: { status, amountPaid, paidDate: status === 'PAID' ? new Date() : null },
    });

    if (status === 'PAID') {
      const message = `Dear {name}, your payment of KES ${amountPaid} for "${payment.event.title}" has been received. Thank you for your generosity! God bless you. — CWA St. Gabriel`;
      void this.whatsapp.sendIndividualMessages(
        [{ name: payment.member.name, phone: payment.member.phone }],
        message,
      ).then(() =>
        this.prisma.notification.create({
          data: {
            memberId: payment.member.id,
            message,
            type: 'Thank You',
            recipientCount: 1,
          },
        })
      ).catch((e) => this.logger.warn('Notification skipped', e?.message));
    }

    return updated;
  }
}
