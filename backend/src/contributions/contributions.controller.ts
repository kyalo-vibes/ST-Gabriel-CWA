import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Get()
  findAll() {
    return this.contributionsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('member/:id')
  findByMember(@Param('id') id: string, @Request() req) {
    if (req.user.role === 'Member' && req.user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.contributionsService.findByMember(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Administrator')
  @Post()
  create(@Body() dto: CreateContributionDto) {
    return this.contributionsService.create(dto);
  }
}
