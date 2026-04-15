import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let mockPrisma: {
    member: { count: jest.Mock; findMany: jest.Mock };
    contribution: {
      aggregate: jest.Mock;
      findMany: jest.Mock;
      groupBy: jest.Mock;
    };
    expense: {
      aggregate: jest.Mock;
      findMany: jest.Mock;
    };
    contributionEvent: { count: jest.Mock };
    eventPayment: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    // Arrange — fresh mock object before every test so spy call counts never bleed
    mockPrisma = {
      member: { count: jest.fn(), findMany: jest.fn() },
      contribution: {
        aggregate: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      expense: {
        aggregate: jest.fn(),
        findMany: jest.fn(),
      },
      contributionEvent: { count: jest.fn() },
      eventPayment: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // getSummary()
  // -------------------------------------------------------------------------
  describe('getSummary()', () => {
    it('returns correct shape with totalMembers, totalIncome, totalExpenses, balance, activeEvents', async () => {
      // Arrange
      mockPrisma.member.count.mockResolvedValue(42);
      mockPrisma.contribution.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 300 } });
      mockPrisma.contributionEvent.count.mockResolvedValue(3);

      // Act
      const result = await service.getSummary();

      // Assert
      expect(result).toEqual({
        totalMembers: 42,
        totalIncome: 1000,
        totalExpenses: 300,
        balance: 700,
        activeEvents: 3,
      });
    });

    it('calculates balance as income minus expenses (income=1000, expenses=300 → balance=700)', async () => {
      // Arrange
      mockPrisma.member.count.mockResolvedValue(10);
      mockPrisma.contribution.aggregate.mockResolvedValue({ _sum: { amount: 1000 } });
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 300 } });
      mockPrisma.contributionEvent.count.mockResolvedValue(1);

      // Act
      const result = await service.getSummary();

      // Assert
      expect(result.balance).toBe(700);
    });

    it('defaults income and expenses to 0 when _sum.amount is null (no records)', async () => {
      // Arrange
      mockPrisma.member.count.mockResolvedValue(0);
      mockPrisma.contribution.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockPrisma.contributionEvent.count.mockResolvedValue(0);

      // Act
      const result = await service.getSummary();

      // Assert
      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.balance).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // getMonthlyTrends()
  // -------------------------------------------------------------------------
  describe('getMonthlyTrends()', () => {
    it('groups contributions and expenses by month label and returns { month, income, expenses } objects', async () => {
      // Arrange
      const contributions = [
        { amount: 500, date: new Date('2026-04-05') },
        { amount: 300, date: new Date('2026-04-20') },
        { amount: 200, date: new Date('2026-03-10') },
      ];
      const expenses = [
        { amount: 100, date: new Date('2026-04-15') },
      ];
      mockPrisma.contribution.findMany.mockResolvedValue(contributions);
      mockPrisma.expense.findMany.mockResolvedValue(expenses);

      // Act
      const result = await service.getMonthlyTrends();

      // Assert — April income = 500 + 300 = 800, expenses = 100; March income = 200, expenses = 0
      const april = result.find((r) => r.month.includes('Apr'));
      const march = result.find((r) => r.month.includes('Mar'));

      expect(april).toBeDefined();
      expect(april!.income).toBe(800);
      expect(april!.expenses).toBe(100);

      expect(march).toBeDefined();
      expect(march!.income).toBe(200);
      expect(march!.expenses).toBe(0);
    });

    it('returns empty array when no contributions or expenses exist', async () => {
      // Arrange
      mockPrisma.contribution.findMany.mockResolvedValue([]);
      mockPrisma.expense.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getMonthlyTrends();

      // Assert
      expect(result).toEqual([]);
    });

    it('handles expenses-only month with income defaulting to 0', async () => {
      // Arrange
      mockPrisma.contribution.findMany.mockResolvedValue([]);
      mockPrisma.expense.findMany.mockResolvedValue([
        { amount: 250, date: new Date('2026-04-10') },
      ]);

      // Act
      const result = await service.getMonthlyTrends();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].income).toBe(0);
      expect(result[0].expenses).toBe(250);
    });
  });

  // -------------------------------------------------------------------------
  // getTopContributors()
  // -------------------------------------------------------------------------
  describe('getTopContributors()', () => {
    it('returns top contributors with member info merged and { member, totalContributed } shape', async () => {
      // Arrange
      const groupByResult = [
        { memberId: 'member-1', _sum: { amount: 5000 } },
        { memberId: 'member-2', _sum: { amount: 3000 } },
      ];
      const members = [
        { id: 'member-1', name: 'Monicah Wambui', jumuia: 'ST_PETER' },
        { id: 'member-2', name: 'Mary Wanjiru', jumuia: 'ST_PAUL' },
      ];
      mockPrisma.contribution.groupBy.mockResolvedValue(groupByResult);
      mockPrisma.member.findMany.mockResolvedValue(members);

      // Act
      const result = await service.getTopContributors();

      // Assert
      expect(result).toEqual([
        { member: members[0], totalContributed: 5000 },
        { member: members[1], totalContributed: 3000 },
      ]);
    });

    it('calls groupBy on contributions with take: 10 for top 10 limit', async () => {
      // Arrange
      mockPrisma.contribution.groupBy.mockResolvedValue([]);
      mockPrisma.member.findMany.mockResolvedValue([]);

      // Act
      await service.getTopContributors();

      // Assert
      expect(mockPrisma.contribution.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('defaults totalContributed to 0 when _sum.amount is null', async () => {
      // Arrange
      const groupByResult = [{ memberId: 'member-1', _sum: { amount: null } }];
      const members = [{ id: 'member-1', name: 'Monicah Wambui', jumuia: 'ST_PETER' }];
      mockPrisma.contribution.groupBy.mockResolvedValue(groupByResult);
      mockPrisma.member.findMany.mockResolvedValue(members);

      // Act
      const result = await service.getTopContributors();

      // Assert
      expect(result[0].totalContributed).toBe(0);
    });

    it('returns empty array when no contributions exist', async () => {
      // Arrange
      mockPrisma.contribution.groupBy.mockResolvedValue([]);
      mockPrisma.member.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getTopContributors();

      // Assert
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // getOutstanding()
  // -------------------------------------------------------------------------
  describe('getOutstanding()', () => {
    it('returns pending payments grouped by member with totalOwed and events array', async () => {
      // Arrange
      const eventInfo = { id: 'event-1', title: 'Easter Fundraiser', dueDate: new Date('2026-05-01') };
      const memberInfo = { id: 'member-1', name: 'Monicah Wambui', phone: '+254701234567', jumuia: 'ST_PETER' };
      const payments = [
        { amountDue: 1000, amountPaid: 0, member: memberInfo, event: eventInfo },
        { amountDue: 500, amountPaid: 200, member: memberInfo, event: { ...eventInfo, id: 'event-2', title: 'Wedding Fund' } },
      ];
      mockPrisma.eventPayment.findMany.mockResolvedValue(payments);

      // Act
      const result = await service.getOutstanding();

      // Assert — one entry for member-1 with totalOwed = 1000 + 300 = 1300
      expect(result).toHaveLength(1);
      expect(result[0].member).toEqual(memberInfo);
      expect(result[0].totalOwed).toBe(1300);
      expect(result[0].events).toHaveLength(2);
    });

    it('sorts results by totalOwed descending', async () => {
      // Arrange
      const member1 = { id: 'member-1', name: 'Monicah Wambui', phone: '+254701234567', jumuia: 'ST_PETER' };
      const member2 = { id: 'member-2', name: 'Mary Wanjiru', phone: '+254702345678', jumuia: 'ST_PAUL' };
      const eventInfo = { id: 'event-1', title: 'Easter Fundraiser', dueDate: new Date('2026-05-01') };
      const payments = [
        { amountDue: 500, amountPaid: 0, member: member2, event: eventInfo },
        { amountDue: 2000, amountPaid: 0, member: member1, event: eventInfo },
      ];
      mockPrisma.eventPayment.findMany.mockResolvedValue(payments);

      // Act
      const result = await service.getOutstanding();

      // Assert — member1 (2000 owed) should come before member2 (500 owed)
      expect(result[0].member.id).toBe('member-1');
      expect(result[0].totalOwed).toBe(2000);
      expect(result[1].member.id).toBe('member-2');
      expect(result[1].totalOwed).toBe(500);
    });

    it('returns empty array when no pending payments exist', async () => {
      // Arrange
      mockPrisma.eventPayment.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getOutstanding();

      // Assert
      expect(result).toEqual([]);
    });

    it('correctly calculates amountOwed per event as amountDue minus amountPaid', async () => {
      // Arrange
      const memberInfo = { id: 'member-1', name: 'Monicah Wambui', phone: '+254701234567', jumuia: 'ST_PETER' };
      const eventInfo = { id: 'event-1', title: 'Easter Fundraiser', dueDate: new Date('2026-05-01') };
      const payments = [
        { amountDue: 1000, amountPaid: 400, member: memberInfo, event: eventInfo },
      ];
      mockPrisma.eventPayment.findMany.mockResolvedValue(payments);

      // Act
      const result = await service.getOutstanding();

      // Assert — partial payment: 1000 - 400 = 600 owed
      expect(result[0].totalOwed).toBe(600);
      expect(result[0].events[0].amountOwed).toBe(600);
    });
  });
});
