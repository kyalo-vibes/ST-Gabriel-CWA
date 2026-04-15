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
      const members = [MEMBER_FIXTURE, { ...MEMBER_FIXTURE, id: 'member-2', name: 'Zara Wanjiku' }];
      mockPrisma.member.findMany.mockResolvedValue(members);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(members);
      expect(mockPrisma.member.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    });
  });

  // -------------------------------------------------------------------------
  // findOne(id)
  // -------------------------------------------------------------------------
  describe('findOne(id)', () => {
    it('returns the member when the id exists', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE);

      // Act
      const result = await service.findOne('member-1');

      // Assert
      expect(result).toEqual(MEMBER_FIXTURE);
      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 'member-1' } });
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
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE); // findOne check
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
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE); // findOne check
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
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE); // findOne check
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
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE);
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
