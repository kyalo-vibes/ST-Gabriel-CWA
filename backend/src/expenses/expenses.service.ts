import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.expense.findMany({ orderBy: { date: 'desc' } });
  }

  create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }
}
