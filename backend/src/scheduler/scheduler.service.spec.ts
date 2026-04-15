import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerService } from './scheduler.service';
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
const MEMBER_FIXTURE = {
  id: 'member-1',
  name: 'Monicah Wambui',
  phone: '+254701234567',
  email: 'monicah@test.com',
  approvalStatus: 'APPROVED',
  status: 'ACTIVE',
  jumuia: 'ST_PETER',
};

const SECOND_MEMBER_FIXTURE = {
  id: 'member-2',
  name: 'Mary Wanjiru',
  phone: '+254702345678',
  email: 'mary@test.com',
  approvalStatus: 'APPROVED',
  status: 'ACTIVE',
  jumuia: 'ST_PAUL',
};

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

describe('SchedulerService', () => {
  let service: SchedulerService;
  let mockPrisma: {
    member: { findMany: jest.Mock };
    contributionEvent: { findMany: jest.Mock };
    eventPayment: { findMany: jest.Mock };
    notification: { create: jest.Mock };
  };
  let mockWhatsapp: { sendIndividualMessages: jest.Mock };
  let mockConfig: { get: jest.Mock };

  beforeEach(async () => {
    // Arrange — fresh mock objects before every test so spy call counts never bleed
    mockPrisma = {
      member: { findMany: jest.fn() },
      contributionEvent: { findMany: jest.fn() },
      eventPayment: { findMany: jest.fn() },
      notification: { create: jest.fn() },
    };

    mockWhatsapp = {
      sendIndividualMessages: jest.fn().mockResolvedValue({ sent: 1, failed: 0, details: [] }),
    };

    mockConfig = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WhatsAppService, useValue: mockWhatsapp },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // sendMonthlyReminders()
  // -------------------------------------------------------------------------
  describe('sendMonthlyReminders()', () => {
    it('sends WhatsApp to all APPROVED+ACTIVE members', async () => {
      // Arrange
      const members = [MEMBER_FIXTURE, SECOND_MEMBER_FIXTURE];
      mockPrisma.member.findMany.mockResolvedValue(members);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendMonthlyReminders();

      // Assert
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith({
        where: { approvalStatus: 'APPROVED', status: 'ACTIVE' },
      });
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledWith(
        [
          { name: MEMBER_FIXTURE.name, phone: MEMBER_FIXTURE.phone },
          { name: SECOND_MEMBER_FIXTURE.name, phone: SECOND_MEMBER_FIXTURE.phone },
        ],
        expect.stringContaining('monthly contribution reminder'),
      );
    });

    it('logs one notification record with type "Payment Reminder" and correct recipientCount', async () => {
      // Arrange
      const members = [MEMBER_FIXTURE, SECOND_MEMBER_FIXTURE];
      mockPrisma.member.findMany.mockResolvedValue(members);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendMonthlyReminders();

      // Assert
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'Payment Reminder',
          targetGroup: 'All',
          recipientCount: 2,
        }),
      });
    });

    it('does nothing when member list is empty', async () => {
      // Arrange
      mockPrisma.member.findMany.mockResolvedValue([]);

      // Act
      await service.sendMonthlyReminders();

      // Assert
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('catches the error and does not rethrow when WhatsApp throws', async () => {
      // Arrange
      mockPrisma.member.findMany.mockResolvedValue([MEMBER_FIXTURE]);
      mockWhatsapp.sendIndividualMessages.mockRejectedValue(new Error('WhatsApp not connected'));

      // Act & Assert — must resolve, not reject
      await expect(service.sendMonthlyReminders()).resolves.toBeUndefined();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // sendDueSoonReminders()
  // -------------------------------------------------------------------------
  describe('sendDueSoonReminders()', () => {
    it('sends reminders only to members with PENDING payments for events due in ~3 days', async () => {
      // Arrange
      const dueSoonEvent = { ...EVENT_FIXTURE, id: 'event-due-soon', title: 'Harvest Fundraiser' };
      const pendingPayment = { ...PAYMENT_FIXTURE, eventId: 'event-due-soon', event: dueSoonEvent };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([dueSoonEvent]);
      mockPrisma.eventPayment.findMany.mockResolvedValue([pendingPayment]);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendDueSoonReminders();

      // Assert
      expect(mockPrisma.eventPayment.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-due-soon', status: 'PENDING' },
        include: { member: true },
      });
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledWith(
        [{ name: MEMBER_FIXTURE.name, phone: MEMBER_FIXTURE.phone }],
        expect.stringContaining('Harvest Fundraiser'),
      );
    });

    it('logs one notification per event processed', async () => {
      // Arrange
      const eventA = { ...EVENT_FIXTURE, id: 'event-a', title: 'Event A', targetJumuia: 'All' };
      const eventB = { ...EVENT_FIXTURE, id: 'event-b', title: 'Event B', targetJumuia: 'ST_PETER' };
      const paymentA = { ...PAYMENT_FIXTURE, eventId: 'event-a', event: eventA };
      const paymentB = {
        ...PAYMENT_FIXTURE,
        id: 'payment-2',
        eventId: 'event-b',
        memberId: 'member-2',
        member: SECOND_MEMBER_FIXTURE,
        event: eventB,
      };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([eventA, eventB]);
      mockPrisma.eventPayment.findMany
        .mockResolvedValueOnce([paymentA])
        .mockResolvedValueOnce([paymentB]);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendDueSoonReminders();

      // Assert — one notification logged per event
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
    });

    it('skips an event entirely when it has no pending payments', async () => {
      // Arrange
      const event = { ...EVENT_FIXTURE, id: 'event-no-pending' };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([event]);
      mockPrisma.eventPayment.findMany.mockResolvedValue([]); // no pending payments

      // Act
      await service.sendDueSoonReminders();

      // Assert
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('does nothing when no events are due in 3 days', async () => {
      // Arrange
      mockPrisma.contributionEvent.findMany.mockResolvedValue([]);

      // Act
      await service.sendDueSoonReminders();

      // Assert
      expect(mockPrisma.eventPayment.findMany).not.toHaveBeenCalled();
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
    });

    it('catches the error and continues processing remaining events when WhatsApp throws for one event', async () => {
      // Arrange
      const eventA = { ...EVENT_FIXTURE, id: 'event-a', title: 'Event A', targetJumuia: 'All' };
      const eventB = { ...EVENT_FIXTURE, id: 'event-b', title: 'Event B', targetJumuia: 'All' };
      const paymentA = { ...PAYMENT_FIXTURE, eventId: 'event-a', event: eventA };
      const paymentB = {
        ...PAYMENT_FIXTURE,
        id: 'payment-2',
        eventId: 'event-b',
        memberId: 'member-2',
        member: SECOND_MEMBER_FIXTURE,
        event: eventB,
      };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([eventA, eventB]);
      mockPrisma.eventPayment.findMany
        .mockResolvedValueOnce([paymentA])
        .mockResolvedValueOnce([paymentB]);
      // WhatsApp fails on the first call, succeeds on the second
      mockWhatsapp.sendIndividualMessages
        .mockRejectedValueOnce(new Error('WhatsApp not connected'))
        .mockResolvedValueOnce({ sent: 1, failed: 0, details: [] });
      mockPrisma.notification.create.mockResolvedValue({});

      // Act & Assert — must resolve despite first event failure
      await expect(service.sendDueSoonReminders()).resolves.toBeUndefined();
      // Second event's WhatsApp send still happened
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledTimes(2);
    });
  });

  // -------------------------------------------------------------------------
  // sendOverdueReminders()
  // -------------------------------------------------------------------------
  describe('sendOverdueReminders()', () => {
    it('sends reminders to members with PENDING payments on ACTIVE events past their due date', async () => {
      // Arrange
      const overdueEvent = {
        ...EVENT_FIXTURE,
        id: 'event-overdue',
        title: 'Overdue Event',
        dueDate: new Date('2026-01-01'), // past date
      };
      const pendingPayment = { ...PAYMENT_FIXTURE, eventId: 'event-overdue', event: overdueEvent };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([overdueEvent]);
      mockPrisma.eventPayment.findMany.mockResolvedValue([pendingPayment]);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendOverdueReminders();

      // Assert
      expect(mockPrisma.eventPayment.findMany).toHaveBeenCalledWith({
        where: { eventId: 'event-overdue', status: 'PENDING' },
        include: { member: true },
      });
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledWith(
        [{ name: MEMBER_FIXTURE.name, phone: MEMBER_FIXTURE.phone }],
        expect.stringContaining('Overdue Event'),
      );
    });

    it('logs one notification per event processed with type "Payment Reminder"', async () => {
      // Arrange
      const overdueEvent = {
        ...EVENT_FIXTURE,
        id: 'event-overdue',
        dueDate: new Date('2026-01-01'),
        targetJumuia: 'All',
      };
      const pendingPayment = { ...PAYMENT_FIXTURE, eventId: 'event-overdue', event: overdueEvent };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([overdueEvent]);
      mockPrisma.eventPayment.findMany.mockResolvedValue([pendingPayment]);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendOverdueReminders();

      // Assert
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'Payment Reminder',
          recipientCount: 1,
        }),
      });
    });

    it('skips events with no pending payments', async () => {
      // Arrange
      const overdueEvent = { ...EVENT_FIXTURE, id: 'event-overdue', dueDate: new Date('2026-01-01') };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([overdueEvent]);
      mockPrisma.eventPayment.findMany.mockResolvedValue([]); // all paid

      // Act
      await service.sendOverdueReminders();

      // Assert
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('does nothing when no overdue events exist', async () => {
      // Arrange
      mockPrisma.contributionEvent.findMany.mockResolvedValue([]);

      // Act
      await service.sendOverdueReminders();

      // Assert
      expect(mockPrisma.eventPayment.findMany).not.toHaveBeenCalled();
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
    });

    it('catches the error and continues processing remaining events when WhatsApp throws', async () => {
      // Arrange
      const eventA = {
        ...EVENT_FIXTURE,
        id: 'event-a',
        title: 'Event A',
        dueDate: new Date('2026-01-01'),
        targetJumuia: 'All',
      };
      const eventB = {
        ...EVENT_FIXTURE,
        id: 'event-b',
        title: 'Event B',
        dueDate: new Date('2026-01-15'),
        targetJumuia: 'All',
      };
      const paymentA = { ...PAYMENT_FIXTURE, eventId: 'event-a', event: eventA };
      const paymentB = {
        ...PAYMENT_FIXTURE,
        id: 'payment-2',
        eventId: 'event-b',
        memberId: 'member-2',
        member: SECOND_MEMBER_FIXTURE,
        event: eventB,
      };
      mockPrisma.contributionEvent.findMany.mockResolvedValue([eventA, eventB]);
      mockPrisma.eventPayment.findMany
        .mockResolvedValueOnce([paymentA])
        .mockResolvedValueOnce([paymentB]);
      mockWhatsapp.sendIndividualMessages
        .mockRejectedValueOnce(new Error('WhatsApp not connected'))
        .mockResolvedValueOnce({ sent: 1, failed: 0, details: [] });
      mockPrisma.notification.create.mockResolvedValue({});

      // Act & Assert — must resolve despite first event failure
      await expect(service.sendOverdueReminders()).resolves.toBeUndefined();
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledTimes(2);
    });
  });

  // -------------------------------------------------------------------------
  // sendWeeklyDigest()
  // -------------------------------------------------------------------------
  describe('sendWeeklyDigest()', () => {
    it('sends digest message to ADMIN_PHONE when outstanding payments exist', async () => {
      // Arrange
      mockConfig.get.mockReturnValue('+254700000000');
      const outstanding = [
        { ...PAYMENT_FIXTURE, memberId: 'member-1', amountDue: 1000, amountPaid: 0, event: { title: 'Easter Fundraiser' } },
        { ...PAYMENT_FIXTURE, id: 'payment-2', memberId: 'member-2', amountDue: 500, amountPaid: 0, event: { title: 'Easter Fundraiser' } },
      ];
      mockPrisma.eventPayment.findMany.mockResolvedValue(outstanding);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendWeeklyDigest();

      // Assert
      expect(mockWhatsapp.sendIndividualMessages).toHaveBeenCalledWith(
        [{ name: 'Admin', phone: '+254700000000' }],
        expect.stringContaining('CWA Admin Report'),
      );
    });

    it('message contains member count, total owed, and event names', async () => {
      // Arrange
      mockConfig.get.mockReturnValue('+254700000000');
      const outstanding = [
        { ...PAYMENT_FIXTURE, memberId: 'member-1', amountDue: 1000, amountPaid: 200, event: { title: 'Easter Fundraiser' } },
        { ...PAYMENT_FIXTURE, id: 'payment-2', memberId: 'member-2', amountDue: 500, amountPaid: 0, event: { title: 'Wedding Fund' } },
      ];
      mockPrisma.eventPayment.findMany.mockResolvedValue(outstanding);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendWeeklyDigest();

      // Assert — message must contain the computed summary details
      const sentMessage = mockWhatsapp.sendIndividualMessages.mock.calls[0][1] as string;
      expect(sentMessage).toContain('2 members');      // uniqueMembers = 2
      expect(sentMessage).toContain('1,300');           // totalOwed = (1000-200) + (500-0) = 1300
      expect(sentMessage).toContain('Easter Fundraiser');
      expect(sentMessage).toContain('Wedding Fund');
    });

    it('logs one notification record with type "General Update"', async () => {
      // Arrange
      mockConfig.get.mockReturnValue('+254700000000');
      const outstanding = [
        { ...PAYMENT_FIXTURE, memberId: 'member-1', amountDue: 1000, amountPaid: 0, event: { title: 'Easter Fundraiser' } },
      ];
      mockPrisma.eventPayment.findMany.mockResolvedValue(outstanding);
      mockPrisma.notification.create.mockResolvedValue({});

      // Act
      await service.sendWeeklyDigest();

      // Assert
      expect(mockPrisma.notification.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'General Update',
          targetGroup: 'Admin',
          recipientCount: 1,
        }),
      });
    });

    it('skips send when there are no outstanding payments', async () => {
      // Arrange
      mockConfig.get.mockReturnValue('+254700000000');
      mockPrisma.eventPayment.findMany.mockResolvedValue([]);

      // Act
      await service.sendWeeklyDigest();

      // Assert
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('skips send and does not call prisma when ADMIN_PHONE is not configured', async () => {
      // Arrange — config returns undefined for ADMIN_PHONE
      mockConfig.get.mockReturnValue(undefined);

      // Act
      await service.sendWeeklyDigest();

      // Assert
      expect(mockPrisma.eventPayment.findMany).not.toHaveBeenCalled();
      expect(mockWhatsapp.sendIndividualMessages).not.toHaveBeenCalled();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });

    it('catches the error and does not rethrow when WhatsApp throws', async () => {
      // Arrange
      mockConfig.get.mockReturnValue('+254700000000');
      const outstanding = [
        { ...PAYMENT_FIXTURE, memberId: 'member-1', amountDue: 1000, amountPaid: 0, event: { title: 'Easter Fundraiser' } },
      ];
      mockPrisma.eventPayment.findMany.mockResolvedValue(outstanding);
      mockWhatsapp.sendIndividualMessages.mockRejectedValue(new Error('WhatsApp not connected'));

      // Act & Assert — must resolve, not reject
      await expect(service.sendWeeklyDigest()).resolves.toBeUndefined();
      expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
  });
});
