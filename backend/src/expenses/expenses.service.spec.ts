import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Shared fixture data
// ---------------------------------------------------------------------------
const EXPENSE_FIXTURE = {
  id: 'expense-1',
  description: 'Bereavement welfare payment',
  amount: 2000,
  category: 'Welfare',
  date: new Date('2026-02-10'),
  reference: 'EXP001',
  status: 'Completed',
};

describe('ExpensesService', () => {
  let service: ExpensesService;
  let mockPrisma: {
    expense: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    // Arrange — fresh mock object before every test
    mockPrisma = {
      expense: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);

    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // findAll()
  // -------------------------------------------------------------------------
  describe('findAll()', () => {
    it('returns all expenses ordered by date descending', async () => {
      // Arrange
      const expenses = [EXPENSE_FIXTURE, { ...EXPENSE_FIXTURE, id: 'expense-2', date: new Date('2026-01-05') }];
      mockPrisma.expense.findMany.mockResolvedValue(expenses);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(expenses);
      expect(mockPrisma.expense.findMany).toHaveBeenCalledWith({ orderBy: { date: 'desc' } });
    });

    it('returns an empty array when there are no expenses', async () => {
      // Arrange
      mockPrisma.expense.findMany.mockResolvedValue([]);

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
    const createDto = {
      description: 'Administrative supplies',
      amount: 500,
      category: 'Administrative',
      date: '2026-03-20',
      reference: 'EXP002',
    };

    it('creates and returns the expense with date converted to a Date object', async () => {
      // Arrange
      const createdExpense = {
        ...createDto,
        id: 'expense-3',
        date: new Date(createDto.date),
        status: 'Completed',
      };
      mockPrisma.expense.create.mockResolvedValue(createdExpense);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockPrisma.expense.create).toHaveBeenCalledWith({
        data: { ...createDto, date: new Date(createDto.date) },
      });
      expect(result).toEqual(createdExpense);
    });
  });
});
