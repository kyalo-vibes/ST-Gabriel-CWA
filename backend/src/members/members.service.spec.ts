import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Mock bcrypt at the module level so no real hashing occurs in unit tests.
// Individual tests can override bcrypt.compare via (bcrypt.compare as jest.Mock).
// ---------------------------------------------------------------------------
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Shared fixture data — defined once, reused across all describe blocks.
// ---------------------------------------------------------------------------
const MEMBER_FIXTURE = {
  id: 'member-1',
  name: 'Monicah Wambui',
  phone: '+254701234567',
  email: 'monicah@test.com',
  passwordHash: 'existing_hash',
  approvalStatus: 'PENDING',
  status: 'PENDING',
  jumuia: 'ST_PETER',
  joinDate: new Date('2024-01-01'),
};

// Enriched fixture returned by findUnique/findMany after the include was added.
// The service strips joinDate, passwordHash, contributions, eventPayments and
// computes join_date, total_contributed, and balance from these arrays.
const ENRICHED_MEMBER_FIXTURE = {
  ...MEMBER_FIXTURE,
  contributions: [{ amount: 500 }, { amount: 300 }],
  eventPayments: [
    { amountDue: 1000, amountPaid: 200 },
    { amountDue: 500, amountPaid: 0 },
  ],
};

// The shape the service returns after transforming ENRICHED_MEMBER_FIXTURE.
// join_date  = MEMBER_FIXTURE.joinDate.toISOString()  = "2024-01-01T00:00:00.000Z"
// total_contributed = 500 + 300 = 800
// balance    = (1000-200) + (500-0) = 1300
const TRANSFORMED_MEMBER = {
  id: 'member-1',
  name: 'Monicah Wambui',
  phone: '+254701234567',
  email: 'monicah@test.com',
  approvalStatus: 'PENDING',
  status: 'PENDING',
  jumuia: 'ST_PETER',
  join_date: MEMBER_FIXTURE.joinDate.toISOString(),
  total_contributed: 800,
  balance: 1300,
};

