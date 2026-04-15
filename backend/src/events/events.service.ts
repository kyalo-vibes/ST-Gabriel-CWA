import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
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
    const event = await this.prisma.contributionEvent.create({
      data: {
        ...dto,
        dueDate: new Date(dto.dueDate),
        targetJumuia: dto.targetJumuia ?? 'All',
      },
    });

    const whereClause: any = { approvalStatus: 'APPROVED', status: 'ACTIVE' };
    if (dto.targetJumuia && dto.targetJumuia !== 'All') {
      whereClause.jumuia = dto.targetJumuia;
    }
    const members = await this.prisma.member.findMany({ where: whereClause });

    if (members.length > 0) {
      await this.prisma.eventPayment.createMany({
        data: members.map((m) => ({
          eventId: event.id,
          memberId: m.id,
          amountDue: dto.amountPerMember,
          amountPaid: 0,
          status: 'PENDING',
        })),
      });

      try {
        const message = `Dear {name}, a new contribution event has been created: "${event.title}". Please contribute KES ${dto.amountPerMember} by ${new Date(dto.dueDate).toLocaleDateString('en-KE')}. God bless you. — CWA St. Gabriel`;
        await this.whatsapp.sendIndividualMessages(
          members.map((m) => ({ name: m.name, phone: m.phone })),
          message,
        );

        await this.prisma.notification.create({
          data: {
            message,
            type: 'Event Announcement',
            targetGroup: dto.targetJumuia ?? 'All',
            recipientCount: members.length,
          },
        });
      } catch {
        // WhatsApp not connected — silently skip, event still created
      }
    }

    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    return this.prisma.contributionEvent.update({ where: { id }, data });
  }

  async getPayments(eventId: string) {
    await this.findOne(eventId);
    return this.prisma.eventPayment.findMany({
      where: { eventId },
      include: {
        member: { select: { id: true, name: true, phone: true, jumuia: true } },
      },
      orderBy: { member: { name: 'asc' } },
    });
  }

  async markAsPaid(eventId: string, memberId: string) {
    await this.findOne(eventId);

    const payment = await this.prisma.eventPayment.findUnique({
      where: { eventId_memberId: { eventId, memberId } },
      include: { member: true, event: true },
    });
    if (!payment) throw new NotFoundException(`Payment record not found`);

    const updated = await this.prisma.eventPayment.update({
      where: { eventId_memberId: { eventId, memberId } },
      data: { status: 'PAID', amountPaid: payment.amountDue, paidDate: new Date() },
    });

    try {
      const message = `Dear {name}, your payment of KES ${payment.amountDue} for "${payment.event.title}" has been received. Thank you for your generosity! God bless you. — CWA St. Gabriel`;
      await this.whatsapp.sendIndividualMessages(
        [{ name: payment.member.name, phone: payment.member.phone }],
        message,
      );

      await this.prisma.notification.create({
        data: {
          memberId: payment.member.id,
          message,
          type: 'Thank You',
          recipientCount: 1,
        },
      });
    } catch {
      // WhatsApp not connected — silently skip
    }

    return updated;
  }
}
