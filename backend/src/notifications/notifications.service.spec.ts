import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Shared fixture data — defined once, reused across all describe blocks.
// ---------------------------------------------------------------------------
const NOTIFICATION_FIXTURE = {
  id: 'notif-1',
  memberId: 'member-1',
  message: 'Dear Monicah, your contribution is due.',
  type: 'Payment Reminder',
  status: 'Sent',
  targetGroup: 'All',
  contributionType: null,
  recipientCount: 1,
  sentAt: new Date('2026-04-01'),
  member: { name: 'Monicah Wambui' },
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockPrisma: {
    notification: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Arrange — fresh mock object before every test so spy call counts never bleed
    mockPrisma = {
      notification: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns notifications ordered by sentAt desc with member name included', async () => {
      // Arrange
      const notifications = [
        NOTIFICATION_FIXTURE,
        { ...NOTIFICATION_FIXTURE, id: 'notif-2', sentAt: new Date('2026-03-01') },
      ];
      mockPrisma.notification.findMany.mockResolvedValue(notifications);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(notifications);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        orderBy: { sentAt: 'desc' },
        include: { member: { select: { name: true } } },
      });
    });

    it('returns empty array when no notifications exist', async () => {
      // Arrange
      mockPrisma.notification.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // create(dto)
  // -------------------------------------------------------------------------
  describe('create(dto)', () => {
    it('creates and returns the notification record', async () => {
      // Arrange
      const createDto = {
        memberId: 'member-1',
        message: 'Dear Monicah, your contribution is due.',
        type: 'Payment Reminder',
        targetGroup: 'All',
        recipientCount: 1,
      };
      mockPrisma.notification.create.mockResolvedValue(NOTIFICATION_FIXTURE);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(NOTIFICATION_FIXTURE);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('creates a bulk notification without a memberId', async () => {
      // Arrange
      const bulkDto = {
        message: 'Group announcement.',
        type: 'Event Announcement',
        targetGroup: 'ST_PETER',
        recipientCount: 15,
      };
      const bulkNotification = { ...NOTIFICATION_FIXTURE, id: 'notif-bulk', memberId: null, member: null };
      mockPrisma.notification.create.mockResolvedValue(bulkNotification);

      // Act
      const result = await service.create(bulkDto);

      // Assert
      expect(result).toEqual(bulkNotification);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({ data: bulkDto });
    });
  });
});
