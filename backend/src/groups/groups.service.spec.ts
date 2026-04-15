import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Shared fixture data — defined once, reused across all describe blocks.
// ---------------------------------------------------------------------------
const GROUP_FIXTURE = {
  id: '120363111111111111@g.us',
  name: 'CWA St. Gabriel',
  createdAt: new Date('2026-01-01'),
};

describe('GroupsService', () => {
  let service: GroupsService;
  let mockPrisma: {
    approvedGroup: {
      findMany: jest.Mock;
      upsert: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Arrange — fresh mock object before every test so spy call counts never bleed
    mockPrisma = {
      approvedGroup: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns groups ordered by name asc', async () => {
      // Arrange
      const groups = [
        GROUP_FIXTURE,
        { ...GROUP_FIXTURE, id: '120363222222222222@g.us', name: 'CWA Youth' },
      ];
      mockPrisma.approvedGroup.findMany.mockResolvedValue(groups);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(groups);
      expect(mockPrisma.approvedGroup.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    });

    it('returns empty array when no groups are registered', async () => {
      // Arrange
      mockPrisma.approvedGroup.findMany.mockResolvedValue([]);

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
    it('calls prisma.approvedGroup.upsert with correct where/create/update shape', async () => {
      // Arrange
      const createDto = { id: '120363111111111111@g.us', name: 'CWA St. Gabriel' };
      mockPrisma.approvedGroup.upsert.mockResolvedValue(GROUP_FIXTURE);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(GROUP_FIXTURE);
      expect(mockPrisma.approvedGroup.upsert).toHaveBeenCalledWith({
        where: { id: createDto.id },
        update: { name: createDto.name },
        create: { id: createDto.id, name: createDto.name },
      });
    });

    it('updates name when group with same id already exists (upsert semantics)', async () => {
      // Arrange
      const createDto = { id: '120363111111111111@g.us', name: 'Renamed Group' };
      const updatedGroup = { ...GROUP_FIXTURE, name: 'Renamed Group' };
      mockPrisma.approvedGroup.upsert.mockResolvedValue(updatedGroup);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result.name).toBe('Renamed Group');
      expect(mockPrisma.approvedGroup.upsert).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // remove(id)
  // -------------------------------------------------------------------------
  describe('remove(id)', () => {
    it('deletes and returns the group when found', async () => {
      // Arrange
      mockPrisma.approvedGroup.findUnique.mockResolvedValue(GROUP_FIXTURE);
      mockPrisma.approvedGroup.delete.mockResolvedValue(GROUP_FIXTURE);

      // Act
      const result = await service.remove(GROUP_FIXTURE.id);

      // Assert
      expect(result).toEqual(GROUP_FIXTURE);
      expect(mockPrisma.approvedGroup.delete).toHaveBeenCalledWith({ where: { id: GROUP_FIXTURE.id } });
    });

    it('throws NotFoundException when group not found', async () => {
      // Arrange
      mockPrisma.approvedGroup.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('nonexistent@g.us')).rejects.toThrow(
        new NotFoundException('Group nonexistent@g.us not found'),
      );
    });

    it('does NOT call prisma.approvedGroup.delete when group is not found', async () => {
      // Arrange
      mockPrisma.approvedGroup.findUnique.mockResolvedValue(null);

      // Act
      try {
        await service.remove('nonexistent@g.us');
      } catch {
        // expected NotFoundException — we only care that delete was not called
      }

      // Assert
      expect(mockPrisma.approvedGroup.delete).not.toHaveBeenCalled();
    });
  });
});
