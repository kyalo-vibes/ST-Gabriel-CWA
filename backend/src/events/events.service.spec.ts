import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

// ---------------------------------------------------------------------------
// Mock the WhatsApp module before Jest traverses it — Baileys uses ESM syntax
// which ts-jest cannot parse. The mock intercepts at the module boundary so
// the Baileys import chain is never evaluated.
// ---------------------------------------------------------------------------
jest.mock('../whatsapp/whatsapp.service');

// ---------------------------------------------------------------------------
// Shared fixture data — defined once, reused across all describe blocks.
// ---------------------------------------------------------------------------
const EVENT_FIXTURE = {
  id: 'event-1',
  title: 'Easter Fundraiser',
  type: 'HARAMBEE',
  amountPerMember: 1000,
  dueDate: new Date('2026-05-01'),
  targetJumuia: 'All',
  status: 'ACTIVE',
  description: 'Easter fundraiser for the church',
  createdAt: new Date('2026-04-01'),
  updatedAt: new Date('2026-04-01'),
};

const MEMBER_FIXTURE = {
  id: 'member-1',
  name: 'Monicah Wambui',
  phone: '+254701234567',
  email: 'monicah@test.com',
  approvalStatus: 'APPROVED',
  status: 'ACTIVE',
  jumuia: 'ST_PETER',
};

const PAYMENT_FIXTURE = {
  id: 'payment-1',
  eventId: 'event-1',
  memberId: 'member-1',
  amountDue: 1000,
  amountPaid: 0,
  status: 'PENDING',
  paidDate: null,
  member: MEMBER_FIXTURE,
  event: EVENT_FIXTURE,
};

