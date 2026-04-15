import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
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