describe('MembersService', () => {
  let service: MembersService;
  let mockPrisma: {
    member: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Arrange — fresh mock object before every test so spy call counts never bleed
    mockPrisma = {
      member: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns an array of all members ordered by name', async () => {
      // Arrange
      const members = [
        ENRICHED_MEMBER_FIXTURE,
        { ...ENRICHED_MEMBER_FIXTURE, id: 'member-2', name: 'Zara Wanjiku' },
      ];
      mockPrisma.member.findMany.mockResolvedValue(members);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith({
        include: {
          contributions: { select: { amount: true } },
          eventPayments: {
            where: { status: 'PENDING', event: { status: 'ACTIVE' } },
            select: { amountDue: true, amountPaid: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('computes total_contributed as the sum of all contribution amounts', async () => {
      // Arrange
      mockPrisma.member.findMany.mockResolvedValue([ENRICHED_MEMBER_FIXTURE]);

      // Act
      const result = await service.findAll();

      // Assert — 500 + 300 = 800
      expect(result[0].total_contributed).toBe(800);
    });

    it('computes balance as sum of (amountDue - amountPaid) for PENDING event payments', async () => {
      // Arrange
      mockPrisma.member.findMany.mockResolvedValue([ENRICHED_MEMBER_FIXTURE]);

      // Act
      const result = await service.findAll();

      // Assert — (1000-200) + (500-0) = 1300
      expect(result[0].balance).toBe(1300);
    });

    it('does NOT expose passwordHash in the returned objects', async () => {
      // Arrange
      mockPrisma.member.findMany.mockResolvedValue([ENRICHED_MEMBER_FIXTURE]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0]).not.toHaveProperty('passwordHash');
    });

    it('returns join_date as an ISO string and omits joinDate', async () => {
      // Arrange
      mockPrisma.member.findMany.mockResolvedValue([ENRICHED_MEMBER_FIXTURE]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result[0].join_date).toBe(MEMBER_FIXTURE.joinDate.toISOString());
      expect(result[0]).not.toHaveProperty('joinDate');
    });

    it('returns the fully transformed shape matching TRANSFORMED_MEMBER', async () => {
      // Arrange
      mockPrisma.member.findMany.mockResolvedValue([ENRICHED_MEMBER_FIXTURE]);

      // Act
      const result = await service.findAll();

      // Assert — deep equality check on the full transformed object
      expect(result[0]).toEqual(TRANSFORMED_MEMBER);
    });
  });

  // -------------------------------------------------------------------------
  // findOne(id)
  // -------------------------------------------------------------------------
  describe('findOne(id)', () => {
    it('returns the transformed member when the id exists', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(ENRICHED_MEMBER_FIXTURE);

      // Act
      const result = await service.findOne('member-1');

      // Assert — must return the transformed shape, not the raw Prisma row
      expect(result).toEqual(TRANSFORMED_MEMBER);
      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        include: {
          contributions: { select: { amount: true } },
          eventPayments: {
            where: { status: 'PENDING', event: { status: 'ACTIVE' } },
            select: { amountDue: true, amountPaid: true },
          },
        },
      });
    });

    it('throws NotFoundException when the id does not exist', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        new NotFoundException('Member nonexistent-id not found'),
      );
    });
  });

  // -------------------------------------------------------------------------
  // create(dto)
  // -------------------------------------------------------------------------
  describe('create(dto)', () => {
    const createDto = {
      name: 'New Member',
      phone: '+254709999999',
      email: 'new@test.com',
      jumuia: 'ST_PAUL' as any,
      joinDate: '2026-01-01',
    };

    it('creates a member with a hashed default password and PENDING approval status', async () => {
      // Arrange
      mockPrisma.member.findFirst.mockResolvedValue(null); // no duplicate
      const createdMember = {
        ...MEMBER_FIXTURE,
        ...createDto,
        passwordHash: 'hashed_password',
        approvalStatus: 'PENDING',
        status: 'PENDING',
        joinDate: new Date(createDto.joinDate),
      };
      mockPrisma.member.create.mockResolvedValue(createdMember);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('CWA2026', 10);
      expect(mockPrisma.member.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          joinDate: new Date(createDto.joinDate),
          passwordHash: 'hashed_password',
          approvalStatus: 'PENDING',
          status: 'PENDING',
        },
      });
      expect(result.approvalStatus).toBe('PENDING');
    });

    it('throws BadRequestException when phone or email already exists', async () => {
      // Arrange — prisma finds an existing record with the same phone/email
      mockPrisma.member.findFirst.mockResolvedValue(MEMBER_FIXTURE);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Phone or email already registered'),
      );
      expect(mockPrisma.member.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // update(id, dto)
  // -------------------------------------------------------------------------
  describe('update(id, dto)', () => {
    it('updates and returns the member when found', async () => {
      // Arrange
      const updateDto = { name: 'Updated Name' };
      const updatedMember = { ...MEMBER_FIXTURE, name: 'Updated Name' };
      // findOne now uses include — mock must return enriched fixture to satisfy the transform
      mockPrisma.member.findUnique.mockResolvedValue(ENRICHED_MEMBER_FIXTURE);
      mockPrisma.member.update.mockResolvedValue(updatedMember);

      // Act
      const result = await service.update('member-1', updateDto);

      // Assert
      expect(result).toEqual(updatedMember);
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: updateDto,
      });
    });

    it('throws NotFoundException when the member does not exist', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('bad-id', { name: 'X' })).rejects.toThrow(
        new NotFoundException('Member bad-id not found'),
      );
      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // remove(id)
  // -------------------------------------------------------------------------
  describe('remove(id)', () => {
    it('deletes and returns the member when found', async () => {
      // Arrange
      // findOne now uses include — mock must return enriched fixture to satisfy the transform
      mockPrisma.member.findUnique.mockResolvedValue(ENRICHED_MEMBER_FIXTURE);
      mockPrisma.member.delete.mockResolvedValue(MEMBER_FIXTURE);

      // Act
      const result = await service.remove('member-1');

      // Assert
      expect(result).toEqual(MEMBER_FIXTURE);
      expect(mockPrisma.member.delete).toHaveBeenCalledWith({ where: { id: 'member-1' } });
    });

    it('throws NotFoundException when the member does not exist', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('bad-id')).rejects.toThrow(
        new NotFoundException('Member bad-id not found'),
      );
      expect(mockPrisma.member.delete).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // approve(id)
  // -------------------------------------------------------------------------
  describe('approve(id)', () => {
    it('sets approvalStatus to APPROVED and status to ACTIVE when member found', async () => {
      // Arrange
      const approvedMember = { ...MEMBER_FIXTURE, approvalStatus: 'APPROVED', status: 'ACTIVE' };
      // findOne now uses include — mock must return enriched fixture to satisfy the transform
      mockPrisma.member.findUnique.mockResolvedValue(ENRICHED_MEMBER_FIXTURE);
      mockPrisma.member.update.mockResolvedValue(approvedMember);

      // Act
      const result = await service.approve('member-1');

      // Assert
      expect(result.approvalStatus).toBe('APPROVED');
      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { approvalStatus: 'APPROVED', status: 'ACTIVE' },
      });
    });

    it('throws NotFoundException when the member does not exist', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.approve('bad-id')).rejects.toThrow(
        new NotFoundException('Member bad-id not found'),
      );
      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // resetPassword(id)
  // -------------------------------------------------------------------------
  describe('resetPassword(id)', () => {
    it('updates the passwordHash to the default password hash when member found', async () => {
      // Arrange
      const updatedMember = { ...MEMBER_FIXTURE, passwordHash: 'hashed_password' };
      // findOne now uses include — mock must return enriched fixture to satisfy the transform
      mockPrisma.member.findUnique.mockResolvedValue(ENRICHED_MEMBER_FIXTURE);
      mockPrisma.member.update.mockResolvedValue(updatedMember);

      // Act
      const result = await service.resetPassword('member-1');

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('CWA2026', 10);
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { passwordHash: 'hashed_password' },
      });
      expect(result.passwordHash).toBe('hashed_password');
    });

    it('throws NotFoundException when the member does not exist', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword('bad-id')).rejects.toThrow(
        new NotFoundException('Member bad-id not found'),
      );
      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // changePassword(id, dto)
  // -------------------------------------------------------------------------
  describe('changePassword(id, dto)', () => {
    const changePasswordDto = {
      currentPassword: 'OldPass@123',
      newPassword: 'NewPass@456',
    };

    it('updates password when currentPassword matches the stored hash', async () => {
      // Arrange
      // changePassword calls prisma.member.findUnique DIRECTLY (not this.findOne),
      // so the mock can return the plain MEMBER_FIXTURE — no include needed.
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const updatedMember = { ...MEMBER_FIXTURE, passwordHash: 'hashed_password' };
      mockPrisma.member.update.mockResolvedValue(updatedMember);

      // Act
      const result = await service.changePassword('member-1', changePasswordDto);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        MEMBER_FIXTURE.passwordHash,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      expect(mockPrisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: { passwordHash: 'hashed_password' },
      });
      expect(result.passwordHash).toBe('hashed_password');
    });

    it('throws UnauthorizedException when currentPassword does not match', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.changePassword('member-1', changePasswordDto),
      ).rejects.toThrow(new UnauthorizedException('Current password is incorrect'));
      expect(mockPrisma.member.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the member does not exist', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.changePassword('bad-id', changePasswordDto),
      ).rejects.toThrow(new NotFoundException('Member bad-id not found'));
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });
});
