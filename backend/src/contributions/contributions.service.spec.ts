import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Shared fixture data
// ---------------------------------------------------------------------------
const MEMBER_FIXTURE = {
  id: 'member-1',
  name: 'Monicah Wambui',
};

const CONTRIBUTION_FIXTURE = {
  id: 'contrib-1',
  memberId: 'member-1',
  amount: 500,
  type: 'Monthly Contribution',
  date: new Date('2026-01-15'),
  reference: 'REF001',
  status: 'Completed',
  member: { name: 'Monicah Wambui' },
};

describe('ContributionsService', () => {
  let service: ContributionsService;
  let mockPrisma: {
    contribution: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    member: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Arrange — fresh mock object before every test
    mockPrisma = {
      contribution: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      member: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ContributionsService>(ContributionsService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns all contributions including member name via prisma include', async () => {
      // Arrange
      const contributions = [CONTRIBUTION_FIXTURE];
      mockPrisma.contribution.findMany.mockResolvedValue(contributions);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(contributions);
      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith({
        include: { member: { select: { name: true } } },
        orderBy: { date: 'desc' },
      });
    });
  });

  // -------------------------------------------------------------------------
  // findByMember(memberId)
  // -------------------------------------------------------------------------
  describe('findByMember(memberId)', () => {
    it('returns only contributions belonging to the given member', async () => {
      // Arrange
      const memberContributions = [CONTRIBUTION_FIXTURE];
      mockPrisma.contribution.findMany.mockResolvedValue(memberContributions);

      // Act
      const result = await service.findByMember('member-1');

      // Assert
      expect(result).toEqual(memberContributions);
      expect(mockPrisma.contribution.findMany).toHaveBeenCalledWith({
        where: { memberId: 'member-1' },
        orderBy: { date: 'desc' },
      });
    });

    it('returns an empty array when the member has no contributions', async () => {
      // Arrange
      mockPrisma.contribution.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findByMember('member-with-no-contribs');

      // Assert
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // create(dto)
  // -------------------------------------------------------------------------
  describe('create(dto)', () => {
    const createDto = {
      memberId: 'member-1',
      amount: 1000,
      type: 'Monthly Contribution',
      date: '2026-03-01',
      reference: 'REF002',
    };

    it('creates and returns a contribution when the member exists', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(MEMBER_FIXTURE);
      const createdContribution = {
        ...createDto,
        id: 'contrib-2',
        date: new Date(createDto.date),
        status: 'Completed',
      };
      mockPrisma.contribution.create.mockResolvedValue(createdContribution);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockPrisma.member.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.memberId },
      });
      expect(mockPrisma.contribution.create).toHaveBeenCalledWith({
        data: { ...createDto, date: new Date(createDto.date) },
      });
      expect(result).toEqual(createdContribution);
    });

    it('throws NotFoundException when the memberId does not exist', async () => {
      // Arrange
      mockPrisma.member.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create({ ...createDto, memberId: 'bad-member' })).rejects.toThrow(
        new NotFoundException('Member bad-member not found'),
      );
      expect(mockPrisma.contribution.create).not.toHaveBeenCalled();
    });
  });
});
