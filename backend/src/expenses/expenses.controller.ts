import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }
}
