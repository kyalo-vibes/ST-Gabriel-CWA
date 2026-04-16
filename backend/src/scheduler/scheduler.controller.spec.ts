import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerController } from './scheduler.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('SchedulerController', () => {
  let controller: SchedulerController;
  let mockPrisma: {
    scheduleConfig: {
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Arrange — fresh mock objects before every test so call counts never bleed
    mockPrisma = {
      scheduleConfig: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulerController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SchedulerController>(SchedulerController);
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns all schedule configs ordered by id', async () => {
      // Arrange
      const configs = [
        { id: 'monthly', label: 'Monthly Reminder', hour: 8, enabled: true },
        { id: 'overdue', label: 'Overdue Reminder', hour: 9, enabled: true },
      ];
      mockPrisma.scheduleConfig.findMany.mockResolvedValue(configs);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(configs);
      expect(mockPrisma.scheduleConfig.findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' } });
    });

    it('returns an empty array when no configs exist', async () => {
      // Arrange
      mockPrisma.scheduleConfig.findMany.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // update(id, dto)
  // -------------------------------------------------------------------------
  describe('update(id, dto)', () => {
    it('updates and returns the updated config', async () => {
      // Arrange
      const updated = { id: 'monthly', label: 'Monthly Reminder', hour: 9, enabled: true };
      mockPrisma.scheduleConfig.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update('monthly', { hour: 9 });

      // Assert
      expect(result).toEqual(updated);
      expect(mockPrisma.scheduleConfig.update).toHaveBeenCalledWith({
        where: { id: 'monthly' },
        data: { hour: 9 },
      });
    });

    it('can disable a config by setting enabled to false', async () => {
      // Arrange
      const updated = { id: 'overdue', label: 'Overdue Reminder', hour: 9, enabled: false };
      mockPrisma.scheduleConfig.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update('overdue', { enabled: false });

      // Assert
      expect(result.enabled).toBe(false);
      expect(mockPrisma.scheduleConfig.update).toHaveBeenCalledWith({
        where: { id: 'overdue' },
        data: { enabled: false },
      });
    });

    it('can update both hour and enabled in a single call', async () => {
      // Arrange
      const updated = { id: 'dueSoon', label: 'Due Soon Reminder', hour: 7, enabled: true };
      mockPrisma.scheduleConfig.update.mockResolvedValue(updated);

      // Act
      const result = await controller.update('dueSoon', { hour: 7, enabled: true });

      // Assert
      expect(result).toEqual(updated);
      expect(mockPrisma.scheduleConfig.update).toHaveBeenCalledWith({
        where: { id: 'dueSoon' },
        data: { hour: 7, enabled: true },
      });
    });
  });
});
