import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrator')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('monthly-trends')
  getMonthlyTrends() {
    return this.reportsService.getMonthlyTrends();
  }

  @Get('top-contributors')
  getTopContributors() {
    return this.reportsService.getTopContributors();
  }

  @Get('outstanding')
  getOutstanding() {
    return this.reportsService.getOutstanding();
  }
}