describe('EventsService', () => {
  let service: EventsService;
  let mockPrisma: {
    contributionEvent: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    eventPayment: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      createMany: jest.Mock;
      update: jest.Mock;
    };
    member: { findMany: jest.Mock };
    notification: { create: jest.Mock };
  };
  let mockWhatsapp: { sendIndividualMessages: jest.Mock };

  beforeEach(async () => {
    // Arrange — fresh mocks before each test to prevent call-count bleed
    mockPrisma = {
      contributionEvent: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      eventPayment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
      },
      member: { findMany: jest.fn() },
      notification: { create: jest.fn() },
    };

    mockWhatsapp = {
      sendIndividualMessages: jest.fn().mockResolvedValue({ sent: 1, failed: 0, details: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WhatsAppService, useValue: mockWhatsapp },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns all events with payment counts ordered by createdAt desc', async () => {
      // Arrange
      const events = [EVENT_FIXTURE, { ...EVENT_FIXTURE, id: 'event-2', title: 'Wedding Fund' }];
      mockPrisma.contributionEvent.findMany.mockResolvedValue(events);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(events);
      expect(mockPrisma.contributionEvent.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { payments: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  // -------------------------------------------------------------------------
  // findOne(id)
  // -------------------------------------------------------------------------
  describe('findOne(id)', () => {
    it('returns event with payments when found', async () => {
      // Arrange
      const eventWithPayments = { ...EVENT_FIXTURE, payments: [PAYMENT_FIXTURE] };
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(eventWithPayments);

      // Act
      const result = await service.findOne('event-1');

      // Assert
      expect(result).toEqual(eventWithPayments);
      expect(mockPrisma.contributionEvent.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        include: {
          payments: {
            include: {
              member: { select: { id: true, name: true, phone: true, jumuia: true } },
            },
          },
        },
      });
    });

    it('throws NotFoundException when event not found', async () => {
      // Arrange
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        new NotFoundException('Event nonexistent-id not found'),
      );
    });
  });

  // -------------------------------------------------------------------------
  // create(dto)
  // -------------------------------------------------------------------------
  describe('create(dto)', () => {
    const createDto = {
      title: 'Easter Fundraiser',
      type: 'HARAMBEE' as any,
      amountPerMember: 1000,
      dueDate: '2026-05-01',
      targetJumuia: 'All',
      description: 'Easter fundraiser',
    };

    it('creates event and EventPayment records for each targeted member', async () => {
      // Arrange
      const members = [MEMBER_FIXTURE, { ...MEMBER_FIXTURE, id: 'member-2', name: 'Mary Wanjiru', phone: '+254702345678' }];
      mockPrisma.contributionEvent.create.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.member.findMany.mockResolvedValue(members);
      mockPrisma.eventPayment.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(EVENT_FIXTURE);
      expect(mockPrisma.eventPayment.createMany).toHaveBeenCalledWith({
        data: [
          { eventId: 'event-1', memberId: 'member-1', amountDue: 1000, amountPaid: 0, status: 'PENDING' },
          { eventId: 'event-1', memberId: 'member-2', amountDue: 1000, amountPaid: 0, status: 'PENDING' },
        ],
      });
    });

    it('calls whatsapp.sendIndividualMessages with announcement message', async () => {
      // Arrange
      mockPrisma.contributionEvent.create.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.member.findMany.mockResolvedValue([MEMBER_FIXTURE]);
      mockPrisma.eventPayment.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.create(createDto);

      // Assert
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledWith(
        [{ name: MEMBER_FIXTURE.name, phone: MEMBER_FIXTURE.phone }],
        expect.stringContaining('Easter Fundraiser'),
      );
    });

    it('logs a notification record after successful WhatsApp send', async () => {
      // Arrange
      mockPrisma.contributionEvent.create.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.member.findMany.mockResolvedValue([MEMBER_FIXTURE]);
      mockPrisma.eventPayment.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.create(createDto);

      // Assert
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'Event Announcement',
          recipientCount: 1,
        }),
      });
    });

    it('passes jumuia filter to member.findMany when targetJumuia is not "All"', async () => {
      // Arrange
      const dtoWithJumuia = { ...createDto, targetJumuia: 'ST_PETER' };
      mockPrisma.contributionEvent.create.mockResolvedValue({ ...EVENT_FIXTURE, targetJumuia: 'ST_PETER' });
      mockPrisma.member.findMany.mockResolvedValue([MEMBER_FIXTURE]);
      mockPrisma.eventPayment.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.create(dtoWithJumuia);

      // Assert
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith({
        where: { approvalStatus: 'APPROVED', status: 'ACTIVE', jumuia: 'ST_PETER' },
      });
    });

    it('still returns the event when WhatsApp throws (best-effort)', async () => {
      // Arrange
      mockPrisma.contributionEvent.create.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.member.findMany.mockResolvedValue([MEMBER_FIXTURE]);
      mockPrisma.eventPayment.createMany.mockResolvedValue({ count: 1 });
      mockWhatsapp.sendIndividualMessages.mockRejectedValue(new Error('WhatsApp not connected'));

      // Act
      const result = await service.create(createDto);

      // Assert — event is returned despite WhatsApp failure
      expect(result).toEqual(EVENT_FIXTURE);
    });

    it('skips payment creation and WhatsApp send when no members found', async () => {
      // Arrange
      mockPrisma.contributionEvent.create.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.member.findMany.mockResolvedValue([]);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(EVENT_FIXTURE);
      expect(mockPrisma.eventPayment.createMany).not.toHaveBeenCalled();
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // update(id, dto)
  // -------------------------------------------------------------------------
  describe('update(id, dto)', () => {
    it('updates and returns the event when found', async () => {
      // Arrange
      const updateDto = { title: 'Updated Title' };
      const updatedEvent = { ...EVENT_FIXTURE, title: 'Updated Title' };
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.contributionEvent.update.mockResolvedValue(updatedEvent);

      // Act
      const result = await service.update('event-1', updateDto);

      // Assert
      expect(result).toEqual(updatedEvent);
      expect(mockPrisma.contributionEvent.update).toHaveBeenCalledWith({
        where: { id: 'event-1' },
        data: updateDto,
      });
    });

    it('throws NotFoundException when event not found', async () => {
      // Arrange
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('bad-id', { title: 'X' })).rejects.toThrow(
        new NotFoundException('Event bad-id not found'),
      );
      expect(mockPrisma.contributionEvent.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // getPayments(eventId)
  // -------------------------------------------------------------------------
  describe('getPayments(eventId)', () => {
    it('returns payments with member info when event exists', async () => {
      // Arrange
      const payments = [PAYMENT_FIXTURE];
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.eventPayment.findMany.mockResolvedValue(payments);

      // Act
      const result = await service.getPayments('event-1');

      // Assert
      expect(result).toEqual(payments);
      expect(mockPrisma.eventPayment.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-1' },
        include: {
          member: { select: { id: true, name: true, phone: true, jumuia: true } },
        },
        orderBy: { member: { name: 'asc' } },
      });
    });

    it('throws NotFoundException when event not found', async () => {
      // Arrange
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getPayments('bad-event-id')).rejects.toThrow(
        new NotFoundException('Event bad-event-id not found'),
      );
      expect(mockPrisma.eventPayment.findMany).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // markAsPaid(eventId, memberId)
  // -------------------------------------------------------------------------
  describe('markAsPaid(eventId, memberId)', () => {
    it('updates payment to PAID with amountPaid and paidDate set', async () => {
      // Arrange
      const updatedPayment = { ...PAYMENT_FIXTURE, status: 'PAID', amountPaid: 1000, paidDate: new Date() };
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.eventPayment.findUnique.mockResolvedValue(PAYMENT_FIXTURE);
      mockPrisma.eventPayment.update.mockResolvedValue(updatedPayment);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      const result = await service.markAsPaid('event-1', 'member-1');

      // Assert
      expect(result.status).toBe('PAID');
      expect(result.amountPaid).toBe(1000);
      expect(mockPrisma.eventPayment.update).toHaveBeenCalledWith({
        where: { eventId_memberId: { eventId: 'event-1', memberId: 'member-1' } },
        data: expect.objectContaining({ status: 'PAID', amountPaid: 1000 }),
      });
    });

    it('calls whatsapp.sendIndividualMessages with thank-you message', async () => {
      // Arrange
      const updatedPayment = { ...PAYMENT_FIXTURE, status: 'PAID', amountPaid: 1000, paidDate: new Date() };
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.eventPayment.findUnique.mockResolvedValue(PAYMENT_FIXTURE);
      mockPrisma.eventPayment.update.mockResolvedValue(updatedPayment);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.markAsPaid('event-1', 'member-1');

      // Assert
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledWith(
        [{ name: MEMBER_FIXTURE.name, phone: MEMBER_FIXTURE.phone }],
        expect.stringContaining('Easter Fundraiser'),
      );
    });

    it('logs a notification record after marking as paid', async () => {
      // Arrange
      const updatedPayment = { ...PAYMENT_FIXTURE, status: 'PAID', amountPaid: 1000, paidDate: new Date() };
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.eventPayment.findUnique.mockResolvedValue(PAYMENT_FIXTURE);
      mockPrisma.eventPayment.update.mockResolvedValue(updatedPayment);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.markAsPaid('event-1', 'member-1');

      // Assert
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: 'member-1',
          type: 'Thank You',
          recipientCount: 1,
        }),
      });
    });

    it('throws NotFoundException when payment record not found', async () => {
      // Arrange
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.eventPayment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.markAsPaid('event-1', 'bad-member')).rejects.toThrow(
        new NotFoundException('Payment record not found'),
      );
      expect(mockPrisma.eventPayment.update).not.toHaveBeenCalled();
    });

    it('still returns updated payment when WhatsApp throws (best-effort)', async () => {
      // Arrange
      const updatedPayment = { ...PAYMENT_FIXTURE, status: 'PAID', amountPaid: 1000, paidDate: new Date() };
      mockPrisma.contributionEvent.findUnique.mockResolvedValue(EVENT_FIXTURE);
      mockPrisma.eventPayment.findUnique.mockResolvedValue(PAYMENT_FIXTURE);
      mockPrisma.eventPayment.update.mockResolvedValue(updatedPayment);
      mockWhatsapp.sendIndividualMessages.mockRejectedValue(new Error('WhatsApp not connected'));

      // Act
      const result = await service.markAsPaid('event-1', 'member-1');

      // Assert — updated payment is returned despite WhatsApp failure
      expect(result.status).toBe('PAID');
    });
  });
});
