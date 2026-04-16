import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateScheduleConfigDto } from './dto/update-schedule-config.dto';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrator')
export class SchedulerController {
  constructor(private prisma: PrismaService) {}

  @Get('config')
  findAll() {
    return this.prisma.scheduleConfig.findMany({ orderBy: { id: 'asc' } });
  }

  @Patch('config/:id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleConfigDto) {
    return this.prisma.scheduleConfig.update({
      where: { id },
      data: dto,
    });
  }
}
